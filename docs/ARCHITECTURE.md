# Architecture

## Overview

The site is a single-page static website with no UI framework and no server-side rendering. TypeScript modules are bundled by Vite for production static hosting.

The architecture follows two principles:

1. **CSS is split by visual section** — each section of the page has its own stylesheet.
2. **TypeScript is split by concern** — pure logic, DOM manipulation, network calls, and orchestration are in separate modules.

## Page Sections (in order)

| Section    | HTML ID       | CSS File       | Description                                             |
| ---------- | ------------- | -------------- | ------------------------------------------------------- |
| Banner     | `.top-banner` | `banner.css`   | Top contact bar with email + phone links                |
| Navigation | `<nav>`       | `navbar.css`   | Sticky nav bar, hamburger menu on mobile (≤768px)       |
| Hero       | `#home`       | `hero.css`     | Full-width gradient background, CTA button              |
| About      | `#about`      | `about.css`    | Two-column layout (text + image)                        |
| Services   | `#services`   | `services.css` | 4-column card grid with icons (incl. Instant Printing)  |
| Packages   | `#packages`   | `packages.css` | Dynamic package cards (fetched from API, with fallback) |
| FAQ        | `#faq`        | `faq.css`      | Accordion-style FAQ (one open at a time)                |
| Contact    | `#contact`    | `contact.css`  | Contact form + WhatsApp/social info panel               |
| Footer     | `<footer>`    | `footer.css`   | Social links + copyright                                |

## CSS Architecture

```
variables.css  →  base.css  →  [component stylesheets]
```

- `variables.css`: Only `:root` custom properties. Colors, typography, spacing, shadows. Every other CSS file references these variables.
- `base.css`: Box-sizing reset, smooth scroll, body defaults, `img` max-width, `.container` utility, `.section-title` utility.
- Component files: Each owns styles for exactly one page section. No cross-section dependencies.

All CSS files are loaded in `<head>` in dependency order. `variables.css` must come first.

### Responsive Design

Breakpoint: `768px`. At or below this width:

- Nav collapses to hamburger menu
- All multi-column layouts stack to single column
- Font sizes reduce in hero section

All interactive elements (buttons, links) have minimum 44×44px tap targets.

## TypeScript Architecture

```
app.ts (entry point — top-level calls, no DOMContentLoaded)
  ├── features/navigation/navigation.ts
  ├── features/packages/packages.ts
  │     └── api/packages.ts
  ├── features/faq/faq.ts
  ├── features/social/social-links.ts
  └── features/contact/contact-form.ts
        ├── form-validation.ts  (pure functions, zero DOM)
        ├── form-ui.ts          (all form DOM reads/writes)
        └── form-submission.ts  (network layer)
              └── api/contact.ts

config/index.ts
  └── config/{integrations,contact,site}.ts
```

### Module Details

#### `config/index.ts`

Exports a single `CONFIG` object:

- `GOOGLE_APPS_SCRIPT_URL` — endpoint for form submissions
- `TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key for frontend challenge
- `WHATSAPP_NUMBER` — phone number for WhatsApp link
- `WHATSAPP_MESSAGE` — pre-filled greeting message
- `SOCIAL_URLS` — `{ instagram, tiktok, facebook }` profile URLs
- `FETCH_TIMEOUT_MS` — timeout for form submission requests (default: 15000ms)

Config is split by concern in `config/{integrations,contact,site}.ts` and validated at startup.

#### `features/contact/form-validation.ts` (pure functions, zero DOM dependencies)

- `validateField(value, fieldName)` → `{ valid, error? }` — rejects empty/whitespace-only required fields
- `validateEmail(email)` → `boolean` — regex check
- `validatePhone(phone)` → `boolean` — validates permissive phone pattern
- `buildPayload({ name, email, phone, eventDate, message, turnstileToken })` → trimmed object with exactly those 6 keys

#### `features/contact/form-ui.ts` (owns ALL form DOM manipulation)

- `showFieldError(field, message)` — shows inline error below a field
- `clearFieldError(field)` — removes inline error from a field
- `clearAllFieldErrors(form)` — removes all inline errors
- `setFormState(form, state, whatsappUrl?)` — manages UI for states: `idle`, `submitting` (disable + spinner), `success` (message + reset), `error` (message + WhatsApp fallback)

#### `features/contact/form-submission.ts` (network layer)

- `submitForm(payload)` → `Promise<Response>` — POSTs JSON to Google Apps Script URL with `AbortController` timeout
- Uses `no-cors` mode for Apps Script compatibility, so frontend cannot reliably inspect HTTP response body/status

#### `features/contact/contact-form.ts` (orchestrator)

- `initContactForm()` — attaches submit handler, validates fields, shows errors, builds payload, calls `submitForm`, updates UI state
- Requires Cloudflare Turnstile completion and includes `turnstileToken` in payload
- Contains **control flow only** — no pure logic, no direct DOM manipulation

#### `features/navigation/navigation.ts`

- `initNavigation()` — hamburger toggle (`aria-expanded`), close menu on link click, `IntersectionObserver` for active link highlighting
- Graceful degradation: if `IntersectionObserver` is unsupported, nav links still work as anchor links

#### `app.ts` (entry point)

- Imports `initNavigation`, `initContactForm`, `initPackages`, and `initFaq`
- Calls all four directly at the module's top level (no `DOMContentLoaded` wrapper — module scripts are automatically deferred)
- Contains **no logic of its own**

**Important**: Do NOT wrap init calls in `DOMContentLoaded`. Since `app.ts` is loaded as `<script type="module">`, it is already deferred. The `DOMContentLoaded` event may fire before the module executes, causing the callback to never run.

#### `features/packages/packages.ts`

- `initPackages()` — async function that fetches package data from the Apps Script API (via `api/packages.ts`)
- Renders package cards dynamically into the `#packages-grid` container
- Handles loading state, error state (shows static fallback images)
- Uses `AbortController` with configurable timeout

#### `features/faq/faq.ts`

- `initFaq()` — attaches click handlers to `.faq__question` buttons
- Toggles `.active` class on parent `.faq__item`, manages `aria-expanded` and `hidden` attributes
- Only one FAQ item can be open at a time (closes others when opening one)

## Form Submission Data Flow

```
User submits form
  → contact-form.ts validates all fields (via form-validation.ts)
  → If invalid: show inline errors (via form-ui.ts), stop
  → If valid: set form state to "submitting" (via form-ui.ts)
  → Build payload (via form-validation.ts)
  → POST to Google Apps Script (via form-submission.ts)
  → On success: set form state to "success", reset fields
  → On failure: set form state to "error", show WhatsApp fallback link
```

## Google Apps Script Backend

File: `google-apps-script/Code.gs`

- `doGet()` — returns JSON health check response
- `doPost(e)` — verifies Turnstile token, enforces rate limits, sanitizes inputs, appends `[name, email, phone, eventDate, message, timestamp]` to Google Sheet, and sends notification email

Deployment: Web app → Execute as: Me → Access: Anyone. See `Code.gs` comments for full setup instructions.
