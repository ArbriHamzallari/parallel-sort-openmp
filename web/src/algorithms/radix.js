import { Recorder, bucketState } from '../core/ops.js';

const RADIX = 10;
const MAX_PASSES = 4;

/**
 * LSD radix sort (base 10) for visualization-friendly keys in [0, n).
 * @param {number[]} array
 */
export function radixSort(array) {
  const n = array.length;
  const rec = new Recorder(array);
  let a = rec.array.slice();
  let b = new Array(n);

  const maxVal = Math.max(...a, 1);
  const passes = Math.min(MAX_PASSES, Math.ceil(Math.log10(maxVal + 1)) || 1);

  for (let pass = 0; pass < passes; pass++) {
    const exp = pass;
    const loDigit = 0;
    const hiDigit = RADIX - 1;
    rec.phase(`Pass ${pass + 1}: digit ${loDigit}–${hiDigit} (10^${exp})`);

    for (let i = 0; i < n; i++) {
      const d = digitAt(a[i], exp);
      rec.mark(i, bucketState(d));
    }

    const count = new Array(RADIX).fill(0);
    for (let i = 0; i < n; i++) count[digitAt(a[i], exp)]++;

    const offset = new Array(RADIX).fill(0);
    let sum = 0;
    for (let d = 0; d < RADIX; d++) {
      offset[d] = sum;
      sum += count[d];
    }

    let dStart = 0;
    for (let d = 0; d < RADIX; d++) {
      if (count[d] > 0) {
        rec.range(dStart, dStart + count[d] - 1, bucketState(d));
        dStart += count[d];
      }
    }

    const run = offset.slice();
    for (let i = 0; i < n; i++) {
      const d = digitAt(a[i], exp);
      const pos = run[d]++;
      b[pos] = a[i];
    }

    for (let i = 0; i < n; i++) {
      if (a[i] !== b[i]) rec.set(i, b[i]);
    }
    a = rec.array.slice();
  }

  rec.done(0, n - 1);
  return rec.finish();
}

/** @param {number} v @param {number} exp */
function digitAt(v, exp) {
  return Math.floor(v / 10 ** exp) % RADIX;
}
