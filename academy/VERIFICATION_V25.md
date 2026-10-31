# v2.5 verification report

**Executed with:** Node.js v22.16.0 and globally installed TypeScript. No npm dependencies were available.

## Confirmed here

- `npm run verify:ad-mission` — **42 offline assertions passed**; strict compilation of the new persistence and onboarding engine.
- `npm run verify:usability` — **43 assertions passed**; AD graph / camera source and functional checks.
- `npm run verify:stability` — **19 checks passed**.
- `npm run verify:design` — **80 source design checks passed**.
- `npm run verify:quality` — **37 progress/compatibility checks passed**.
- Existing offline verifiers `verify:test-boundaries`, `verify:topology`, `verify:visual`, `verify:incident`, `verify:practice`, `verify:investigation2`, `verify:coding`, `verify:crypto`, `verify:pki-advanced`, `verify:adacademy`, `verify:purple`, `verify:certifications`, `verify:cert-quality`, `verify:purple-ui`, `verify:experience`, `verify:unified`, `verify:enterprise`, and `verify:native` passed when run individually.
- Source-level TS/TSX syntax parsing passed.

## Added but not yet executable here

- `src/adacademy/drafts.test.ts` — sanitized draft round-trips, malformed record recovery, invalid permission edges, forged evidence, stale retests and grader isolation.
- `src/experience/activity.test.ts` — recognized action parser and malformed input handling.
- `tests/browser/ad-mission25.spec.ts` — draft recovery, switching cases, graph selection and 2D/3D toggles, recorded onboarding actions.

## Not verified

- Full React/TypeScript build (`npm run build`).
- Vitest unit test collection and execution (`npm test`).
- Playwright Chromium desktop/mobile tests (`npm run test:browser`).
- Physical mouse, trackpad and touch interaction quality in the browser.

**Reason:** npm registry DNS lookup returned `EAI_AGAIN` on dependency installation. An offline-only source check does not imply production readiness.
