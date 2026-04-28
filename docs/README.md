# Frenzy Photobooth Website

A single-page static website for a photo booth rental business built with vanilla HTML, CSS, and TypeScript modules, bundled with Vite.

## Quick Start

```bash
cd /Users/prasanth/Documents/photobooth-website
npm install
npm run dev        # starts Vite dev server
npm run build      # production build to dist/
npm test           # runs vitest (21 tests)
```

## Documentation Map

- `SETUP.md` — local development setup and initial backend wiring
- `ARCHITECTURE.md` — technical architecture, module boundaries, data flow
- `SECURITY-REVIEW.md` — security controls and OWASP review checklist (including AI-agent checklist)
- `RELEASE-TO-PROD.md` — production release checklist, smoke test, rollback
- `FUTURE-WORK.md` — backlog and enhancement ideas

## Project Structure

```
photobooth-website/
├── index.html                    # Single-page HTML document
├── package.json                  # Dev dependencies: vitest, fast-check, jsdom
├── vitest.config.js              # Test config (jsdom environment)
├── tsconfig.json                 # TypeScript compiler config
│
├── css/                          # 10 modular CSS files (loaded in dependency order)
│   ├── variables.css             # CSS custom properties (:root only)
│   ├── base.css                  # Resets, global defaults, .container utility
│   ├── banner.css                # Top contact banner (email + phone)
│   ├── navbar.css                # Sticky nav, hamburger menu (≤768px)
│   ├── hero.css                  # Full-width gradient hero section
│   ├── about.css                 # Two-column about section
│   ├── services.css              # 4-column service card grid (incl. Instant Printing)
│   ├── packages.css              # Dynamic packages card grid
│   ├── faq.css                   # FAQ accordion section
│   ├── contact.css               # Contact form + info panel
│   └── footer.css                # Dark footer with social links
│
├── js/
│   ├── app.ts                    # Entry point (top-level init, no DOMContentLoaded)
│   ├── config.ts                 # Compatibility export for config
│   ├── config/                   # Split config by concern + runtime validation
│   ├── api/                      # Shared HTTP and integration API modules
│   ├── features/
│   │   ├── contact/              # Contact form feature modules
│   │   ├── navigation/           # Navigation feature module
│   │   ├── packages/             # Packages feature module
│   │   ├── faq/                  # FAQ feature module
│   │   └── social/               # Social links feature module
│   └── *.ts                      # Compatibility exports for legacy imports/tests
│
├── assets/
│   └── images/
│       └── about-placeholder.svg # Placeholder image for about section
│
├── google-apps-script/
│   └── Code.gs                   # Google Apps Script backend for form submissions
│
├── __tests__/
│   ├── structure.test.js         # HTML structure tests (9 tests)
│   └── form.test.js              # Form behavior + validation tests (12 tests)
│
└── docs/                         # This documentation folder
    ├── README.md                 # You are here
    ├── ARCHITECTURE.md           # Detailed module descriptions and data flow
    ├── SETUP.md                  # Local dev, deployment, configuration
    ├── SECURITY-REVIEW.md        # Security controls + OWASP review checklist
    ├── RELEASE-TO-PROD.md        # Production release runbook and rollback
    └── FUTURE-WORK.md            # Planned features (Packages section, etc.)
```

## Key Design Decisions

1. **Vite build pipeline** — fast dev server, production bundling, and optimized static output to `dist/`.
2. **Modular CSS** — 10 files loaded in dependency order (variables → base → components). Each file owns one visual section.
3. **Modular TS with separation of concerns** — Pure validation logic has zero DOM dependencies. DOM manipulation is isolated in `form-ui.ts`. Network calls are isolated in `form-submission.ts`. The orchestrator (`contact-form.ts`) wires them together.
4. **No DOMContentLoaded wrapper** — Since `app.ts` is loaded as `<script type="module">`, it is automatically deferred (runs after DOM parsing). Using `DOMContentLoaded` inside a module script is unreliable because the event may fire before the module executes. Init functions are called directly at the module's top level.
5. **Google Apps Script backend** — Form submissions go to a Google Apps Script web app that appends rows to a Google Sheet. No custom server needed.
6. **Validated config layer** — `js/config/` splits integration, contact, and site config and validates values at startup.

## External Dependencies (CDN)

- **Google Fonts**: Poppins (headings) + Inter (body)
- **Font Awesome 6.5.1**: Icons for services, social links, WhatsApp

## Test Suite

21 tests across 2 files, run via `vitest` with `jsdom` environment:

- `structure.test.js` (9 tests): Validates HTML structure — section order, nav links, placeholder links for runtime social/WhatsApp injection, service cards, form required attributes, viewport meta.
- `form.test.js` (12 tests): Validates form behavior — submit button states, error/success feedback, config exports, validation functions (required fields, email, phone, payload trimming including event date).
