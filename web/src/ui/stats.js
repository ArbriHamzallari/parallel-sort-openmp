/**
 * @param {HTMLElement} el
 */
export function createStatsLine(el) {
  return {
    /** @param {{ comparisons: number, writes: number, phase: string, progress: number }} s */
    update(s) {
      const phase = s.phase ? ` · ${s.phase}` : '';
      el.textContent = `Comparisons: ${s.comparisons} · Writes: ${s.writes}${phase}`;
    },
  };
}
