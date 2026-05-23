/** Inline SVG icons (original, not from reference assets). */

export const iconShuffle = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>`;

export const iconPlay = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;

export const iconPause = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;

export const iconSoundOn = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>`;

export const iconSoundOff = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><line x1="18" y1="8" x2="22" y2="16"/><line x1="22" y1="8" x2="18" y2="16"/></svg>`;

/** @param {string} id */
export function langIcon(id) {
  const icons = {
    c: '<span class="lang-badge lang-c">C</span>',
    cpp: '<span class="lang-badge lang-cpp">C++</span>',
    java: '<span class="lang-badge lang-java">Jv</span>',
    js: '<span class="lang-badge lang-js">JS</span>',
    python: '<span class="lang-badge lang-py">Py</span>',
  };
  return icons[id] || '';
}
