# Upgrading from v2.0.1 to v2.1

1. Back up the existing v2.0.1 project and export user progress via **My Progress**.
2. Extract the **complete v2.1 ZIP** into a separate directory (recommended). A smaller patch from the exact v2.0.1 baseline is also available.
3. Run `npm install`, then `npm run verify:unified`, `npm run verify:all`, `npm run build`, and `npm run test:browser` after installing Playwright Chromium.
4. Open `http://127.0.0.1:5173/training/#unified` after `npm run dev`. The old hash links and legacy browser storage keys remain compatible.
5. Generate and commit `package-lock.json` on an internet-connected machine; the upstream package did not include a real lockfile because the npm registry was unavailable in the creation environment. Run `npm ci` in CI once committed.

## Storage

- `cyberlab-v21-range-draft`: local, replayable fictional mission transcript. Contains commands, selected event IDs and learner-authored diagnosis, not actual passwords.
- `cyberlab-v21-range-completed`: locally scored completion; included by the existing CyberLab progress backup exporter.
- `cyberlab-v11-last-activity`: now accepts the new route `unified`.

No existing storage keys are deleted or renamed. Downloaded reports are Markdown files; they do not alter progress.

## Troubleshooting

- If `npm test` fails, capture full assertion output. Avoid equating offline source verification with Vitest success.
- If `npm run build` fails, provide full TypeScript error lines, especially in `src/unified/UnifiedRange.tsx`.
- If `release:check` fails on lockfile, generate/commit it using `npm install`; do not write a synthetic lockfile.
- If `/training/#unified` doesn't load, use the exact port printed by Vite. The app has Vite `base: '/training/'` and uses hash routing.
