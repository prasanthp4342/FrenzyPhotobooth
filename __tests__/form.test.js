import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { setFormState } from '../js/form-ui.ts';
import { CONFIG } from '../js/config.ts';
import {
  validateField,
  validateEmail,
  validatePhone,
  buildPayload,
} from '../js/form-validation.ts';

function loadDocument() {
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf-8');
  document.documentElement.innerHTML = html;
}

describe('setFormState', () => {
  let form;

  beforeEach(() => {
    loadDocument();
    form = document.getElementById('contact-form');
  });

  it('submitting: disables button and shows spinner', () => {
    setFormState(form, 'submitting');
    const btn = form.querySelector('.contact-form__submit');
    expect(btn.disabled).toBe(true);
    expect(btn.classList.contains('contact-form__submit--loading')).toBe(true);
  });

  it('error: shows error message with WhatsApp fallback', () => {
    setFormState(form, 'error', 'https://wa.me/123');
    const feedback = document.getElementById('form-feedback');
    expect(feedback.classList.contains('form-feedback--error')).toBe(true);
    expect(feedback.innerHTML).toContain('WhatsApp');
    expect(feedback.innerHTML).toContain('wa.me/123');
  });

  it('success: shows success message and clears fields', () => {
    form.elements.name.value = 'Test';
    form.elements.email.value = 'test@test.com';
    setFormState(form, 'success');
    const feedback = document.getElementById('form-feedback');
    expect(feedback.classList.contains('form-feedback--success')).toBe(true);
    expect(form.elements.name.value).toBe('');
    expect(form.elements.email.value).toBe('');
  });
});

describe('config.js exports', () => {
  it('has expected keys and types', () => {
    expect(typeof CONFIG.GOOGLE_APPS_SCRIPT_URL).toBe('string');
    expect(typeof CONFIG.TURNSTILE_SITE_KEY).toBe('string');
    expect(typeof CONFIG.WHATSAPP_NUMBER).toBe('string');
    expect(typeof CONFIG.WHATSAPP_MESSAGE).toBe('string');
    expect(typeof CONFIG.SOCIAL_URLS).toBe('object');
    expect(typeof CONFIG.SOCIAL_URLS.instagram).toBe('string');
    expect(typeof CONFIG.SOCIAL_URLS.tiktok).toBe('string');
    expect(typeof CONFIG.SOCIAL_URLS.facebook).toBe('string');
    expect(typeof CONFIG.FETCH_TIMEOUT_MS).toBe('number');
  });
});

describe('form-validation pure functions', () => {
  it('validateField rejects empty strings', () => {
    expect(validateField('', 'Name').valid).toBe(false);
    expect(validateField('   ', 'Name').valid).toBe(false);
  });

  it('validateField accepts non-empty strings', () => {
    expect(validateField('John', 'Name').valid).toBe(true);
  });

  it('validateEmail accepts valid emails', () => {
    expect(validateEmail('a@b.c')).toBe(true);
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('validateEmail rejects invalid emails', () => {
    expect(validateEmail('nope')).toBe(false);
    expect(validateEmail('a @b.c')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('validatePhone keeps permissive parsing but form treats phone as required', () => {
    expect(validatePhone('')).toBe(true);
    expect(validatePhone(null)).toBe(true);
  });

  it('validatePhone accepts valid phone numbers', () => {
    expect(validatePhone('+1 (555) 123-4567')).toBe(true);
    expect(validatePhone('5551234567')).toBe(true);
  });

  it('validatePhone rejects invalid input', () => {
    expect(validatePhone('abc')).toBe(false);
    expect(validatePhone('12')).toBe(false);
  });

  it('buildPayload trims all values', () => {
    const p = buildPayload({
      name: ' John ',
      email: ' a@b.c ',
      phone: ' 123 ',
      eventDate: ' 2026-05-01 ',
      message: ' hi ',
      turnstileToken: ' token ',
    });
    expect(p).toEqual({
      name: 'John',
      email: 'a@b.c',
      phone: '123',
      eventDate: '2026-05-01',
      message: 'hi',
      turnstileToken: 'token',
    });
  });
});
