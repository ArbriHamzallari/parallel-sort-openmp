/** @param {number} n */
export function nextPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/** @param {number} n */
export function prevPow2(n) {
  let p = 1;
  while (p * 2 <= n) p <<= 1;
  return p;
}

/**
 * @param {number} n
 * @param {'random' | 'nearly' | 'reversed'} dist
 */
export function generateArray(n, dist = 'random') {
  const arr = Array.from({ length: n }, (_, i) => i);
  if (dist === 'reversed') {
    arr.reverse();
    return arr;
  }
  if (dist === 'nearly') {
    fisherYates(arr);
    for (let i = 0; i < Math.max(1, Math.floor(n * 0.05)); i++) {
      const a = (Math.random() * n) | 0;
      const b = (Math.random() * n) | 0;
      [arr[a], arr[b]] = [arr[b], arr[a]];
    }
    return arr;
  }
  fisherYates(arr);
  return arr;
}

/** @param {number[]} arr */
function fisherYates(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
