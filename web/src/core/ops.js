/** @typedef {{ t: string, [key: string]: unknown }} Op */

export const Op = {
  COMPARE: 'COMPARE',
  SWAP: 'SWAP',
  SET: 'SET',
  MARK: 'MARK',
  UNMARK: 'UNMARK',
  RANGE: 'RANGE',
  PIVOT: 'PIVOT',
  PHASE: 'PHASE',
  DONE: 'DONE',
};

/** Bar color states — renderer + legend share these keys. */
export const BarState = {
  DEFAULT: 'default',
  COMPARING: 'comparing',
  SWAPPING: 'swapping',
  WRITING: 'writing',
  SORTED: 'sorted',
  PIVOT: 'pivot',
};

export function segmentState(i) {
  return `segment-${i}`;
}

export function bucketState(i) {
  return `bucket-${i}`;
}

/**
 * Records sorting operations on an internal mutable copy of the array.
 */
export class Recorder {
  /**
   * @param {number[]} array
   */
  constructor(array) {
    this.array = array.slice();
    /** @type {Op[]} */
    this.ops = [];
    this.snapshot = array.slice();
  }

  /** @param {number} i */
  value(i) {
    return this.array[i];
  }

  /** @param {number} i @param {number} j */
  compare(i, j) {
    this.ops.push({ t: Op.COMPARE, i, j });
  }

  /** @param {number} i @param {number} j */
  swap(i, j) {
    this.ops.push({ t: Op.SWAP, i, j });
    const t = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = t;
  }

  /** @param {number} i @param {number} value */
  set(i, value) {
    this.ops.push({ t: Op.SET, i, value });
    this.array[i] = value;
  }

  /** @param {number} i @param {string} state */
  mark(i, state) {
    this.ops.push({ t: Op.MARK, i, state });
  }

  /** @param {number} i */
  unmark(i) {
    this.ops.push({ t: Op.UNMARK, i });
  }

  /** @param {number} lo @param {number} hi @param {string} state */
  range(lo, hi, state) {
    this.ops.push({ t: Op.RANGE, lo, hi, state });
  }

  /** @param {number} [i] @param {number} [value] */
  pivot(i, value) {
    if (value !== undefined) this.ops.push({ t: Op.PIVOT, value });
    else this.ops.push({ t: Op.PIVOT, i });
  }

  /** @param {string} text */
  phase(text) {
    this.ops.push({ t: Op.PHASE, text });
  }

  /** @param {number} [lo] @param {number} [hi] */
  done(lo, hi) {
    if (lo !== undefined && hi !== undefined) {
      this.ops.push({ t: Op.DONE, lo, hi });
    } else if (lo !== undefined) {
      this.ops.push({ t: Op.DONE, i: lo });
    } else {
      this.ops.push({ t: Op.DONE });
    }
  }

  finish() {
    return { ops: this.ops, snapshot: this.snapshot };
  }
}
