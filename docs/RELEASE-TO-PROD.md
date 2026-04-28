# Release To Production

## Purpose

This runbook defines the release process for the Frenzy Photobooth website to reduce deployment mistakes and ensure form submissions work end-to-end in production.

## Scope

- Frontend: static site built by Vite (`dist/`)
- Backend: Google Apps Script web app (`google-apps-script/Code.gs`)
- Security controls: Cloudflare Turnstile + backend rate limiting/sanitization

## Release Checklist

### 1) Pre-Release Quality Gate (local)

Run from project root:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

All commands must pass before continuing.

### 2) Frontend Production Configuration

Verify `js/config/integrations.ts` values are production-ready:

- `GOOGLE_APPS_SCRIPT_URL` points to deployed `/exec` endpoint
- `TURNSTILE_SITE_KEY` is real production key (not placeholder)
- `PACKAGES_API_URL` is set (or intentionally left placeholder to use static fallback)

Also verify:

- `js/config/contact.ts` has correct WhatsApp number/message
- `js/config/site.ts` has correct social URLs

### 3) Apps Script Configuration

In deployed `Code.gs`, verify:

- `TURNSTILE_SECRET_KEY` is set (not placeholder)
- `SHEET_ID` points to production leads sheet
- `SHEET_NAME` is correct (or empty to use first sheet)
- `NOTIFICATION_EMAIL` is correct business inbox
- `BUSINESS_TIMEZONE` is correct (currently `America/Denver`)

### 4) Apps Script Deployment

Deploy latest version:

1. Apps Script -> `Deploy` -> `Manage deployments`
2. Edit existing web app deployment
3. Deploy latest version
4. Confirm:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
5. Copy/verify `/exec` URL used by frontend config

### 5) Cloudflare Turnstile Dashboard

Verify Turnstile widget hostnames include:

- production domain (e.g., `frenzyphotobooth.com`)
- `www` domain variant if used
- optional staging domain

## Deploy Steps

### Frontend

1. Build:
   ```bash
   npm run build
   ```
2. Deploy `dist/` to your static host (Netlify/Vercel/S3+CloudFront/GitHub Pages workflow).

### Backend

1. Save current `Code.gs` in Apps Script.
2. Deploy latest web app version as above.

## Post-Deploy Smoke Test (Required)

Submit one real test inquiry from production site and verify:

1. Turnstile challenge is visible and required.
2. Form accepts submission.
3. New row appears in Google Sheet with:
   - name/email/phone/eventDate/message
   - timestamp in expected timezone format.
4. Notification email arrives at `NOTIFICATION_EMAIL`.
5. No critical console errors on form submission path.

If packages API is configured, verify package cards load from API.

## Rollback Plan

### Frontend rollback

- Revert to previous static deployment artifact/release in host platform.

### Backend rollback

1. Apps Script -> `Deploy` -> `Manage deployments`
2. Re-select previous known-good version
3. Deploy

After rollback, run smoke test again.

## Release Signoff Template

- Release date/time:
- Frontend version/reference:
- Apps Script deployment version:
- Smoke test completed by:
- Smoke test result:
- Rollback point verified:
- Final approver:
