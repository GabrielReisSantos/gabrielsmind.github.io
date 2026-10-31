# CyberLab v2.3.1 — Vitest collection & Dashboard build hotfix

## User-reported failures

- `npm test`: 15 Playwright spec files were incorrectly collected by Vitest. **196 actual unit tests passed**; collection failed in 15 browser-spec modules. This is a runner separation problem, not 15 proven browser failures.
- `npm run build`: `Dashboard.tsx` was missing the new `unified` destination in its local union and resume-label mapping, producing TS2322/TS2339.

## Changes

1. Added `vitest.config.ts` with an explicit include of `src/**/*.test.ts(x)` and exclusion of `tests/browser/**`. `playwright.config.ts` still owns the 15 browser specs and is not modified.
2. `Dashboard.tsx` now reuses `DestinationId` from `src/learning/progress.ts` rather than maintaining a stale, duplicated route union.
3. Dashboard resume labels use the central `routeLabel()` registry; includes a Unified Cyber Range shortcut in the lab list.
4. Added `VERIFY_V231.cjs` offline regression gate (`npm run verify:test-boundaries`). Registered it in `verify:all`.
5. Bumped package version to 2.3.1. All v2.3 modules, native NGFW and 3D enterprise workbenches remain included.

## Install

- Use the complete ZIP in a new directory or apply the smaller v2.3 → v2.3.1 patch over an existing v2.3 project, after backing up files.
- Run `npm install` (or `npm ci` if you have a valid committed lockfile), then `npm run verify:test-boundaries`, `npm test`, `npm run build`, `npx playwright install chromium`, `npm run test:browser`.
- If the full quality gate passes, `npm run qa:full` should pass too.

## Verification boundary

The structural regression gate and prior offline engine suites can be run in this environment. The full dependency-backed Vitest/Vite build and actual rendered Playwright browser run require installed project dependencies. Do not confuse offline TypeScript source parsing with a verified production build. No lockfile is fabricated.
