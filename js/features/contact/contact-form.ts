import { CONFIG } from '../../config/index.ts';
import { validateField, validateEmail, validatePhone, buildPayload } from './form-validation.ts';
import { showFieldError, clearFieldError, clearAllFieldErrors, setFormState } from './form-ui.ts';
import { submitForm } from './form-submission.ts';

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

function getWhatsAppUrl() {
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONFIG.WHATSAPP_MESSAGE)}`;
}

function ensureTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  if (document.querySelector(`script[src="${TURNSTILE_SCRIPT_SRC}"]`)) {
    return new Promise<void>((resolve) => {
      const poll = () => {
        if (window.turnstile) resolve();
        else setTimeout(poll, 100);
      };
      poll();
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile script.'));
    document.head.appendChild(script);
  });
}

function clearCaptchaError() {
  const errorEl = document.getElementById('captcha-error');
  if (errorEl) errorEl.textContent = '';
}

function showCaptchaError(message: string) {
  const errorEl = document.getElementById('captcha-error');
  if (errorEl) errorEl.textContent = message;
}

function getContactFields(form: HTMLFormElement) {
  return {
    name: form.elements.namedItem('name') as HTMLInputElement,
    email: form.elements.namedItem('email') as HTMLInputElement,
    phone: form.elements.namedItem('phone') as HTMLInputElement,
    eventDate: form.elements.namedItem('eventDate') as HTMLInputElement,
    message: form.elements.namedItem('message') as HTMLTextAreaElement,
  };
}

export function initContactForm() {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;
  const submitBtn = form.querySelector('.contact-form__submit') as HTMLButtonElement | null;
  const captchaContainer = document.getElementById('turnstile-widget');
  let turnstileToken = '';

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      clearFieldError(field as HTMLInputElement | HTMLTextAreaElement);
    });
  });
  form.addEventListener('input', clearCaptchaError);

  if (!CONFIG.TURNSTILE_SITE_KEY || CONFIG.TURNSTILE_SITE_KEY.includes('YOUR_TURNSTILE_SITE_KEY')) {
    if (submitBtn) submitBtn.disabled = true;
    showCaptchaError('Security challenge is not configured. Please contact support.');
    return;
  }

  if (!captchaContainer) {
    if (submitBtn) submitBtn.disabled = true;
    showCaptchaError('Security challenge is unavailable. Please refresh.');
    return;
  }

  ensureTurnstileScript()
    .then(() => {
      if (!window.turnstile) throw new Error('Turnstile unavailable.');
      window.turnstile.render(captchaContainer, {
        sitekey: CONFIG.TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          turnstileToken = token;
          clearCaptchaError();
        },
        'error-callback': () => {
          turnstileToken = '';
          showCaptchaError('Security challenge failed. Please retry.');
        },
        'expired-callback': () => {
          turnstileToken = '';
          showCaptchaError('Security challenge expired. Please retry.');
        },
      });
    })
    .catch((err) => {
      console.error('Turnstile init failed:', err);
      if (submitBtn) submitBtn.disabled = true;
      showCaptchaError('Could not load security challenge. Please refresh.');
    });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllFieldErrors(form);
    clearCaptchaError();

    const fields = getContactFields(form);
    let valid = true;

    for (const key of ['name', 'email', 'phone', 'eventDate', 'message'] as const) {
      const field = fields[key];
      const result = validateField(field.value, field.previousElementSibling?.textContent || key);
      if (!result.valid) {
        showFieldError(field, result.error);
        valid = false;
      }
    }

    if (fields.email.value.trim() && !validateEmail(fields.email.value.trim())) {
      showFieldError(fields.email, 'Please enter a valid email.');
      valid = false;
    }

    if (fields.phone.value.trim() && !validatePhone(fields.phone.value)) {
      showFieldError(fields.phone, 'Please enter a valid phone number.');
      valid = false;
    }

    if (!valid) return;
    if (!turnstileToken) {
      showCaptchaError('Please complete the security challenge.');
      return;
    }

    setFormState(form, 'submitting');

    try {
      await submitForm(
        buildPayload({
          name: fields.name.value,
          email: fields.email.value,
          phone: fields.phone.value,
          eventDate: fields.eventDate.value,
          message: fields.message.value,
          turnstileToken,
        }),
      );
      turnstileToken = '';
      window.turnstile?.reset();
      setFormState(form, 'success');
    } catch (err) {
      console.error('Failed to submit form:', err);
      turnstileToken = '';
      window.turnstile?.reset();
      setFormState(form, 'error', getWhatsAppUrl());
    }
  });
}
