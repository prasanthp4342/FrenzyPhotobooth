# Future Work

## Recently Completed

### Packages Section (Dynamic, Google Drive-backed)

A "Packages" section between Services and FAQ displays photo booth rental packages (Basic, Advanced, Premier) with images stored in Google Drive and data served dynamically via a Google Apps Script API. Falls back to static SVG images if the API is unavailable.

### FAQ Section (Accordion)

An FAQ section between Packages and Contact with 6 common questions. Accordion behavior — clicking a question expands its answer, and only one can be open at a time. Accessible via `aria-expanded` and `hidden` attributes.

### Top Contact Banner

A contact banner above the navbar displays the business email and phone number as clickable links (`mailto:` and `tel:`).

---

## Other Potential Improvements

### Performance

- Continue optimizing production bundles (code splitting, asset compression, cache strategy)
- Add `<link rel="preload">` for critical CSS
- Replace placeholder SVG with real WebP images with JPEG fallbacks
- Add a favicon

### Accessibility

- Run Lighthouse/axe-core accessibility audit
- Verify WCAG AA contrast ratios (4.5:1) on all text/background combinations
- Verify all interactive elements have accessible names

### Content

- Replace all placeholder text with real business copy
- Replace placeholder image with real photo booth photo
- Update social media URLs and WhatsApp values in `js/config/`

### Features

- Add a gallery/portfolio section with photos from past events
- Add testimonials/reviews section
- Add Google Analytics or similar tracking
- Add cookie consent banner if required by jurisdiction
