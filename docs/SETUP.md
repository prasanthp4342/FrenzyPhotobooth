# Setup & Deployment

## Prerequisites

- Node.js 18+ (project developed with Node 22 via nvm)
- npm

## Local Development

```bash
cd /Users/prasanth/Documents/photobooth-website
npm install
npm run dev    # starts Vite dev server
```

Open the local URL shown by Vite in your terminal (typically `http://localhost:5173`).

**Note**: ES modules require HTTP — opening `index.html` directly via `file://` will fail with CORS errors. Always use `npm run dev`.

## Running Tests

```bash
npm test           # single run
npm run test:watch # watch mode
```

Tests use vitest with jsdom environment. 21 tests across 2 files:

- `__tests__/structure.test.js` — HTML structure validation
- `__tests__/form.test.js` — form behavior and validation logic

## Production Build

```bash
npm run build    # outputs optimized static assets to dist/
npm run preview  # previews production build locally
```

## Configuration

Edit config files in `js/config/` to update business-specific values:

```typescript
// js/config/integrations.ts
GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
PACKAGES_API_URL: 'https://script.google.com/macros/s/YOUR_PACKAGES_SCRIPT_ID/exec'
TURNSTILE_SITE_KEY: 'YOUR_TURNSTILE_SITE_KEY'

// js/config/contact.ts
WHATSAPP_NUMBER: '1234567890'
WHATSAPP_MESSAGE: "Hi, I'm interested in renting a photo booth for my event."

// js/config/site.ts
SOCIAL_URLS: {
  instagram: 'https://www.instagram.com/your_photobooth',
  tiktok: 'https://www.tiktok.com/@your_photobooth',
  facebook: 'https://www.facebook.com/your_photobooth',
}
```

**Important**: WhatsApp and social links are initialized by `js/features/social/social-links.ts` from `js/config/` at runtime, so updating config values is sufficient.

## Deployment Overview

For production deployment, use the full runbook:

- [RELEASE-TO-PROD.md](./RELEASE-TO-PROD.md)

Quick summary:

1. Build frontend (`npm run build`) and deploy `dist/` to static hosting.
2. Deploy latest `google-apps-script/Code.gs` as a web app (`/exec` URL).
3. Configure `GOOGLE_APPS_SCRIPT_URL` + `TURNSTILE_SITE_KEY` in `js/config/integrations.ts`.
4. Run production smoke test (sheet row + email + Turnstile challenge + timestamp).

## Security Notes

- Form submit is protected with Cloudflare Turnstile and backend token verification.
- Backend applies rate limiting and sanitizes user input before writing to Google Sheets.
- Review [SECURITY-REVIEW.md](./SECURITY-REVIEW.md) for OWASP checklist and release gate.
- Review [RELEASE-TO-PROD.md](./RELEASE-TO-PROD.md) before every production deploy.

### Testing the endpoint manually

```bash
# Health check
curl "YOUR_DEPLOYMENT_URL"

# Test submission
curl -X POST "YOUR_DEPLOYMENT_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"5551234567","eventDate":"2026-05-01","message":"Hello","turnstileToken":"TOKEN_FROM_WIDGET"}'
```

Verify a new row appears in your Google Sheet with the submitted data and a timestamp.
