# Upgrade from v2.5.1 to v2.6.0

Install the **complete** ZIP into a fresh directory, or back up v2.5.1 and apply the smaller v2.6 patch to the project root. A patch is only appropriate for the v2.5.1 baseline.

```bash
npm install
npm run verify:passwords
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

Navigate to `http://127.0.0.1:5173/training/#passwords` (or the port shown by Vite). No migrations are required for old progress. The new record key is `cyberlab-password-audit-v26`; it is compatible with the existing `cyberlab-` backup allowlist. Only synthetic command history and your written notes are stored, not recovered passwords or hash files.

If `tsc` or `vitest` is not found, `npm install` was not completed in that project directory. Run `npm install` there; do not install these tools globally.
