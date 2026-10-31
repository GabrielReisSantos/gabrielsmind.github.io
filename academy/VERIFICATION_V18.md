# CyberLab v1.8 — Verification report

## Performed in the packaging workspace

- v1.8 Active Directory Academy engine: **215 passing deterministic assertions**.
- Isolated strict TypeScript check for `ADAcademy.tsx` and its real engine / graph logic, using temporary local React/lucide dependency declarations: **passed**.
- Full source and browser-test syntax parsing: **88 TypeScript/TSX files parsed, 0 parse errors**.
- Ten inherited v1.7 offline verification tasks: **all passed** (`verify:topology`, `verify:visual`, `verify:design`, `verify:quality`, `verify:incident`, `verify:practice`, `verify:investigation2`, `verify:coding`, `verify:crypto`, `verify:pki-advanced`).
- v1.7 original module files retained; only `App.tsx`, `Dashboard.tsx`, `README.md`, `ROADMAP.md`, `package.json` and `.gitignore` updated, plus new AD Academy sources/docs/browser tests.

## Intentionally unverified

- `npm install` and `npm run build` with real dependencies (offline npm cache does not contain `@playwright/test`; this workspace cannot fetch registry artifacts).
- Playwright execution, rendered 3D/2D/AD canvas UI, desktop/mobile screenshots and keyboard operation in actual browsers.
- Deployment of the merged Astro/GitHub Pages site at `/training/`.

## User-local acceptance sequence

```bash
npm install
npm run verify:adacademy
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

Open `http://127.0.0.1:5173/training/#adlab` (or exact Vite URL). Check the eight concept units, authentication protocol stepper, abuse atlas, graph edge selection, evidence pinning, repair, retest, report export, previous graph view, and mobile layout. Re-run the earlier CyberLab navigation and packet flows.

**Release classification:** Source-verified candidate; not production/browser verified.
