import { Recorder } from '../core/ops.js';
import { nextPow2 } from '../util/arrayGen.js';

/**
 * Bitonic sort on power-of-two length (pads with sentinels internally).
 * @param {number[]} array
 * @param {{ networkView?: boolean }} [opts]
 */
export function bitonicSort(array, opts = {}) {
  const n = array.length;
  const m = nextPow2(n);
  const padded = array.slice();
  const SENTINEL = Number.MAX_SAFE_INTEGER;
  while (padded.length < m) padded.push(SENTINEL);

  const rec = new Recorder(array);
  rec.array = padded;
  const a = rec.array;

  for (let k = 2; k <= m; k <<= 1) {
    for (let j = k >> 1; j > 0; j >>= 1) {
      rec.phase(`k=${k}, j=${j}`);

      if (opts.networkView) {
        for (let i = 0; i < m; i++) {
          const l = i ^ j;
          if (l > i) rec.mark(i, 'comparing');
        }
      }

      for (let i = 0; i < m; i++) {
        const l = i ^ j;
        if (l <= i) continue;
        const ascending = (i & k) === 0;
        rec.compare(i, l);
        const needSwap =
          (ascending && a[i] > a[l]) || (!ascending && a[i] < a[l]);
        if (needSwap) rec.swap(i, l);
      }

      if (opts.networkView) {
        for (let i = 0; i < m; i++) rec.unmark(i);
      }
    }
  }

  for (let i = 0; i < n; i++) rec.done(i);
  return rec.finish();
}

export function bitonicEffectiveSize(n) {
  return nextPow2(n);
}
