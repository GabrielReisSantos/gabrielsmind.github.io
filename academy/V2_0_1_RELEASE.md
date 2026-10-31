# CyberLab v2.0.1 — Production Quality release candidate

## What was actually changed

1. **Module crash recovery**: `LabErrorBoundary` protects each lazy-loaded route. On an import/render error it offers Reload Workbench and Back to Home. The rest of the application shell remains accessible. No saved learning data is cleared.
2. **Backup integrity**: extracted standalone `backupEngine.ts`, retained the v1 backup JSON format, validate record count/size and key names, and attempt a transactional rollback when localStorage rejects a write. Legacy backup files remain supported.
3. **Keyboard navigation**: the mobile navigation drawer focuses its Close control when opened, wraps Tab focus, and closes on Escape; the menu focus returns on dismissal. Updated small typography, responsive progress layout, focus and reduced motion styling.
4. **Quality gates**: standalone engine tests (`npm run verify:stability`), Vitest backup regression tests, Playwright tests for backup import/rejection, mobile keyboard handling and horizontal overflow, and a release doctor that checks for lockfile, dependencies, compiled `/training/` assets and browser suites.
5. **CI**: `.github/workflows/quality.yml` now uses `npm ci` rather than non-reproducible fallback installation, runs the stability verifier and validates built release artifacts. **It will fail until you create and commit a genuine package-lock.json**.
6. **No lab engine rewrites**: the 15 existing routes, simulation engines, exercises, exam history and browser progress key names remain unchanged.

## Limits and current release status

- The npm registry cannot be reached from the packaging environment (`EAI_AGAIN`), so we **cannot** honestly supply a generated dependency lockfile or claim a working full React/Vite build, Vitest suite or rendered Playwright test. Do not manufacture or handwrite a lockfile.
- `npm run verify:stability` and the previous offline TypeScript/Node regression scripts were run successfully. An isolated UI type check passed using local dependency shims; this is **not** equivalent to a real React type-check.
- Backup rollback is best effort if browser storage is permanently failing; user-facing errors explicitly report such failures. Imported backups are untrusted user data, and this remains a local, self-assessed training platform.
- Security tests and accessibility checks are scoped to selected workflows; full mobile, keyboard and screen-reader QA still requires a rendered browser test.

## Mandatory first Ubuntu installation

```bash
unzip ~/Downloads/cyberlab-interactive-v2.0.1-production-quality.zip -d ~/Desktop/cyberlab-v2.0.1
cd ~/Desktop/cyberlab-v2.0.1
npm install                      # resolves dependencies and creates a real package-lock.json
npm run verify:stability
npm test                         # must pass
npm run verify:all               # may re-run npm test; all verification scripts
npm run build                    # must pass
npm run release:check            # must pass only after genuine lockfile + dist exist
npx playwright install chromium
npm run test:browser             # desktop + mobile suites
```

`npm run qa:full` combines tests, offline verifications, build, release doctor, and browser tests (Chromium must already be installed). Once everything passes, commit `package-lock.json` alongside the source; future installs and GitHub Actions use `npm ci`.

## Acceptance checklist

- [ ] `npm test` passes with no skipped unexpected suites
- [ ] `npm run verify:all` passes
- [ ] `npm run build` produces `/training/assets/` URLs
- [ ] `npm run release:check` passes with generated, committed lockfile
- [ ] `npm run test:browser` passes in Chromium desktop and mobile
- [ ] Browser refresh preserves active certification exam deadline and answers
- [ ] Local export/import preserves learning history; malformed file is rejected
- [ ] Keyboard-only navigation, Close menu/Escape, skip to main content work
- [ ] Responsive layouts tested at 390px, 768px and desktop widths
- [ ] Loading or render failure in an individual workbench displays a recovery panel
- [ ] Existing `#world`, `#purple`, `#certification`, `#adlab` deep links work

## Next release

When this gate is green, work on v2.1 **Unified Cyber Range**: one shared fictional enterprise state consumed by the topology, Red Team terminal, Windows/NGFW telemetry, detection rules and remediation/replay engines.
