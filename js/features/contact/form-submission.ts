// @ts-check

import { submitContactForm } from '../../api/contact.ts';

/**
 * @param {{ name: string, email: string, phone: string, eventDate: string, message: string, turnstileToken: string }} payload
 * @returns {Promise<Response>}
 */
export async function submitForm(payload) {
  return submitContactForm(payload);
}
