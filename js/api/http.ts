// @ts-check

import { CONFIG } from '../config/index.ts';

/** @typedef {Record<string, unknown>} JsonObject */

/** @param {string} url @param {RequestInit=} options @returns {Promise<JsonObject>} */
export async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return /** @type {Promise<JsonObject>} */ response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {string} url
 * @param {unknown} payload
 * @param {RequestInit=} options
 * @returns {Promise<Response>}
 */
export async function fetchWithJsonBody(url, payload, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload),
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timer);
  }
}
