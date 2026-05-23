import { Recorder } from '../../core/ops.js';

/** @param {number[]} array */
export function insertionSort(array) {
  const rec = new Recorder(array);
  const a = rec.array;
  const n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      rec.compare(j - 1, j);
      if (a[j - 1] <= a[j]) break;
      rec.swap(j - 1, j);
      j--;
    }
    rec.done(i);
  }
  return rec.finish();
}
