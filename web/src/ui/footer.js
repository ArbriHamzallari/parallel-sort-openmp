/** Site footer — team, contact, references. */

const FOOTER = {
  team: ['Arbri Hamzallari', 'Drini Dalipaj', 'Christian Tasellari'],
  contacts: ['arbrihamzalari@outlook.com', 'drinidalipaj@gmail.com'],
  refs: [
    {
      label: 'GitHub',
      href: 'https://github.com/ArbriHamzallari/parallel-sort-openmp',
      icon: 'github',
    },
    {
      label: 'Wikipedia — Sorting algorithm',
      href: 'https://en.wikipedia.org/wiki/Sorting_algorithm',
      icon: 'wiki',
    },
  ],
};

const ICON_GITHUB = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;

const ICON_WIKI = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.09 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.73 0 12.09 0zm.15 2.77c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2-1.2-.54-1.2-1.2.54-1.2 1.2-1.2zM8.52 5.6h2.64l.22 5.04 2.2-5.04h2.47l-3.56 7.38 3.74 8.38h-2.58l-2.38-5.58-2.2 5.58H8.52l3.5-7.86L8.52 5.6z"/></svg>`;

/**
 * @param {HTMLElement} root
 */
export function renderFooter(root) {
  root.innerHTML = `
    <footer class="site-footer">
      <div class="footer-grid landing-content">
        <div class="footer-col">
          <h3 class="footer-heading">Parallel Sort</h3>
          <ul class="footer-list">
            ${FOOTER.team.map((name) => `<li>${name}</li>`).join('')}
          </ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading">Contacts</h3>
          <ul class="footer-list">
            ${FOOTER.contacts.map((name) => `<li>${name}</li>`).join('')}
          </ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading">Reference</h3>
          <ul class="footer-list footer-links">
            ${FOOTER.refs
              .map((r) => {
                const icon = r.icon === 'github' ? ICON_GITHUB : ICON_WIKI;
                return `<li><a href="${r.href}" target="_blank" rel="noopener">${icon}<span>${r.label}</span></a></li>`;
              })
              .join('')}
          </ul>
        </div>
      </div>
    </footer>
  `;
}
