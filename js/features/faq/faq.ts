export function initFaq() {
  document.querySelectorAll('.faq__question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      if (!item) return;
      const answer = item.querySelector('.faq__answer') as HTMLElement | null;
      if (!answer) return;

      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq__item.active').forEach((openItem) => {
        openItem.classList.remove('active');
        const openQuestion = openItem.querySelector('.faq__question');
        const openAnswer = openItem.querySelector('.faq__answer') as HTMLElement | null;
        if (openQuestion) openQuestion.setAttribute('aria-expanded', 'false');
        if (openAnswer) openAnswer.hidden = true;
      });

      if (!isOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });
}
