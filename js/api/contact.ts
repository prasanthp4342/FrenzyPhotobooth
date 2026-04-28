// @ts-check

import { CONFIG } from '../config/index.ts';
import { fetchWithJsonBody } from './http.ts';

/**
 * @param {{ name: string, email: string, phone: string, eventDate: string, message: string, turnstileToken: string }} payload
 * @returns {Promise<Response>}
 */
export async function submitContactForm(payload) {
  return fetchWithJsonBody(CONFIG.GOOGLE_APPS_SCRIPT_URL, payload);
}
