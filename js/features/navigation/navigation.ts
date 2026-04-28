// @ts-check

export function initNavigation() {
  const toggle = /** @type {HTMLButtonElement | null} */ document.querySelector('.navbar__toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('navbar__menu--open', !open);
  });

  menu.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('navbar__menu--open');
    });
  });

  if (!('IntersectionObserver' in window)) return;

  const sections = document.querySelectorAll('section[id]');
  const links = menu.querySelectorAll('.navbar__link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('navbar__link--active'));
        const active = menu.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('navbar__link--active');
      });
    },
    { rootMargin: '-40% 0px -60% 0px' },
  );

  sections.forEach((s) => observer.observe(s));
}
