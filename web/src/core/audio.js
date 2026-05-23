/** Web Audio engine — procedural tones, pitch from bar value. */

const PEAK_GAIN = 0.08;
const NOTE_MS = 55;
const MAX_NOTES_PER_FRAME = 3;

export class AudioEngine {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    this.muted = false;
    this._notesThisFrame = 0;
  }

  get enabled() {
    return !this.muted && this.ctx !== null;
  }

  /** Call on first user gesture (Play / sound toggle). */
  async resume() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  beginFrame() {
    this._notesThisFrame = 0;
  }

  /**
   * @param {number} value
   * @param {number} maxValue
   */
  play(value, maxValue) {
    if (this.muted || !this.ctx || this._notesThisFrame >= MAX_NOTES_PER_FRAME) return;
    this._notesThisFrame++;

    const t0 = this.ctx.currentTime;
    const freq = 120 + (value / Math.max(1, maxValue)) * 1080;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(PEAK_GAIN, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + NOTE_MS / 1000);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + NOTE_MS / 1000 + 0.02);
  }
}
