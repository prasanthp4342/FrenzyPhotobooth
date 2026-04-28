// @ts-check

/**
 * @typedef {{ valid: true } | { valid: false, error: string }} ValidationResult
 * @typedef {{ name?: string | null, email?: string | null, phone?: string | null, eventDate?: string | null, message?: string | null, turnstileToken?: string | null }} ContactInput
 * @typedef {{ name: string, email: string, phone: string, eventDate: string, message: string, turnstileToken: string }} ContactPayload
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-().]{7,20}$/;

/** @param {string} value @param {string} fieldName @returns {ValidationResult} */
export function validateField(value, fieldName) {
  const name = fieldName.replace(/\s*\*\s*$/, '').trim();
  if (!value || !value.trim()) {
    return { valid: false, error: `${name} is required.` };
  }
  return { valid: true };
}

/** @param {string} email */
export function validateEmail(email) {
  return EMAIL_RE.test(email);
}

/** @param {string | null | undefined} phone */
export function validatePhone(phone) {
  const trimmed = phone?.trim();
  if (!trimmed) return true;
  return PHONE_RE.test(trimmed);
}

/** @param {ContactInput} input @returns {ContactPayload} */
export function buildPayload({ name, email, phone, eventDate, message, turnstileToken }) {
  return {
    name: name?.trim() ?? '',
    email: email?.trim() ?? '',
    phone: phone?.trim() ?? '',
    eventDate: eventDate?.trim() ?? '',
    message: message?.trim() ?? '',
    turnstileToken: turnstileToken?.trim() ?? '',
  };
}
