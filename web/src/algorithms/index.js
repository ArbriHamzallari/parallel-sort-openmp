import { bitonicSort } from './bitonic.js';
import { sampleSort } from './sampleSort.js';
import { radixSort } from './radix.js';
import { bubbleSort } from './classic/bubble.js';
import { insertionSort } from './classic/insertion.js';
import { quickSort } from './classic/quick.js';
import { mergeSort } from './classic/merge.js';
import { heapSort } from './classic/heap.js';

/** @typedef {import('../core/ops.js').Op} Op */

/**
 * @typedef {object} AlgorithmMeta
 * @property {string} id
 * @property {string} name
 * @property {'Parallel' | 'Classic'} group
 * @property {boolean} parallel
 * @property {string[]} description
 * @property {object} complexity
 * @property {Record<string, string>} implementations
 * @property {(array: number[], opts?: object) => { ops: Op[], snapshot: number[] }} run
 * @property {boolean} [pow2Only]
 * @property {boolean} [hasProcessors]
 */

/** @type {AlgorithmMeta[]} */
export const algorithms = [
  {
    id: 'bitonic',
    name: 'Bitonic Sort',
    group: 'Parallel',
    parallel: true,
    pow2Only: true,
    complexity: {
      time: { best: 'O(n log²n)', avg: 'O(n log²n)', worst: 'O(n log²n)' },
      parallelTime: 'O(log²n)',
      work: 'O(n log²n)',
      space: 'O(1) aux',
      stable: false,
    },
    description: [
      'Bitonic sort is a comparison-based sorting network: the sequence of compare-exchange steps is fixed and does not depend on the input order. That predictability is what makes it a staple parallel-programming example — every comparator in one stage touches disjoint indices, so the whole stage can run at once.',
      'The algorithm builds larger and larger bitonic sequences (first ascending, then descending, then merged) using nested loops over stage size k and compare distance j. On real hardware those inner compare loops are the parallel for-loops in our OpenMP code.',
      'It needs n to be a power of two (we pad with sentinels in the C++ version). Work is O(n log²n), higher than an optimal comparison sort, but the pattern is branch-free and embarrassingly parallel within each stage.',
    ],
    implementations: {
      c: 'snippets/bitonic.c',
      cpp: 'snippets/bitonic.cpp',
      java: 'snippets/bitonic.java',
      js: 'snippets/bitonic.js',
      python: 'snippets/bitonic.py',
    },
    run: bitonicSort,
  },
  {
    id: 'sample',
    name: 'Sample Sort (PSRS)',
    group: 'Parallel',
    parallel: true,
    hasProcessors: true,
    complexity: {
      time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)*' },
      parallelTime: 'O((n/p) log n)',
      work: 'O(n log n)',
      space: 'O(n)',
      stable: false,
      note: '* Degenerate when all keys land in one bucket.',
    },
    description: [
      'Sample sort — Parallel Sorting by Regular Sampling (PSRS) — partitions data using splitters chosen from regularly spaced samples. Each processor first sorts a local chunk, contributes samples, and a small set of global pivots splits the key range into buckets.',
      'Regular sampling guarantees no bucket holds more than about 2n/p elements, so load stays balanced for typical distributions. Each bucket is sorted independently and concatenated to form the final order.',
      'The visualization follows the five textbook phases: segment split, local sort, sample selection, pivot choice, partition, and gather. Processor count p controls how many colored segments and buckets you see.',
    ],
    implementations: {
      c: 'snippets/sample.c',
      cpp: 'snippets/sample.cpp',
      java: 'snippets/sample.java',
      js: 'snippets/sample.js',
      python: 'snippets/sample.py',
    },
    run: sampleSort,
  },
  {
    id: 'radix',
    name: 'Radix Sort (LSD)',
    group: 'Parallel',
    parallel: true,
    complexity: {
      time: { best: 'O(d·n)', avg: 'O(d·n)', worst: 'O(d·n)' },
      parallelTime: 'O(d·(n/p + r))',
      work: 'O(d·n)',
      space: 'O(n + r)',
      stable: true,
      note: 'd = digit passes, r = radix base.',
    },
    description: [
      'Least-significant-digit (LSD) radix sort is not comparison-based: it distributes keys by digits from least to most significant. Each pass is a stable counting sort, so earlier passes are preserved when later digits are processed.',
      'Our C++ code uses 8-bit digits (256 buckets) over four passes for 32-bit integers. Here we use base 10 so each pass is easy to see — bars are tinted by their current digit, then written into bucket ranges.',
      'Parallelism comes from private per-thread histograms and disjoint scatter regions each pass. Signed keys are mapped to unsigned order in the production code; this demo uses small non-negative integers in [0, n).',
    ],
    implementations: {
      c: 'snippets/radix.c',
      cpp: 'snippets/radix.cpp',
      java: 'snippets/radix.java',
      js: 'snippets/radix.js',
      python: 'snippets/radix.py',
    },
    run: radixSort,
  },
  {
    id: 'bubble',
    name: 'Bubble Sort',
    group: 'Classic',
    parallel: false,
    complexity: {
      time: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: true,
    },
    description: [
      'Bubble sort repeatedly walks the array, swapping adjacent out-of-order pairs. Larger values “bubble” toward the end each pass.',
      'It is simple to implement and animate but impractical for large n. Included as a baseline comparison sort.',
    ],
    implementations: {},
    run: bubbleSort,
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    group: 'Classic',
    parallel: false,
    complexity: {
      time: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: true,
    },
    description: [
      'Insertion sort grows a sorted prefix by inserting each next element into its correct position. It performs well on nearly sorted input.',
      'Sample sort uses insertion-style traces for local segment sorts in this visualizer.',
    ],
    implementations: {},
    run: insertionSort,
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    group: 'Classic',
    parallel: false,
    complexity: {
      time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
      space: 'O(log n)',
      stable: false,
    },
    description: [
      'Quicksort picks a pivot, partitions into less and greater, then recurses. In-place and cache-friendly in practice.',
      'Worst case is quadratic on adversarial input; randomized pivots help in production libraries.',
    ],
    implementations: {},
    run: quickSort,
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    group: 'Classic',
    parallel: false,
    complexity: {
      time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      stable: true,
    },
    description: [
      'Merge sort divides the array in half, sorts recursively, and merges sorted halves. Guaranteed O(n log n) and stable.',
      'The trace uses SET operations during merge to show values moving into place.',
    ],
    implementations: {},
    run: mergeSort,
  },
  {
    id: 'heap',
    name: 'Heap Sort',
    group: 'Classic',
    parallel: false,
    complexity: {
      time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(1)',
      stable: false,
    },
    description: [
      'Heap sort builds a max-heap, repeatedly extracts the maximum to the end, and heapifies the reduced prefix.',
      'In-place with O(n log n) worst case, but not stable and often slower than tuned quicksort on real data.',
    ],
    implementations: {},
    run: heapSort,
  },
];

/** @param {string} id */
export function getAlgorithm(id) {
  return algorithms.find((a) => a.id === id) || algorithms[0];
}

export const defaultAlgorithmId = 'bitonic';
