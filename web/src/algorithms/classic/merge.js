import { Recorder } from '../../core/ops.js';

/** @param {number[]} array */
export function mergeSort(array) {
  const rec = new Recorder(array);
  const a = rec.array;
  const aux = a.slice();
  mergeSortRange(rec, a, aux, 0, a.length - 1);
  rec.done(0, a.length - 1);
  return rec.finish();
}

/** @param {Recorder} rec @param {number[]} a @param {number[]} aux @param {number} lo @param {number} hi */
function mergeSortRange(rec, a, aux, lo, hi) {
  if (lo >= hi) {
    if (lo === hi) rec.done(lo);
    return;
  }
  const mid = (lo + hi) >> 1;
  mergeSortRange(rec, a, aux, lo, mid);
  mergeSortRange(rec, a, aux, mid + 1, hi);
  merge(rec, a, aux, lo, mid, hi);
}

/** @param {Recorder} rec @param {number[]} a @param {number[]} aux @param {number} lo @param {number} mid @param {number} hi */
function merge(rec, a, aux, lo, mid, hi) {
  for (let k = lo; k <= hi; k++) aux[k] = a[k];
  let i = lo;
  let j = mid + 1;
  for (let k = lo; k <= hi; k++) {
    if (i <= mid && (j > hi || aux[i] <= aux[j])) {
      rec.compare(i, j <= hi ? j : i);
      if (a[k] !== aux[i]) rec.set(k, aux[i]);
      a[k] = aux[i++];
    } else {
      rec.compare(j, i);
      if (a[k] !== aux[j]) rec.set(k, aux[j]);
      a[k] = aux[j++];
    }
  }
}
