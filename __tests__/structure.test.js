import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let doc;

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf-8');
  doc = new DOMParser().parseFromString(html, 'text/html');
});

describe('Page sections', () => {
  it('has sections in correct order: hero → about → services → contact', () => {
    const sections = [...doc.querySelectorAll('section[id]')].map((s) => s.id);
    expect(sections).toEqual(['home', 'about', 'services', 'packages', 'faq', 'contact']);
  });
});

describe('Navigation', () => {
  it('has nav links with correct href anchors pointing to existing sections', () => {
    const links = doc.querySelectorAll('.navbar__link');
    expect(links.length).toBeGreaterThanOrEqual(4);
    links.forEach((link) => {
      const target = link.getAttribute('href');
      expect(target).toMatch(/^#/);
      expect(doc.querySelector(target)).not.toBeNull();
    });
  });
});

describe('Social media links', () => {
  const selectors = ['.contact-info__social a', '.footer__social a'];

  selectors.forEach((sel) => {
    it(`${sel} have target="_blank" and rel="noopener noreferrer"`, () => {
      const links = doc.querySelectorAll(sel);
      expect(links.length).toBeGreaterThanOrEqual(3);
      links.forEach((link) => {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });
  });

  it('social links are initialized as placeholders for runtime config injection', () => {
    const links = doc.querySelectorAll('.contact-info__social a');
    const hrefs = [...links].map((l) => l.getAttribute('href'));
    expect(hrefs.every((h) => h === '#')).toBe(true);
  });
});

describe('WhatsApp link', () => {
  it('is initialized as placeholder for runtime config injection', () => {
    const link = doc.querySelector('.contact-info__whatsapp');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('#');
  });
});

describe('Service cards', () => {
  it('has at least 3 cards each with title, description, and icon', () => {
    const cards = doc.querySelectorAll('.service-card');
    expect(cards.length).toBeGreaterThanOrEqual(3);
    cards.forEach((card) => {
      expect(card.querySelector('.service-card__title')).not.toBeNull();
      expect(card.querySelector('.service-card__description')).not.toBeNull();
      expect(card.querySelector('.service-card__icon')).not.toBeNull();
    });
  });
});

describe('Contact form', () => {
  it('required fields have required attribute', () => {
    expect(doc.querySelector('#name').hasAttribute('required')).toBe(true);
    expect(doc.querySelector('#email').hasAttribute('required')).toBe(true);
    expect(doc.querySelector('#phone').hasAttribute('required')).toBe(true);
    expect(doc.querySelector('#event-date').hasAttribute('required')).toBe(true);
    expect(doc.querySelector('#message').hasAttribute('required')).toBe(true);
  });
});

describe('Viewport meta', () => {
  it('has correct content attribute', () => {
    const meta = doc.querySelector('meta[name="viewport"]');
    expect(meta).not.toBeNull();
    expect(meta.getAttribute('content')).toContain('width=device-width');
    expect(meta.getAttribute('content')).toContain('initial-scale=1.0');
  });
});
