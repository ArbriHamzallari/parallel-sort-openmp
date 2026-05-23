import { Recorder } from '../../core/ops.js';

/** @param {number[]} array */
export function heapSort(array) {
  const rec = new Recorder(array);
  const a = rec.array;
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) heapify(rec, a, n, i);
  for (let end = n - 1; end > 0; end--) {
    rec.swap(0, end);
    rec.done(end);
    heapify(rec, a, end, 0);
  }
  rec.done(0);
  return rec.finish();
}

/** @param {Recorder} rec @param {number[]} a @param {number} n @param {number} i */
function heapify(rec, a, n, i) {
  let largest = i;
  const l = 2 * i + 1;
  const r = 2 * i + 2;
  if (l < n) {
    rec.compare(l, largest);
    if (a[l] > a[largest]) largest = l;
  }
  if (r < n) {
    rec.compare(r, largest);
    if (a[r] > a[largest]) largest = r;
  }
  if (largest !== i) {
    rec.swap(i, largest);
    heapify(rec, a, n, largest);
  }
}
