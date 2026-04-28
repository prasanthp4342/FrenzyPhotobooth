// @ts-check

import { fetchPackages } from '../../api/packages.ts';
import { CONFIG } from '../../config/index.ts';

/** @typedef {{ id: string, name: string, imageUrl: string }} PackageCard */

const FALLBACK_IMAGES = {
  basic: 'assets/images/package-basic.svg',
  advanced: 'assets/images/package-advanced.svg',
  premier: 'assets/images/package-premier.svg',
};

/** @param {PackageCard} pkg */
function createPackageCard(pkg) {
  const anchor = document.createElement('a');
  anchor.href = '#contact';
  anchor.className = 'package-card';

  const image = document.createElement('img');
  image.className = 'package-card__image';
  image.src = pkg.imageUrl;
  image.alt = `${pkg.name} Package`;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    image.src = FALLBACK_IMAGES[pkg.id] || FALLBACK_IMAGES.basic;
  });

  anchor.appendChild(image);
  return anchor;
}

/** @returns {PackageCard[]} */
function getFallbackPackages() {
  return [
    { id: 'basic', name: 'Basic', imageUrl: FALLBACK_IMAGES.basic },
    { id: 'advanced', name: 'Advanced', imageUrl: FALLBACK_IMAGES.advanced },
    { id: 'premier', name: 'Premier', imageUrl: FALLBACK_IMAGES.premier },
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

  container.innerHTML = '<div class="packages__loading">Loading packages...</div>';

  if (CONFIG.PACKAGES_API_URL.includes('YOUR_PACKAGES_SCRIPT_ID')) {
    renderPackageCards(container, getFallbackPackages());
    return;
  }

  try {
    const data = await fetchPackages();
    if (Array.isArray(data.packages) && data.packages.length > 0) {
      renderPackageCards(container, /** @type {PackageCard[]} */ data.packages);
    } else {
      renderPackageCards(container, getFallbackPackages());
    }
  } catch (err) {
    console.error('Failed to load packages:', err);
    renderPackageCards(container, getFallbackPackages());
  }
}
