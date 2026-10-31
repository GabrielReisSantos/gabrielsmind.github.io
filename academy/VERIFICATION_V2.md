# CyberLab 2.0 verification

## Verified in this environment

- 110 TypeScript/TSX source and browser-test files passed TypeScript AST **syntax parsing** (not semantic checking of the entire app).
- New UI component and route sources passed isolated strict TypeScript checks using local React/lucide dependency shims. This is **not** a substitute for the real installed library typings.
- 98 v2 navigation invariant assertions; 80 v2 design source-invariant assertions; 37 v2 compatibility/progress assertions.
- 57 Purple correlation visual assertions.
- The following independent regressions passed: topology (173), visual (291), incident (23), OSCP practice (135), investigation engine (112), coding (88), crypto (154), advanced PKI (282), AD Academy (215), Purple Team (172), certification question bank (2033), certification quality (500).
- Existing v1.9.3 source files retained in the source package.
- ZIP integrity checked after creation.

## Not verified here — mandatory before publishing

- Actual `npm install` (npm DNS `EAI_AGAIN`).
- Full TypeScript semantic build with real React types (`npm run build`).
- Vitest suite (`npm test`).
- Real React UI interactions and visual/responsive layout (`npm run test:browser`).
- Browser-delivered lazy-chunk paths under `/training/` and locally saved exam restoration.

## Ubuntu verification

```sh
npm install
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
```

The old `VERIFY_V1.cjs`/`VERIFY_V11.cjs` source-layout assertions matched v1 navigation and dashboard markup and are replaced in the active scripts by the v2.0 design/quality verifiers, which continue to test progress and existing lab contracts. No simulation rules were relaxed.
