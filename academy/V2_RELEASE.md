# CyberLab Interactive v2.0 — Unified Experience

## Changes
- Replaces the long 15-item sidebar with six primary sections (Home, Learn, Labs, Investigate, Certifications, My Progress) while keeping every existing hash route intact.
- A redesigned home prioritizes resume, four training tracks, clear activity labels, and two hands-on investigation entries.
- Dedicated Learn, Labs, and Investigate catalogs with module descriptions.
- New progress overview emphasizes practiced, reviewed, and validated work rather than claiming mastery.
- React.lazy / Suspense per major workbench to reduce eager JavaScript imports; final bundle splitting must be verified with a real Vite build.
- Unified v2 CSS tokens, accessible focus styles, larger typography, mobile navigation, reduced-motion support, and non-destructive styling for the certification and Purple Team workspaces.
- Existing source modules, offline simulation engines, saved browser storage keys, and old URL hashes preserved.
- Quality workflow includes verify:purple-ui, verify:crypto, verify:pki-advanced and verify:experience.

## Honest limitations
- The certification exam remains the existing v1.9.3 assessment engine; this release improves shared UI surfaces, but does not introduce a completely rewritten exam view.
- Purple Team retains its existing stateful simulation; this release improves workbench visual consistency, and no new attack/detection mechanics are claimed.
- No browser screenshot or Playwright testing can be claimed unless actually executed; check VERIFICATION_V2.md.
- No data migration should be needed because progress keys and routes are preserved. Back up data before replacing your installation.

## Test locally
```bash
npm install
npm run verify:experience
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```
For GitHub Pages, Vite base remains /training/.
