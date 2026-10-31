# Verification — CyberLab v2.5.1

**User-reported v2.5.0 defects:** 1 failing Vitest assertion (invalid AD draft retest accepted) and 2 TypeScript build errors (optional scenario callback and unused import).

**Fixes validated locally (without npm packages):**

- `npm run verify:ad-mission`: 42 passed.
- `npm run verify:hotfix`: 42 inherited AD checks and 13 new assertions passed.
- All 22 other `verify:*` commands passed when run individually (topology, visual, design, quality, incident, practice, investigation2, coding, crypto, pki-advanced, adacademy, purple, certifications, cert-quality, purple-ui, experience, stability, unified, enterprise, native, usability, test-boundaries).
- Valid saved draft and retest remains usable; invalid, duplicate and unknown permissions and stale revisions cannot preserve a retest.
- TypeScript-only model compilation in `verify:ad-mission` passed. Syntax parsing of TS/TSX source passed.

**Not run here:** `npm test`, `npm run build`, and Playwright tests. npm registry unavailable (`EAI_AGAIN`), and local project node_modules are absent. Run these on Ubuntu and report any remaining errors.
