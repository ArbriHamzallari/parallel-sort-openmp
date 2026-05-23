import { langIcon } from './icons.js';

const LANGS = [
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'js', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
];

let lastLang = 'cpp';

/**
 * @param {HTMLElement} root
 * @param {import('../algorithms/index.js').AlgorithmMeta} algo
 */
export function renderImplementations(root, algo) {
  const paths = algo.implementations || {};
  const available = LANGS.filter((l) => paths[l.id]);

  root.innerHTML = `
    <section class="impl-section">
      <h2 class="section-heading">Implementations</h2>
      <div class="impl-box">
        <div class="impl-tabbar" role="tablist"></div>
        <div class="impl-code-wrap">
          <button type="button" class="copy-btn" id="copy-snippet">Copy</button>
          <pre class="impl-pre"><code id="impl-code"></code></pre>
        </div>
      </div>
    </section>
  `;

  const tabbar = root.querySelector('.impl-tabbar');
  const codeEl = root.querySelector('#impl-code');
  const copyBtn = root.querySelector('#copy-snippet');

  if (!available.length) {
    tabbar.innerHTML = '';
    codeEl.textContent = '// Code snippets are available for Bitonic, Sample Sort, and Radix.';
    return;
  }

  if (!available.some((l) => l.id === lastLang)) lastLang = available[0].id;

  for (const lang of available) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'impl-tab';
    btn.dataset.lang = lang.id;
    btn.title = lang.label;
    btn.setAttribute('role', 'tab');
    btn.innerHTML = langIcon(lang.id);
    if (lang.id === lastLang) btn.classList.add('active');
    btn.addEventListener('click', () => select(lang.id));
    tabbar.appendChild(btn);
  }

  async function select(langId) {
    lastLang = langId;
    tabbar.querySelectorAll('.impl-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === langId);
    });
    const path = `./src/algorithms/${paths[langId]}`;
    try {
      const res = await fetch(path);
      codeEl.textContent = res.ok ? await res.text() : `// Failed to load ${path}`;
    } catch {
      codeEl.textContent = `// Failed to load ${path}`;
    }
    if (window.Prism) {
      codeEl.className = `language-${langId === 'cpp' ? 'cpp' : langId === 'js' ? 'javascript' : langId}`;
      Prism.highlightElement(codeEl);
    }
  }

  copyBtn?.addEventListener('click', async () => {
    const text = codeEl.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1500);
    } catch {
      copyBtn.textContent = 'Failed';
    }
  });

  select(lastLang);
}
