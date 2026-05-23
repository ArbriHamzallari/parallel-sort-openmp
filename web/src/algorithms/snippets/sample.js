/** Sample sort (PSRS) */
export function sampleSort(data, p = 4) {
  const n = data.length;
  if (n < 2 || p === 1) return data.slice().sort((a, b) => a - b);
  if (p > n) p = n;

  const a = data.slice();
  const start = Array.from({ length: p + 1 }, (_, i) => Math.floor((n * i) / p));

  for (let i = 0; i < p; i++) {
    const seg = a.slice(start[i], start[i + 1]).sort((x, y) => x - y);
    seg.forEach((v, k) => (a[start[i] + k] = v));
  }

  const samples = [];
  for (let i = 0; i < p; i++) {
    const len = start[i + 1] - start[i];
    for (let s = 0; s < p; s++) {
      const idx = start[i] + Math.floor((len * s) / p);
      if (idx < start[i + 1]) samples.push(a[idx]);
    }
  }
  samples.sort((x, y) => x - y);
  const pivots = [];
  for (let i = 1; i < p; i++) pivots.push(samples[Math.floor((samples.length * i) / p)]);

  const bnd = Array.from({ length: p }, () => Array(p + 1).fill(0));
  for (let i = 0; i < p; i++) {
    bnd[i][0] = start[i];
    for (let c = 0; c < p - 1; c++) {
      let k = start[i];
      while (k < start[i + 1] && a[k] <= pivots[c]) k++;
      bnd[i][c + 1] = k;
    }
    bnd[i][p] = start[i + 1];
  }

  const classStart = [0];
  for (let c = 0; c < p; c++) {
    let sz = 0;
    for (let i = 0; i < p; i++) sz += bnd[i][c + 1] - bnd[i][c];
    classStart.push(classStart[c] + sz);
  }

  const out = new Array(n);
  for (let c = 0; c < p; c++) {
    const bucket = [];
    for (let i = 0; i < p; i++)
      for (let k = bnd[i][c]; k < bnd[i][c + 1]; k++) bucket.push(a[k]);
    bucket.sort((x, y) => x - y);
    let pos = classStart[c];
    for (const v of bucket) out[pos++] = v;
  }
  return out;
}
