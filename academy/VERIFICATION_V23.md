# CyberLab v2.3 verification report

## What ran here (2026-10-30)

- `npm run verify:topology` — PASS.
- `npm run verify:visual` — PASS.
- `npm run verify:design` — PASS.
- `npm run verify:quality` — PASS.
- `npm run verify:incident` — PASS.
- `npm run verify:practice` — PASS.
- `npm run verify:investigation2` — PASS.
- `npm run verify:coding` — PASS.
- `npm run verify:crypto` — PASS.
- `npm run verify:pki-advanced` — PASS.
- `npm run verify:adacademy` — PASS.
- `npm run verify:purple` — PASS.
- `npm run verify:certifications` — PASS.
- `npm run verify:cert-quality` — PASS.
- `npm run verify:purple-ui` — PASS.
- `npm run verify:experience` — PASS.
- `npm run verify:stability` — PASS.
- `npm run verify:unified` — PASS.
- `npm run verify:enterprise` — PASS.
- `npm run verify:native` — PASS (35 executable assertions).

**20 of 20 offline verifier scripts passed.** Scripts exercise deterministic engines and static source contracts, not production browser rendering.

Additional source check: every TypeScript and TSX file in `src/` and `tests/` parses with TypeScript 5.8.3. Static syntax parsing is not a complete TypeScript build.

## Not verified here

- `npm test` (full Vitest suite; including 12 new Vitest native integration cases)
- `npm run build` (`tsc -b && vite build`)
- `npm run test:browser` (Playwright Chromium, including 3 new cross-module browser scenarios)
- Runtime WebGL fallback, responsive layout and accessibility in a real browser
- Dependency reproducibility: the source still has no committed `package-lock.json` pending `npm install` on the user's networked environment

## Required local release gate

```bash
npm install
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run release:check
```

`release:check` is intentionally strict about a production build and lockfile. If it fails, resolve the failure before pushing to GitHub Pages.

## Scope and accuracy

All telemetry and packets are synthetic. The enterprise topology drives physical link/route/policy outcomes, then the native NGFW packet engine evaluates the same synthetic HTTPS request. Legacy standalone scenes/cases remain intentionally independent. Browser-local progress is not a trusted audit log.
