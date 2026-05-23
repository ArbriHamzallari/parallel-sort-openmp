import { BarState } from './ops.js';

const STATE_COLORS = {
  [BarState.DEFAULT]: null,
  [BarState.COMPARING]: 'var(--comparing)',
  [BarState.SWAPPING]: 'var(--hot)',
  [BarState.WRITING]: 'var(--hot)',
  [BarState.SORTED]: 'var(--ok)',
  [BarState.PIVOT]: 'var(--pivot)',
};

const SEGMENT_HUES = [200, 280, 40, 160, 320, 60, 240, 20];

/**
 * Canvas bar renderer with smooth swap interpolation.
 */
export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    /** @type {number[]} */
    this.values = [];
    /** @type {string[]} */
    this.states = [];
    /** @type {{ from: number, to: number, progress: number } | null} */
    this.lerp = null;
    this.rainbow = false;
    this.pivotValue = null;
    this._dpr = 1;
    this._w = 0;
    this._h = 0;

    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(canvas);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this._dpr = window.devicePixelRatio || 1;
    this._w = Math.max(1, rect.width);
    this._h = Math.max(1, rect.height);
    this.canvas.width = Math.floor(this._w * this._dpr);
    this.canvas.height = Math.floor(this._h * this._dpr);
    this.ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
  }

  /**
   * @param {number[]} values
   * @param {string[]} [states]
   */
  setData(values, states) {
    this.values = values.slice();
    this.states = states ? states.slice() : values.map(() => BarState.DEFAULT);
    this.lerp = null;
    this.draw();
  }

  /** @param {number} i @param {number} j */
  startSwapLerp(i, j) {
    this.lerp = { from: i, to: j, progress: 0 };
  }

  tickLerp(dt = 0.18) {
    if (!this.lerp) return false;
    this.lerp.progress += dt;
    if (this.lerp.progress >= 1) {
      this.lerp = null;
      return false;
    }
    return true;
  }

  draw() {
    const ctx = this.ctx;
    const w = this._w;
    const h = this._h;
    const n = this.values.length;
    if (!n) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    ctx.clearRect(0, 0, w, h);
    const gap = n > 200 ? 0 : n > 80 ? 1 : 2;
    const barW = (w - gap * (n - 1)) / n;
    const maxV = Math.max(...this.values, 1);

    const styles = getComputedStyle(document.documentElement);
    const comparing = styles.getPropertyValue('--comparing').trim() || '#3ec5ff';
    const hot = styles.getPropertyValue('--hot').trim() || '#ffce4a';
    const ok = styles.getPropertyValue('--ok').trim() || '#39d98a';
    const pivot = styles.getPropertyValue('--pivot').trim() || '#ff4d8d';

    for (let i = 0; i < n; i++) {
      let val = this.values[i];
      let x = i * (barW + gap);
      const state = this.states[i] || BarState.DEFAULT;

      if (this.lerp) {
        const { from, to, progress } = this.lerp;
        const t = easeOutCubic(Math.min(1, progress));
        if (i === from) {
          const otherVal = this.values[to];
          val = val + (otherVal - val) * t;
        } else if (i === to) {
          const otherVal = this.values[from];
          val = val + (otherVal - val) * t;
        }
      }

      const barH = (val / maxV) * (h - 8);
      const y = h - barH;

      if (state.startsWith('segment-') || state.startsWith('bucket-')) {
        const idx = parseInt(state.split('-')[1], 10) || 0;
        const hue = SEGMENT_HUES[idx % SEGMENT_HUES.length];
        ctx.fillStyle = `hsl(${hue}, 65%, 52%)`;
      } else if (state === BarState.DEFAULT && !this.rainbow) {
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, `hsl(220, 5%, ${82 - 8 * (val / maxV)}%)`);
        grad.addColorStop(0.35, `hsl(220, 4%, ${62 - 14 * (val / maxV)}%)`);
        grad.addColorStop(1, `hsl(220, 6%, ${28 - 6 * (val / maxV)}%)`);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = barFill(state, val, maxV, this.rainbow, comparing, hot, ok);
      }

      roundRect(ctx, x, y, Math.max(1, barW), barH, 2);
      ctx.fill();

      if (state === BarState.COMPARING || state === BarState.SWAPPING) {
        ctx.shadowColor = state === BarState.COMPARING ? comparing : hot;
        ctx.shadowBlur = 12;
        ctx.shadowBlur = 0;
      }
    }

    if (this.pivotValue != null) {
      const yLine = h - (this.pivotValue / maxV) * (h - 8);
      ctx.strokeStyle = pivot;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yLine);
      ctx.lineTo(w, yLine);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  destroy() {
    this._ro.disconnect();
  }
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/** Monochrome metallic fill (canvas cannot use CSS gradients easily). */
function barFill(state, val, maxV, rainbow, comparing, hot, ok) {
  if (rainbow) {
    const hue = 258 - 258 * (val / maxV);
    return `hsl(${hue}, 78%, 60%)`;
  }
  if (state === BarState.COMPARING) return comparing;
  if (state === BarState.SWAPPING || state === BarState.WRITING) return hot;
  if (state === BarState.SORTED) return ok;
  const top = 210 - 40 * (val / maxV);
  const bot = 120 - 30 * (val / maxV);
  return `hsl(220, 8%, ${(top + bot) / 2}%)`;
}

/** @param {CanvasRenderingContext2D} ctx */
function roundRect(ctx, x, y, w, h, r) {
  if (h < 1) return;
  ctx.beginPath();
  const rad = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}
