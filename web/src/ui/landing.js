/** Home / landing page — original copy, parallel-sort focus. */

const PARALLEL_PICKS = [
  {
    id: 'bitonic',
    name: 'Bitonic Sort',
    blurb: 'A fixed comparison network — every stage runs in parallel.',
  },
  {
    id: 'sample',
    name: 'Sample Sort (PSRS)',
    blurb: 'Split by regular samples, then sort buckets independently.',
  },
  {
    id: 'radix',
    name: 'Radix Sort (LSD)',
    blurb: 'Digit passes with parallel histograms and scatter.',
  },
];

/**
 * @param {HTMLElement} root
 */
export function renderLanding(root) {
  root.innerHTML = `
    <div class="landing">
      <section class="hero" aria-label="Welcome">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="hero-brand">
          <div class="hero-brand-text">
            <span class="hero-line">PARALLEL</span>
            <span class="hero-line">SORT</span>
          </div>
          <span class="hero-accent-bar" aria-hidden="true"></span>
        </div>
      </section>

      <section class="landing-intro">
        <div class="landing-content">
          <h1 class="landing-title">Parallel Sorting Algorithms</h1>

          <p>
            Sorting is one of the first problems every computer science student meets — and one of the
            richest when you ask <em>how fast can we go on many cores?</em> This site visualizes
            compare-exchange steps, partition phases, and digit passes so you can <em>see</em> why
            bitonic networks, sample sort, and radix sort belong in a parallel programming course.
          </p>

          <p>
            A sorting algorithm is a procedure that rearranges a collection into non-decreasing order.
            We measure cost with <a class="text-link" href="https://en.wikipedia.org/wiki/Big_O_notation" target="_blank" rel="noopener">asymptotic notation</a>:
            how comparisons or passes grow when the input size <em>n</em> increases, and — for our
            focus — how many <strong>parallel steps</strong> a synchronized machine needs.
          </p>

          <p>
            Classic serial sorts (bubble, quick, merge, …) are included for contrast. The headline
            here is the <strong>Parallel</strong> group: algorithms whose structure maps cleanly to
            threads, stages, or buckets.
          </p>

          <p>Two complexity families show up again and again:</p>

          <ul class="complexity-list">
            <li>
              <strong>Logarithmic / polylog</strong>
              <span>
                Work often scales like <em>n</em> times a small power of <em>log n</em> — for example
                bitonic sort does Θ(<em>n</em> log² <em>n</em>) comparisons but only Θ(log² <em>n</em>)
                parallel stages. Sample sort targets Θ(<em>n</em> log <em>n</em>) work with balanced
                buckets when splitters are chosen well.
              </span>
            </li>
            <li>
              <strong>Linear in passes</strong>
              <span>
                Radix sort (LSD) repeats a stable counting pass per digit. With <em>d</em> passes the
                work is Θ(<em>d</em> · <em>n</em>), and each pass parallelizes over chunks and bucket
                histograms — no element-to-element comparisons at all.
              </span>
            </li>
          </ul>

          <p>
            Every algorithm page lets you shuffle data, press play, hear pitch-mapped tones, and read
            complexity tables plus copy-pasteable implementations in several languages — sourced from
            this repository’s own C++ code.
          </p>

          <div class="cta-wrap">
            <a href="#explore" class="btn-sorts">Explore sorts</a>
          </div>
        </div>
      </section>

      <section id="explore" class="landing-explore">
        <div class="landing-content">
          <h2 class="landing-subtitle">Choose an algorithm</h2>
          <p class="landing-muted">
            Open the menu anytime, or jump straight into one of the three parallel sorts from our
            OpenMP mini-project.
          </p>
          <div class="algo-cards">
            ${PARALLEL_PICKS.map(
              (a) => `
              <a href="#/${a.id}" class="algo-card">
                <span class="algo-card-name">${a.name}</span>
                <span class="algo-card-blurb">${a.blurb}</span>
              </a>`,
            ).join('')}
          </div>
          <p class="landing-muted landing-menu-hint">
            Classic comparison sorts (bubble, quick, merge, …) live in the <strong>Classic</strong>
            section of the menu.
          </p>
        </div>
      </section>
    </div>
  `;
}
