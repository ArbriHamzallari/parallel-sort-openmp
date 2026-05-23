import { Recorder, segmentState, bucketState } from '../core/ops.js';

/**
 * Sample sort (PSRS) — visualized in six labeled phases.
 * @param {number[]} array
 * @param {{ processors?: number }} [opts]
 */
export function sampleSort(array, opts = {}) {
  const n = array.length;
  let p = opts.processors ?? 4;
  if (p < 1) p = 1;
  if (n < 2 || p === 1) return insertionTrace(array);

  if (p > n) p = n;

  const rec = new Recorder(array);
  const data = rec.array;

  const start = Array.from({ length: p + 1 }, (_, i) => Math.floor((n * i) / p));

  rec.phase('1. Split into p segments');
  for (let i = 0; i < p; i++) {
    rec.range(start[i], start[i + 1] - 1, segmentState(i));
  }

  rec.phase('2. Local sort');
  for (let i = 0; i < p; i++) {
    insertionSortSegment(rec, data, start[i], start[i + 1]);
  }

  rec.phase('3. Regular samples');
  const samples = [];
  for (let i = 0; i < p; i++) {
    const len = start[i + 1] - start[i];
    for (let s = 0; s < p; s++) {
      const idx = start[i] + Math.floor((len * s) / p);
      if (idx < start[i + 1]) {
        samples.push(data[idx]);
        rec.mark(idx, 'pivot');
      }
    }
  }

  rec.phase('4. Choose pivots');
  samples.sort((a, b) => a - b);
  const pivots = [];
  for (let i = 1; i < p; i++) {
    const pv = samples[Math.floor((samples.length * i) / p)];
    pivots.push(pv);
    rec.pivot(undefined, pv);
  }

  rec.phase('5. Partition by pivots');
  /** @type {number[]} */
  const bucketOf = new Array(n);
  for (let i = 0; i < n; i++) {
    let c = 0;
    while (c < pivots.length && data[i] > pivots[c]) c++;
    bucketOf[i] = c;
    rec.mark(i, bucketState(c));
  }

  rec.phase('6. Gather & sort buckets');
  const frozen = data.slice();
  /** @type {number[]} */
  const out = new Array(n);
  let write = 0;
  for (let c = 0; c < p; c++) {
    const items = [];
    for (let i = 0; i < n; i++) {
      if (bucketOf[i] === c) items.push(frozen[i]);
    }
    items.sort((a, b) => a - b);
    for (const v of items) {
      out[write++] = v;
    }
  }

  for (let i = 0; i < n; i++) {
    if (data[i] !== out[i]) rec.set(i, out[i]);
    data[i] = out[i];
  }
  rec.done(0, n - 1);
  return rec.finish();
}

/** @param {Recorder} rec @param {number[]} a @param {number} lo @param {number} hi */
function insertionSortSegment(rec, a, lo, hi) {
  for (let i = lo + 1; i < hi; i++) {
    let j = i;
    while (j > lo) {
      rec.compare(j - 1, j);
      if (a[j - 1] <= a[j]) break;
      rec.swap(j - 1, j);
      j--;
    }
  }
}

/** @param {number[]} array */
function insertionTrace(array) {
  const rec = new Recorder(array);
  const a = rec.array;
  const n = a.length;
  rec.phase('Local sort (single processor)');
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      rec.compare(j - 1, j);
      if (a[j - 1] <= a[j]) break;
      rec.swap(j - 1, j);
      j--;
    }
  }
  rec.done(0, n - 1);
  return rec.finish();
}
