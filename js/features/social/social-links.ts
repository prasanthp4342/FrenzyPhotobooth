// @ts-check

import { CONFIG } from '../../config/index.ts';

export function initSocialLinks() {
  const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONFIG.WHATSAPP_MESSAGE)}`;

  document.querySelectorAll('#whatsapp-link').forEach((el) => {
    if (el instanceof HTMLAnchorElement) el.href = whatsappUrl;
  });

  document.querySelectorAll('[data-social]').forEach((el) => {
    if (!(el instanceof HTMLAnchorElement)) return;
    const key = /** @type {'instagram' | 'tiktok' | 'facebook' | undefined} */ el.dataset.social;
    if (key && CONFIG.SOCIAL_URLS[key]) el.href = CONFIG.SOCIAL_URLS[key];
  });
}
