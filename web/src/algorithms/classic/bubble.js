import { Recorder } from '../../core/ops.js';

/** @param {number[]} array */
export function bubbleSort(array) {
  const rec = new Recorder(array);
  const a = rec.array;
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      rec.compare(j, j + 1);
      if (a[j] > a[j + 1]) {
        rec.swap(j, j + 1);
        swapped = true;
      }
    }
    rec.done(n - i - 1);
    if (!swapped) break;
  }
  for (let i = 0; i < n; i++) rec.done(i);
  return rec.finish();
}
