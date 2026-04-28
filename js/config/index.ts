// @ts-check

import { INTEGRATIONS_CONFIG } from './integrations.ts';
import { CONTACT_CONFIG } from './contact.ts';
import { SITE_CONFIG } from './site.ts';

/**
 * @typedef {{
 *   GOOGLE_APPS_SCRIPT_URL: string,
 *   PACKAGES_API_URL: string,
 *   TURNSTILE_SITE_KEY: string,
 *   FETCH_TIMEOUT_MS: number,
 *   WHATSAPP_NUMBER: string,
 *   WHATSAPP_MESSAGE: string,
 *   SOCIAL_URLS: {
 *     instagram: string,
 *     tiktok: string,
 *     facebook: string,
 *   }
 * }} AppConfig
 */

/** @type {AppConfig} */
const CONFIG = {
  ...INTEGRATIONS_CONFIG,
  ...CONTACT_CONFIG,
  ...SITE_CONFIG,
};

/** @param {unknown} value @param {string} key */
function ensureString(value, key) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid config: ${key} must be a non-empty string`);
  }
}

/** @param {unknown} value @param {string} key */
function ensureNumber(value, key) {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid config: ${key} must be a positive number`);
  }
}

/** @param {unknown} value @param {string} key */
function ensureUrl(value, key) {
  ensureString(value, key);
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    throw new Error(`Invalid config: ${key} must be a valid URL`);
  }
}

/** @param {AppConfig} config */
function validateConfig(config) {
  ensureUrl(config.GOOGLE_APPS_SCRIPT_URL, 'GOOGLE_APPS_SCRIPT_URL');
  ensureUrl(config.PACKAGES_API_URL, 'PACKAGES_API_URL');
  ensureString(config.TURNSTILE_SITE_KEY, 'TURNSTILE_SITE_KEY');
  ensureString(config.WHATSAPP_NUMBER, 'WHATSAPP_NUMBER');
  ensureString(config.WHATSAPP_MESSAGE, 'WHATSAPP_MESSAGE');
  ensureNumber(config.FETCH_TIMEOUT_MS, 'FETCH_TIMEOUT_MS');

  if (!config.SOCIAL_URLS || typeof config.SOCIAL_URLS !== 'object') {
    throw new Error('Invalid config: SOCIAL_URLS must be an object');
  }

  for (const key of ['instagram', 'tiktok', 'facebook']) {
    ensureUrl(config.SOCIAL_URLS[key], `SOCIAL_URLS.${key}`);
  }
}

validateConfig(CONFIG);

export { CONFIG, validateConfig };
