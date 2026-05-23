/** Bitonic sort — n should be a power of two (pad otherwise). */
export function bitonicSort(arr) {
  const n = arr.length;
  const m = nextPow2(n);
  const a = arr.slice();
  while (a.length < m) a.push(Number.MAX_SAFE_INTEGER);
  bitonicPow2(a, m);
  return a.slice(0, n);
}

function bitonicPow2(a, n) {
  for (let k = 2; k <= n; k <<= 1) {
    for (let j = k >> 1; j > 0; j >>= 1) {
      for (let i = 0; i < n; i++) {
        const l = i ^ j;
        if (l <= i) continue;
        const asc = (i & k) === 0;
        if ((asc && a[i] > a[l]) || (!asc && a[i] < a[l])) {
          [a[i], a[l]] = [a[l], a[i]];
        }
      }
    }
  }
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}
