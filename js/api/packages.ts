// @ts-check

import { CONFIG } from '../config/index.ts';
import { fetchJson } from './http.ts';

/** @returns {Promise<Record<string, unknown>>} */
export async function fetchPackages() {
  return fetchJson(CONFIG.PACKAGES_API_URL);
}
