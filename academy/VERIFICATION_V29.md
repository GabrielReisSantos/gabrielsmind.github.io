# CyberLab v2.9 — Verification

## Completed offline

- `npm run verify:explorer`: 24 deterministic behavioral assertions, including two-layer guest flow evaluation, independent attack path, current-revision grading, stale proof invalidation, tampered storage rejection and report boundaries.
- `npm run verify:explorer-ui`: 14 JSX binding and route/source integration checks, including the new route, Home card, shared configuration and persistence wiring.
- `npm run verify:home`: passed v2.8.1 JSX missing-icon regression check.
- `npm run verify:experience`: 123 navigation assertions; old route invariant adjusted to include `explorer`.
- Existing offline engine checks passed: 52 Enterprise Bridge, 35 native forwarding, 20 Mission Room, 38 Unified Range, 43 usability, 215 AD Academy, 172 Purple Team, 209 Secrets Atlas, 62 Password Auditing, 2033 certification bank, plus additional course regressions.
- TypeScript v5.8 parser/transpiler accepted the changed TSX and route files. This is a **syntax check, not full typing**.

## Not completed — deployment blocking

`npm install` failed with `EAI_AGAIN` resolving `registry.npmjs.org`. Therefore:

- `npm test` and the new `src/explorer/engine.test.ts` Vitest file were not executed here;
- `npm run build` / real Vite output were not produced;
- `npm run test:browser` (including new desktop/mobile Explorer flows) was not executed;
- no dependency lockfile was generated and no production deployment was performed.

## Developer acceptance checklist

1. Run `npm install` on a network-connected computer and commit the generated `package-lock.json`.
2. Run `npm run verify:all && npm run build && npm run release:check`.
3. Run `npx playwright install chromium && npm run test:browser` on both desktop and mobile projects.
4. Open Home, Systems Explorer and Mission Room. Test all three faults, ensure the linked controls change the original native engine state, check evidence pinning and refresh, repair and retest, and check reset confirmation.
5. Capture desktop/mobile screenshots; check no overflow, misaligned labels or JS console errors.

**Do not advertise production/browser QA passed until steps 1–5 actually succeed.**
