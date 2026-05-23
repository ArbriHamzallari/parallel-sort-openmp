import { algorithms } from './algorithms/index.js';
import { generateArray, nextPow2 } from './util/arrayGen.js';

function sorted(arr) {
  return arr.slice().sort((a, b) => a - b);
}

let failed = 0;
for (const algo of algorithms) {
  for (const n of [8, 16, 32, 64]) {
    const size = algo.pow2Only ? nextPow2(n) : n;
    const input = generateArray(size, 'random');
    const { ops, snapshot } = algo.run(input, { processors: 4 });
    const a = snapshot.slice();
    for (const op of ops) {
      if (op.t === 'SWAP') {
        const t = a[op.i];
        a[op.i] = a[op.j];
        a[op.j] = t;
      } else if (op.t === 'SET') {
        a[op.i] = op.value;
      }
    }
    const expect = sorted(snapshot);
    const ok = a.every((v, i) => v === expect[i]);
    if (!ok) {
      console.error('FAIL', algo.id, 'n=', size);
      failed++;
    }
  }
}
if (failed) {
  console.error(failed, 'cases failed');
  process.exit(1);
}
console.log('All', algorithms.length, 'algorithms passed verification.');
