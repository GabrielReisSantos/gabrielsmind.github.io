# CyberLab v2.8.1 — Home Dashboard Crash Hotfix

## What failed

The v2.8 Home dashboard rendered `<Crosshair>` for the new Mission Room feature card, but `Crosshair` was absent from its `lucide-react` import. That produced `ReferenceError: Crosshair is not defined` at render time. The route-local error boundary then showed “This workbench couldn’t load.” Vite could start normally despite the runtime defect.

## Fix

- Imported `Crosshair` in `src/experience/Dashboard.tsx`.
- Added a Playwright Home → Mission Room smoke test (desktop and mobile projects).
- Added `npm run verify:home` to reject unresolved JSX component names in the Home dashboard, app shell and Mission Room source. The check is part of `verify:all`.
- Bumped package and interface version to 2.8.1. No learning-state schema or browser storage keys changed.

## Upgrade on Ubuntu

**Full release:** extract the complete v2.8.1 ZIP to a **new directory**; `npm install`, `npm run verify:all`, `npm run build`, `npm run dev`, and open `/training/#home`. Do not delete browser storage.

**Minimal patch:** from your existing v2.8 project root, extract `cyberlab-v2.8.1-hotfix-patch.zip` with paths preserved. Restart Vite if needed. The patch contains only modified source, regression tests, script, package manifest and this note; it does not install dependencies or overwrite learning progress.

## Validation status

Pure TypeScript engine regressions and JSX static checks run in the packaging workspace. `npm install`, full browser execution, Vitest and Vite build could **not** complete there because DNS/network access to the npm registry returned `EAI_AGAIN`. Run the above commands on Ubuntu before deploying publicly. This package does not include `node_modules`, generated `dist`, or a lockfile.

## Immediate manual alternative

If you do not want to download a new archive, add `Crosshair` to the named `lucide-react` import in `src/experience/Dashboard.tsx`, save and reload Home. No localStorage reset is required.
