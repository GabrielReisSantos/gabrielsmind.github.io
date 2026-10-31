# CyberLab v2.5.1 — AD draft recovery and TypeScript hotfix

## What failed in v2.5.0

- Vitest (`src/adacademy/drafts.test.ts`) rejected a saved retest that was accepted after recovery silently discarded an invalid `legit` permission change. The restored graph matched the asserted result, but the retest belonged to a different originally saved configuration.
- TypeScript `TS2345`: an optional `t.scenario` was captured inside an `onClick` callback where narrowing was lost.
- TypeScript `TS6133`: unused `ACTIVITY_IDS` import in the How to Use screen.

## Fixes

- Draft sanitizer preserves allowed weak-edge edits and removes disallowed edits **without** restoring a retest tied to a modified/duplicate/invalid edit list. Valid clean snapshots retain their retest. Invalid revisions cannot establish verification.
- The Abuse Atlas callback explicitly asserts the guarded scenario ID when calling `chooseMission`.
- Removed the unused import in `HowToUse.tsx`.
- Added a regression test and a standalone `verify:hotfix` command, included in `verify:all`.

No change to the AD mission scoring criteria or the current simulated attack model.

## Apply the patch

From the extracted CyberLab v2.5.0 project folder:

```bash
unzip -o ~/Downloads/cyberlab-v2.5.1-patch-from-v2.5.zip -d .
npm run verify:hotfix
npm test
npm run build
```

`npm run verify:hotfix` should report **42 older AD checks plus 13 hotfix checks**.
If the main unit suite and production build succeed, finish with `npm run test:browser`.

## Release validation status

- 22 existing offline verify commands passed individually, plus `verify:ad-mission` and `verify:hotfix`.
- New hotfix verifier: 13 checks passed.
- Real Vitest, full TypeScript+Vite build, and Playwright remain **unverified** here due to npm registry DNS failures (`EAI_AGAIN`).

The application runs locally; no internet-facing AD components, real attack tooling, or backend changes were introduced.
