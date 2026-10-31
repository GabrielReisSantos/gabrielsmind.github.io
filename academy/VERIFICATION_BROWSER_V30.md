# Cyber Academy v3.0 browser validation

Validated locally on 31 October 2026 on `feature/website-academy`.
Environment: Node.js v24.14.0, Playwright 1.64.1, desktop Chromium and Pixel 7 mobile Chromium.

## Findings and corrections

The initial targeted production-browser run reproduced **8 failures and 8 passes**:
the same four selector failures on both device profiles. Error messages and Playwright
accessibility snapshots matched the rendered components and their event handlers.

| Area | Root cause and classification | Correction |
| --- | --- | --- |
| OSCP Deep Practice | Outdated selector: `/Evidence report/i` matched both the navigation button and the notebook's `Prepare evidence report` action. Both intentionally open the report. | Select the exact `Evidence report` button inside the `Case views` navigation. The report sections, evidence citations, retest and replay assertions remain intact. |
| Purple Team | Outdated selector: the RC4 ticket event appears in both the correlation ribbon and the telemetry stream. | Assert the exact event text within `#pt-telemetry`. The attack, evidence pinning, detection, hardening, legitimate-access probe and assessment still run through the actual simulator. |
| Secrets Storage Atlas | Outdated selector: `/Windows/` matched the platform selector and a Windows investigation button. | Scope the platform button to `Secret storage environments`. Typed evidence, rejected premature retesting, classification, remediation and reload persistence assertions remain intact. |
| 3D Range | Outdated selector: the native enterprise editor and classroom topology each render independent camera controls and instructions. | Scope to the classroom `.world-main` panel. Preserve instruction visibility and verify that zoom and pan change the readout and reset restores the original camera state. |
| Full verification | Repository-layout/environment bug: two verifiers expected `.github/workflows/quality.yml` inside the formerly standalone Academy. No such workflow existed in the combined repository. | Resolve the repository-root quality workflow, retaining support for a standalone Academy checkout and all existing CI assertions. Add an executable root workflow. |
| Combined deployment | Build-integration bug: the existing Pages workflow built only Astro and omitted Academy from `/training/`. | Require the reusable Academy quality workflow, download its validated build into `public/training/`, and check the combined output before the existing deployment step. |

No application runtime or simulation-engine changes were needed. No new timing delays,
mocked simulation outcomes, disabled tests or weakened security checks were introduced.
The four existing desktop skips cover tests that only apply to the mobile project.

## Files changed for this task

- `academy/tests/browser/practice.spec.ts`
- `academy/tests/browser/purple.spec.ts`
- `academy/tests/browser/secrets.spec.ts`
- `academy/tests/browser/usability.spec.ts`
- `academy/VERIFY_V2.cjs`
- `academy/VERIFY_V201.cjs`
- `.github/workflows/quality.yml` (new reusable quality workflow, also runs on pull requests)
- `.github/workflows/deploy.yml`
- `academy/VERIFICATION_BROWSER_V30.md` (this report)

The Academy directory was already untracked when this work began. Its task-specific
changes were reviewed against a saved initial snapshot, alongside the tracked Git
diff. The entire `academy/src/` tree is identical to that snapshot. Existing unrelated
portfolio edits, saved-progress keys and enterprise-state implementations were preserved.

## Final validation

The required commands ran from `academy/`, with a fresh production build before the
complete browser suite:

```sh
npm run verify:all
npm run build
npx playwright test --workers=1 --reporter=list --retries=0
```

| Check | Result |
| --- | --- |
| `npm run verify:all` | Passed every verification gate, including 230 unit tests in 35 files; no unit failures or skips. |
| `npm run build` | Passed TypeScript and Vite production build. |
| Complete desktop Chromium suite | 53 passed, 0 failed, 4 existing mobile-only skips. |
| Complete mobile Chromium suite | 57 passed, 0 failed, 0 skipped. |
| Complete browser suite total | **110 passed, 0 failed, 4 skipped** across 23 spec files. |
| Four repaired browser modules, both projects | 16 passed, 0 failed, 0 skipped. |
| `npm run release:check` | Passed, 0 problems. |
| Root `npm run verify:content` | Passed portfolio content and asset preservation checks. |
| Root `npm run build`, with Academy output in `public/training/` | Passed combined production build. |
| Combined output integrity | All 92 Academy production files are byte-identical under `dist/training/`; portfolio root index exists. |
| Combined-site browser checks | Launch, native enterprise and campaign specs through Astro production preview: 17 passed, 0 failed, 1 existing desktop skip. |
| Workflow checks | Both YAML files parse; required commands, working directory, reusable-job dependency and artifact handoff verified. |
| Diff review | Reviewed task changes and whitespace checks; no unrelated source changes. |

The unchanged unit and browser suites continue to test failed/cosmetic remediation,
broken approved traffic, incorrect policies and permissions, missing evidence, stale
verification, reload persistence and cross-module enterprise consequences.

Local evidence is available in `/tmp/academy-verify-all.log`, `/tmp/academy-build.log`,
`/tmp/academy-playwright-full.log`, `/tmp/academy-combined-build.log` and
`/tmp/academy-combined-browser.log`. Initial failure traces and accessibility snapshots
were preserved under `/tmp/academy-browser-failures/`. The combined-site checks used a
temporary Playwright configuration and a separate output directory, preserving the
default full-suite results.

## Readiness and limits

The Academy is ready for review and the combined GitHub deployment from the local
build/test perspective. The hosted GitHub Actions workflow and live published site
have not been executed or verified. Validation covers the configured desktop/mobile
Chromium projects; Firefox and Safari are outside this suite.

Astro reports a pre-existing public-file conflict for `/cyberlab/index.html`; its
build still passes. This unrelated portfolio route was not modified.

No commit, push, merge or deployment was performed. Generated Academy integration
files remain ignored build output; no learning progress was deleted.
