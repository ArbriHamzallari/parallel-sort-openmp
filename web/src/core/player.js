import { Op, BarState } from './ops.js';

/**
 * Replays a precomputed op trace at a configurable speed.
 */
export class Player {
  /**
   * @param {{ renderer: import('./renderer.js').Renderer, audio: import('./audio.js').AudioEngine, onStats?: (s: object) => void, onPhase?: (t: string) => void, onDone?: () => void }} deps
   */
  constructor({ renderer, audio, onStats, onPhase, onDone }) {
    this.renderer = renderer;
    this.audio = audio;
    this.onStats = onStats || (() => {});
    this.onPhase = onPhase || (() => {});
    this.onDone = onDone || (() => {});

    /** @type {number[]} */
    this.snapshot = [];
    /** @type {import('./ops.js').Op[]} */
    this.ops = [];
    /** @type {number[]} */
    this.live = [];
    /** @type {string[]} */
    this.states = [];
    this.index = 0;
    this.playing = false;
    this.speed = 120;
    this.comparisons = 0;
    this.writes = 0;
    this.phase = '';
    this._raf = 0;
    this._lastTs = 0;
    this._accum = 0;
    this._pendingLerp = false;
  }

  /**
   * @param {number[]} snapshot
   * @param {import('./ops.js').Op[]} ops
   */
  load(snapshot, ops) {
    this.pause();
    this.snapshot = snapshot.slice();
    this.ops = ops;
    this.live = snapshot.slice();
    this.states = snapshot.map(() => BarState.DEFAULT);
    this.index = 0;
    this.comparisons = 0;
    this.writes = 0;
    this.phase = '';
    this.renderer.pivotValue = null;
    this.renderer.setData(this.live, this.states);
    this.emitStats();
  }

  reset() {
    this.pause();
    this.live = this.snapshot.slice();
    this.states = this.snapshot.map(() => BarState.DEFAULT);
    this.index = 0;
    this.comparisons = 0;
    this.writes = 0;
    this.phase = '';
    this.renderer.pivotValue = null;
    this.renderer.setData(this.live, this.states);
    this.emitStats();
  }

  play() {
    if (this.index >= this.ops.length) this.reset();
    this.playing = true;
    this._lastTs = performance.now();
    this._accum = 0;
    this._tick();
  }

  pause() {
    this.playing = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  }

  step() {
    if (this.index >= this.ops.length) return;
    this.applyOp(this.ops[this.index++]);
    this.renderer.setData(this.live, this.states);
    this.emitStats();
    if (this.index >= this.ops.length) this.onDone();
  }

  /** @param {number} idx */
  seekTo(idx) {
    this.pause();
    this.live = this.snapshot.slice();
    this.states = this.snapshot.map(() => BarState.DEFAULT);
    this.index = 0;
    this.comparisons = 0;
    this.writes = 0;
    this.renderer.pivotValue = null;
    const target = Math.max(0, Math.min(idx, this.ops.length));
    while (this.index < target) {
      this.applyOp(this.ops[this.index++]);
    }
    this.renderer.setData(this.live, this.states);
    this.emitStats();
  }

  _tick() {
    if (!this.playing) return;
    const now = performance.now();
    const dt = (now - this._lastTs) / 1000;
    this._lastTs = now;
    this._accum += dt * this.speed;
    this.audio.beginFrame();

    let steps = Math.floor(this._accum);
    if (steps < 1) steps = 1;
    this._accum -= steps;

    const maxV = Math.max(...this.live, 1);
    for (let s = 0; s < steps && this.index < this.ops.length; s++) {
      if (this._pendingLerp && this.renderer.tickLerp(0.35)) {
        this.renderer.draw();
        break;
      }
      const op = this.ops[this.index++];
      const isSwap = op.t === Op.SWAP;
      this.applyOp(op);
      if (isSwap) {
        this.renderer.startSwapLerp(op.i, op.j);
        this._pendingLerp = true;
        this.audio.play(this.live[op.i], maxV);
        this.renderer.setData(this.live, this.states);
        break;
      }
      this.renderer.setData(this.live, this.states);
    }

    if (this._pendingLerp) {
      if (this.renderer.tickLerp(0.22)) {
        this.renderer.draw();
      } else {
        this._pendingLerp = false;
      }
    }

    if (this.index >= this.ops.length && !this._pendingLerp) {
      this.playing = false;
      this.onDone();
      this.emitStats();
      return;
    }

    this.emitStats();
    this._raf = requestAnimationFrame(() => this._tick());
  }

  /** @param {import('./ops.js').Op} op */
  applyOp(op) {
    const maxV = Math.max(...this.live, 1);
    switch (op.t) {
      case Op.COMPARE:
        this.comparisons++;
        this._flash(op.i, op.j, BarState.COMPARING);
        this.audio.play(this.live[op.i], maxV);
        break;
      case Op.SWAP: {
        this.writes++;
        const t = this.live[op.i];
        this.live[op.i] = this.live[op.j];
        this.live[op.j] = t;
        this._flash(op.i, op.j, BarState.SWAPPING);
        break;
      }
      case Op.SET:
        this.writes++;
        this.live[op.i] = op.value;
        this.states[op.i] = BarState.WRITING;
        this.audio.play(op.value, maxV);
        break;
      case Op.MARK:
        this.states[op.i] = op.state;
        break;
      case Op.UNMARK:
        this.states[op.i] = BarState.DEFAULT;
        break;
      case Op.RANGE:
        for (let k = op.lo; k <= op.hi; k++) this.states[k] = op.state;
        break;
      case Op.PIVOT:
        if (op.value !== undefined) this.renderer.pivotValue = op.value;
        else this.renderer.pivotValue = this.live[op.i];
        break;
      case Op.PHASE:
        this.phase = op.text;
        this.onPhase(op.text);
        break;
      case Op.DONE:
        if (op.lo !== undefined && op.hi !== undefined) {
          for (let k = op.lo; k <= op.hi; k++) this.states[k] = BarState.SORTED;
        } else if (op.i !== undefined) {
          this.states[op.i] = BarState.SORTED;
        } else {
          this.states.fill(BarState.SORTED);
        }
        break;
      default:
        break;
    }
  }

  _flash(i, j, state) {
    const prevI = this.states[i];
    const prevJ = this.states[j];
    if (prevI !== BarState.SORTED) this.states[i] = state;
    if (prevJ !== BarState.SORTED) this.states[j] = state;
  }

  emitStats() {
    this.onStats({
      comparisons: this.comparisons,
      writes: this.writes,
      phase: this.phase,
      progress: this.ops.length ? this.index / this.ops.length : 0,
      index: this.index,
      total: this.ops.length,
    });
  }

  /** Dev assertion: live array matches sorted snapshot. */
  verifySorted() {
    const sorted = this.snapshot.slice().sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (this.live[i] !== sorted[i]) {
        console.error('Sort verification failed at', i, this.live[i], 'expected', sorted[i]);
        return false;
      }
    }
    return true;
  }
}
