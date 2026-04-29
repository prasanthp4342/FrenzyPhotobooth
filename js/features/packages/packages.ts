// @ts-check

/**
 * @typedef {Object} PackageCard
 * @property {string} id
 * @property {string} name
 * @property {string} price
 * @property {string} duration
 * @property {string} imageUrl
 * @property {string[]} highlights
 */

const FALLBACK_IMAGES = {
  basic: new URL('../../../assets/images/package-basic.svg', import.meta.url).href,
  advanced: new URL('../../../assets/images/package-advanced.svg', import.meta.url)
    .href,
  premier: new URL('../../../assets/images/package-premier.svg', import.meta.url).href,
};

/** @param {PackageCard} pkg */
function createPackageCard(pkg) {
  const anchor = document.createElement('a');
  anchor.href = '#contact';
  anchor.className = 'package-card';
  anchor.dataset.tier = pkg.id;
  anchor.setAttribute('aria-label', `Choose ${pkg.name} package`);

  const image = document.createElement('img');
  image.className = 'package-card__image';
  image.src = pkg.imageUrl;
  image.alt = `${pkg.name} Package`;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    image.src = FALLBACK_IMAGES[pkg.id] || FALLBACK_IMAGES.basic;
  });

  const content = document.createElement('div');
  content.className = 'package-card__content';

  const header = document.createElement('div');
  header.className = 'package-card__header';

  const meta = document.createElement('div');
  meta.className = 'package-card__meta';

  const badge = document.createElement('span');
  badge.className = 'package-card__badge';
  badge.textContent = `${pkg.name} Package`;

  const name = document.createElement('h3');
  name.className = 'package-card__title';
  name.textContent = pkg.name;

  const duration = document.createElement('p');
  duration.className = 'package-card__duration';
  duration.textContent = pkg.duration;

  const price = document.createElement('p');
  price.className = 'package-card__price';
  price.textContent = pkg.price;

  meta.append(badge, duration);
  header.append(meta, name, price);

  const list = document.createElement('ul');
  list.className = 'package-card__features';
  pkg.highlights.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });

  const cta = document.createElement('span');
  cta.className = 'package-card__cta';
  cta.textContent = 'Book This Package';

  content.append(header, list, cta);
  anchor.appendChild(image);
  anchor.appendChild(content);
  return anchor;
}

/** @returns {PackageCard[]} */
function getFallbackPackages() {
  return [
    {
      id: 'basic',
      name: 'Basic',
      price: '$399',
      duration: '2 Hours',
      imageUrl: FALLBACK_IMAGES.basic,
      highlights: ['Unlimited sessions', 'Digital gallery', 'Standard backdrop'],
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: '$599',
      duration: '3 Hours',
      imageUrl: FALLBACK_IMAGES.advanced,
      highlights: ['Unlimited sessions', 'Instant prints', 'Premium props'],
    },
    {
      id: 'premier',
      name: 'Premier',
      price: '$799',
      duration: '4 Hours',
      imageUrl: FALLBACK_IMAGES.premier,
      highlights: ['Everything in Advanced', 'Custom overlay', 'On-site attendant'],
    },
  ];
}

/** @param {HTMLElement} container @param {PackageCard[]} packages */
function renderPackageCards(container, packages) {
  container.textContent = '';
  const fragment = document.createDocumentFragment();
  packages.forEach((pkg) => {
    fragment.appendChild(createPackageCard(pkg));
  });
  container.appendChild(fragment);
}

export async function initPackages() {
  const container = document.getElementById('packages-grid');
  if (!container) return;

  renderPackageCards(container, getFallbackPackages());
}
