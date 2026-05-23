/** @param {string} text */
function linkAlgorithmNames(text) {
  const terms = [
    ['merge sort', 'merge'],
    ['Merge Sort', 'merge'],
    ['sample sort', 'sample'],
    ['Sample Sort', 'sample'],
    ['radix sort', 'radix'],
    ['Radix Sort', 'radix'],
    ['bitonic sort', 'bitonic'],
    ['Bitonic Sort', 'bitonic'],
    ['quick sort', 'quick'],
    ['Quick Sort', 'quick'],
    ['bubble sort', 'bubble'],
    ['Bubble Sort', 'bubble'],
  ];
  let html = text;
  for (const [label, id] of terms) {
    const re = new RegExp(`\\b(${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'g');
    html = html.replace(re, `<a class="algo-link" href="#/${id}">$1</a>`);
  }
  return html;
}

/**
 * @param {HTMLElement} root
 * @param {import('../algorithms/index.js').AlgorithmMeta} algo
 */
export function renderInfoPanel(root, algo) {
  const c = algo.complexity;
  const rows = [
    ['Average Complexity', c.time.avg],
    ['Best Case', c.time.best],
    ['Worst Case', c.time.worst],
  ];
  if (algo.parallel && c.parallelTime) {
    rows.push(['Parallel Time', `<span class="parallel-val">${c.parallelTime}</span>`]);
  }
  rows.push(['Space Complexity', c.space]);

  const note = c.note ? `<p class="complexity-note">${c.note}</p>` : '';
  const stableNote =
    c.stable !== undefined
      ? `<p class="complexity-note">Stable: ${c.stable ? 'Yes' : 'No'}${c.work ? ` · Work: ${c.work}` : ''}</p>`
      : '';

  root.innerHTML = `
    <section class="info-grid">
      <div class="info-col info-col--desc">
        <h2 class="section-heading">Description</h2>
        ${algo.description.map((p) => `<p>${linkAlgorithmNames(p)}</p>`).join('')}
      </div>
      <div class="info-col info-col--complexity">
        <h2 class="section-heading">Complexity</h2>
        <table class="complexity-table">
          <tbody>
            ${rows.map(([label, val]) => `<tr><th>${label}</th><td>${val}</td></tr>`).join('')}
          </tbody>
        </table>
        ${note}
        ${stableNote}
      </div>
    </section>
  `;
}
