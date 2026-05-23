import { Recorder } from '../../core/ops.js';

/** @param {number[]} array */
export function quickSort(array) {
  const rec = new Recorder(array);
  const a = rec.array;
  sortRange(rec, a, 0, a.length - 1);
  rec.done(0, a.length - 1);
  return rec.finish();
}

/** @param {Recorder} rec @param {number[]} a @param {number} lo @param {number} hi */
function sortRange(rec, a, lo, hi) {
  if (lo >= hi) {
    if (lo === hi) rec.done(lo);
    return;
  }
  const p = partition(rec, a, lo, hi);
  rec.done(p);
  sortRange(rec, a, lo, p - 1);
  sortRange(rec, a, p + 1, hi);
}

/** @param {Recorder} rec @param {number[]} a @param {number} lo @param {number} hi */
function partition(rec, a, lo, hi) {
  const pivot = a[hi];
  rec.pivot(hi);
  let i = lo;
  for (let j = lo; j < hi; j++) {
    rec.compare(j, hi);
    if (a[j] < pivot) {
      if (i !== j) rec.swap(i, j);
      i++;
    }
  }
  if (i !== hi) rec.swap(i, hi);
  return i;
}
