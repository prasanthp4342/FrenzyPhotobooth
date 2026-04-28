# Security Review

## Scope

This document tracks practical security controls for the Frenzy Photobooth website and gives a repeatable OWASP Top 10 review checklist for human and AI-agent audits.

## Current Security Controls

### Frontend

- TypeScript validation for required form fields (`name`, `email`, `phone`, `eventDate`, `message`)
- Cloudflare Turnstile widget required before submit
- `target="_blank"` links use `rel="noopener noreferrer"`
- Packages rendering uses DOM APIs (not remote-data HTML string templates)

### Backend (Google Apps Script)

- Turnstile server-side token verification (`siteverify`)
- Rate limiting:
  - per-contact cooldown
  - global per-minute request cap
- Input length limit (`MAX_FIELD_LENGTH`)
- Spreadsheet formula-injection defense (`= + - @` prefix neutralization)
- Required field checks before persistence/email

## Known Tradeoffs / Residual Risk

- Form submit uses `fetch(..., { mode: 'no-cors' })` to avoid browser preflight issues with Apps Script.
  - Upside: request reaches backend.
  - Downside: frontend cannot reliably inspect HTTP success/failure.
- Public web-app endpoint is intentionally internet-accessible for lead capture.
  - Turnstile + throttling reduce abuse but do not make abuse impossible.
- Security headers/CSP are host-level concerns and must be enforced in deployment platform config.

## OWASP Top 10 Status (Snapshot)

- `A01 Broken Access Control`: Mitigated for anonymous form use-case via scoped backend behavior.
- `A02 Cryptographic Failures`: HTTPS endpoints in use.
- `A03 Injection`: Formula injection mitigated; DOM injection risk reduced via DOM-safe rendering.
- `A04 Insecure Design`: Turnstile + throttling added; continue monitoring abuse patterns.
- `A05 Security Misconfiguration`: Review deployment headers/CSP per host.
- `A06 Vulnerable & Outdated Components`: Check with `npm audit --omit=dev`.
- `A07 Identification & Authentication Failures`: N/A for public lead form; anti-bot controls in place.
- `A08 Software & Data Integrity Failures`: No dynamic script execution paths used in app logic.
- `A09 Security Logging & Monitoring Failures`: Use Apps Script Executions dashboard for backend failures.
- `A10 SSRF`: No server-side arbitrary URL fetch based on user input.

## AI Agent OWASP Checklist

Use this checklist every time security is reviewed:

1. Run static grep checks in repo for dangerous sinks:
   - `innerHTML`, `eval`, `new Function`, direct unsanitized template rendering
2. Verify backend input controls:
   - required fields
   - max length enforcement
   - neutralization for spreadsheet formulas
3. Verify anti-automation controls:
   - Turnstile token required in payload
   - backend token verification enabled
   - rate limiting active
4. Verify submission flow behavior:
   - challenge required before submit
   - no silent bypass of Turnstile path
5. Verify configuration hygiene:
   - no placeholder production values in active deploy config
   - deployment instructions match code (`integrations.ts`, `Code.gs`)
6. Dependency audit:
   - run `npm audit --omit=dev`
7. Quality gates:
   - run `npm run lint`
   - run `npm run typecheck`
   - run `npm test`
8. Manual browser validation (DevTools):
   - ensure Turnstile renders
   - verify request path for form submit
   - confirm no new high-severity console/network security errors
9. Document findings:
   - list risks by severity
   - include file references
   - include remediation actions

## Operational Security Checks (Release Gate)

Before each production release:

1. Confirm `TURNSTILE_SITE_KEY` is set in `js/config/integrations.ts`.
2. Confirm `TURNSTILE_SECRET_KEY` is set in deployed `Code.gs`.
3. Confirm Apps Script deployment is latest version.
4. Submit one test lead and verify:
   - row added to sheet
   - notification email received
   - timestamp format correct (`America/Denver`)
