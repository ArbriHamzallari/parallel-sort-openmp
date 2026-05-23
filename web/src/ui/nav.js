import { algorithms } from '../algorithms/index.js';

/**
 * @param {{ onSelect: (id: string) => void, onHome?: () => void }} opts
 */
export function initNav(opts) {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const btn = document.getElementById('nav-toggle');
  const list = document.getElementById('drawer-list');

  list.innerHTML = '';

  const homeLink = document.createElement('a');
  homeLink.href = '#/';
  homeLink.className = 'drawer-link drawer-link--home';
  homeLink.dataset.id = 'home';
  homeLink.textContent = 'Home';
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    opts.onHome?.();
    close();
  });
  list.appendChild(homeLink);

  const groups = ['Parallel', 'Classic'];
  for (const group of groups) {
    const heading = document.createElement('div');
    heading.className = 'drawer-group';
    heading.textContent = group;
    list.appendChild(heading);
    for (const algo of algorithms.filter((a) => a.group === group)) {
      const link = document.createElement('a');
      link.href = `#/${algo.id}`;
      link.className = 'drawer-link';
      link.dataset.id = algo.id;
      link.textContent = algo.name;
      if (algo.group === 'Classic') link.dataset.classic = '1';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        opts.onSelect(algo.id);
        close();
      });
      list.appendChild(link);
    }
  }

  function open() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    btn?.setAttribute('aria-expanded', 'true');
  }

  function close() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    btn?.setAttribute('aria-expanded', 'false');
  }

  btn?.addEventListener('click', () => {
    if (drawer?.classList.contains('open')) close();
    else open();
  });
  overlay?.addEventListener('click', close);

  return {
    setActive(id) {
      list?.querySelectorAll('.drawer-link').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === id);
      });
    },
    close,
  };
}
