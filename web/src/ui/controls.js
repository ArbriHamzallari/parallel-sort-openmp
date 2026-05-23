import { iconShuffle, iconPlay, iconPause } from './icons.js';

/**
 * @param {HTMLElement} root
 * @param {{ onShuffle: () => void, onPlayPause: () => boolean, onElements: (n: number) => void, onSpeed: (v: number) => void, onDistribution: (d: string) => void, onProcessors: (p: number) => void, onStep?: () => void }} handlers
 * @param {import('../algorithms/index.js').AlgorithmMeta} algo
 */
export function renderControls(root, handlers, algo) {
  root.innerHTML = `
    <section class="algo-viz-section" aria-label="Sorting visualization">
      <div class="algo-viz-inner">
        <header class="viz-headrow">
          <h1 class="algo-title"></h1>
          <div class="viz-controls">
            <button type="button" class="icon-square" id="btn-shuffle" aria-label="Shuffle">${iconShuffle}</button>
            <button type="button" class="icon-square" id="btn-play" aria-label="Play">${iconPlay}</button>
            <label class="elements-control">
              <span class="elements-label">Elements: <strong id="elements-val">32</strong></span>
              <input type="range" id="elements" class="elements-slider" min="8" max="256" value="32" aria-label="Number of elements" />
            </label>
          </div>
        </header>
      </div>
      <div class="viz-canvas-wrap">
        <canvas id="viz-canvas"></canvas>
        <p id="phase-banner" class="phase-banner" aria-live="polite"></p>
      </div>
    </section>
    <div class="controls-row">
      <label>Speed <input type="range" id="speed" min="10" max="800" value="120" /></label>
      <label>Distribution
        <select id="distribution">
          <option value="random">Random</option>
          <option value="nearly">Nearly sorted</option>
          <option value="reversed">Reversed</option>
        </select>
      </label>
      <label id="processors-wrap" class="hidden">Processors
        <select id="processors">
          <option value="2">2</option>
          <option value="4" selected>4</option>
          <option value="8">8</option>
        </select>
      </label>
      <button type="button" class="btn btn-ghost" id="btn-step">Step</button>
      <p id="stats-line" class="stats-line"></p>
    </div>
    <p id="pow2-note" class="pow2-note hidden">Bitonic sort uses power-of-two sizes (padded internally).</p>
  `;

  const title = root.querySelector('.algo-title');
  if (title) title.textContent = algo.name;

  const procWrap = root.querySelector('#processors-wrap');
  if (algo.hasProcessors) procWrap?.classList.remove('hidden');
  else procWrap?.classList.add('hidden');

  const pow2Note = root.querySelector('#pow2-note');
  if (algo.pow2Only) pow2Note?.classList.remove('hidden');
  else pow2Note?.classList.add('hidden');

  const playBtn = root.querySelector('#btn-play');
  const shuffleBtn = root.querySelector('#btn-shuffle');
  const elements = root.querySelector('#elements');
  const elementsVal = root.querySelector('#elements-val');
  const speed = root.querySelector('#speed');
  const dist = root.querySelector('#distribution');
  const proc = root.querySelector('#processors');
  const stepBtn = root.querySelector('#btn-step');

  shuffleBtn?.addEventListener('click', () => handlers.onShuffle());
  playBtn?.addEventListener('click', () => {
    const playing = handlers.onPlayPause();
    setPlayLabel(playing);
  });
  stepBtn?.addEventListener('click', () => handlers.onStep?.());
  elements?.addEventListener('input', () => {
    if (elementsVal) elementsVal.textContent = elements.value;
    handlers.onElements(Number(elements.value));
  });
  speed?.addEventListener('input', () => handlers.onSpeed(Number(speed.value)));
  dist?.addEventListener('change', () => handlers.onDistribution(dist.value));
  proc?.addEventListener('change', () => handlers.onProcessors(Number(proc.value)));

  function setPlayLabel(playing) {
    if (!playBtn) return;
    playBtn.innerHTML = playing ? iconPause : iconPlay;
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  return {
    setPlayLabel,
    getElements: () => Number(elements?.value || 32),
    getSpeed: () => Number(speed?.value || 120),
    getDistribution: () => dist?.value || 'random',
    getProcessors: () => Number(proc?.value || 4),
  };
}
