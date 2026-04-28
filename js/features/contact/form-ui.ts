type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function showFieldError(field: HTMLInputElement | HTMLTextAreaElement, message: string) {
  const errorEl = document.getElementById(`${field.name}-error`);
  if (errorEl) errorEl.textContent = message;
  field.classList.add('contact-form__input--error');
}

export function clearFieldError(field: HTMLInputElement | HTMLTextAreaElement) {
  const errorEl = document.getElementById(`${field.name}-error`);
  if (errorEl) errorEl.textContent = '';
  field.classList.remove('contact-form__input--error');
}

export function clearAllFieldErrors(form: HTMLFormElement) {
  form.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });
  form.querySelectorAll('.contact-form__input--error').forEach((el) => {
    el.classList.remove('contact-form__input--error');
  });
}

export function setFormState(form: HTMLFormElement, state: FormState, whatsappUrl?: string) {
  const btn = form.querySelector('.contact-form__submit') as HTMLButtonElement | null;
  const feedback = document.getElementById('form-feedback');
  if (!btn || !feedback) return;

  btn.disabled = false;
  btn.classList.remove('contact-form__submit--loading');
  feedback.className = 'form-feedback';
  feedback.textContent = '';

  switch (state) {
    case 'submitting':
      btn.disabled = true;
      btn.classList.add('contact-form__submit--loading');
      break;
    case 'success':
      feedback.classList.add('form-feedback--success');
      feedback.textContent = "Thanks! Your inquiry has been received. We'll contact you shortly.";
      form.reset();
      clearAllFieldErrors(form);
      break;
    case 'error':
      feedback.classList.add('form-feedback--error');
      feedback.innerHTML = whatsappUrl
        ? `Failed to send. Please try again or <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.`
        : 'Failed to send. Please try again.';
      break;
    case 'idle':
      break;
  }
}
