import { getAlgorithm, defaultAlgorithmId } from './algorithms/index.js';
import { generateArray, nextPow2 } from './util/arrayGen.js';
import { Renderer } from './core/renderer.js';
import { AudioEngine } from './core/audio.js';
import { Player } from './core/player.js';
import { initNav } from './ui/nav.js';
import { renderControls } from './ui/controls.js';
import { renderInfoPanel } from './ui/infoPanel.js';
import { renderImplementations } from './ui/implementations.js';
import { createStatsLine } from './ui/stats.js';
import { iconSoundOn, iconSoundOff } from './ui/icons.js';
import { renderLanding } from './ui/landing.js';
import { renderFooter } from './ui/footer.js';

const app = document.getElementById('app');
const infoRoot = document.getElementById('info-panel');
const implRoot = document.getElementById('impl-panel');
const footerRoot = document.getElementById('site-footer');
const soundBtn = document.getElementById('sound-toggle');

const audio = new AudioEngine();
let currentRoute = '';
let controlsApi = null;
let player = null;
let renderer = null;
let runOpts = {};

const nav = initNav({
  onHome: () => {
    location.hash = '#/';
  },
  onSelect(id) {
    location.hash = `#/${id}`;
  },
});

renderFooter(footerRoot);

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, '').trim();
  const segment = hash.split('/')[0];
  if (!segment || segment === 'home') return { type: 'home' };
  if (getAlgorithm(segment)) return { type: 'algo', id: segment };
  return { type: 'home' };
}

function effectiveSize(algo, n) {
  if (algo.pow2Only) return nextPow2(n);
  return n;
}

function buildTrace(algo) {
  const n = effectiveSize(algo, controlsApi?.getElements() ?? 32);
  const dist = controlsApi?.getDistribution() ?? 'random';
  const array = generateArray(n, dist);
  runOpts = {};
  if (algo.hasProcessors) runOpts.processors = controlsApi?.getProcessors() ?? 4;
  return algo.run(array, runOpts);
}

function mountHome() {
  currentRoute = 'home';
  document.body.classList.add('is-home');
  document.body.classList.remove('is-algo');
  nav.setActive('home');
  document.title = 'Parallel Sort — Visualizer';
  player?.pause();
  player = null;
  renderer = null;
  controlsApi = null;

  renderLanding(app);
  if (infoRoot) infoRoot.innerHTML = '';
  if (implRoot) implRoot.innerHTML = '';
}

function mountPage(id) {
  currentRoute = id;
  document.body.classList.remove('is-home');
  document.body.classList.add('is-algo');
  const algo = getAlgorithm(id);
  nav.setActive(id);
  document.title = `${algo.name} — Parallel Sort`;

  app.innerHTML = '<div id="viz-root"></div>';
  const vizRoot = document.getElementById('viz-root');

  controlsApi = renderControls(
    vizRoot,
    {
      onShuffle: () => reshuffle(),
      onPlayPause: () => togglePlay(),
      onElements: () => reshuffle(),
      onSpeed: (v) => {
        if (player) player.speed = v;
      },
      onDistribution: () => reshuffle(),
      onProcessors: () => reshuffle(),
      onStep: () => {
        audio.resume();
        player?.step();
      },
    },
    algo,
  );

  const canvas = document.getElementById('viz-canvas');
  renderer = new Renderer(canvas);
  const statsEl = document.getElementById('stats-line');
  const phaseEl = document.getElementById('phase-banner');
  const stats = createStatsLine(statsEl);

  player = new Player({
    renderer,
    audio,
    onStats: (s) => stats.update(s),
    onPhase: (text) => {
      if (phaseEl) phaseEl.textContent = text || '';
    },
    onDone: () => {
      controlsApi?.setPlayLabel(false);
      const ok = player.verifySorted();
      if (!ok) console.warn(`[${algo.id}] sort verification failed`);
    },
  });

  player.speed = controlsApi.getSpeed();
  reshuffle(false);
  renderInfoPanel(infoRoot, algo);
  renderImplementations(implRoot, algo);
}

function reshuffle(recompute = true) {
  const algo = getAlgorithm(currentRoute);
  if (!recompute) {
    const { ops, snapshot } = buildTrace(algo);
    player.load(snapshot, ops);
    return;
  }
  player?.pause();
  controlsApi?.setPlayLabel(false);
  const { ops, snapshot } = buildTrace(algo);
  player.load(snapshot, ops);
}

async function togglePlay() {
  await audio.resume();
  if (player.playing) {
    player.pause();
    controlsApi?.setPlayLabel(false);
    return false;
  }
  if (player.index >= player.ops.length) player.reset();
  player.play();
  controlsApi?.setPlayLabel(true);
  return true;
}

function updateSoundBtn() {
  if (!soundBtn) return;
  soundBtn.innerHTML = audio.muted ? iconSoundOff : iconSoundOn;
  soundBtn.setAttribute('aria-label', audio.muted ? 'Sound off' : 'Sound on');
  soundBtn.setAttribute('aria-pressed', String(!audio.muted));
}

updateSoundBtn();

soundBtn?.addEventListener('click', async () => {
  audio.setMuted(!audio.muted);
  if (!audio.muted) await audio.resume();
  updateSoundBtn();
});

function handleRoute() {
  const route = parseRoute();
  if (route.type === 'home') {
    if (currentRoute !== 'home') mountHome();
    else nav.setActive('home');
    return;
  }
  if (route.type === 'algo' && route.id !== currentRoute) {
    mountPage(route.id);
  } else if (route.type === 'algo') {
    nav.setActive(route.id);
  }
}

window.addEventListener('hashchange', handleRoute);

if (!location.hash || location.hash === '#' || location.hash === '#/') {
  location.hash = '#/';
} else {
  handleRoute();
}
