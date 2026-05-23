/** LSD radix sort, base 10 (visualization-friendly). */
export function radixSort(data) {
  const n = data.length;
  if (n < 2) return data.slice();
  let a = data.slice();
  let b = new Array(n);
  const max = Math.max(...a);
  const passes = Math.max(1, Math.ceil(Math.log10(max + 1)));

  for (let pass = 0; pass < passes; pass++) {
    const count = Array(10).fill(0);
    for (let i = 0; i < n; i++) count[digit(a[i], pass)]++;
    const off = Array(10).fill(0);
    let sum = 0;
    for (let d = 0; d < 10; d++) {
      off[d] = sum;
      sum += count[d];
    }
    const run = off.slice();
    for (let i = 0; i < n; i++) {
      const d = digit(a[i], pass);
      b[run[d]++] = a[i];
    }
    [a, b] = [b, a];
    b = new Array(n);
  }
  return a;
}

function digit(v, pass) {
  return Math.floor(v / 10 ** pass) % 10;
}
