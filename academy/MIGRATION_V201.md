# Upgrade from v2.0 to v2.0.1

The package is a **complete CyberLab source tree**. It preserves all v2.0 source workbenches, routes, and localStorage key formats. No data migration is needed; your saved progress is tied to the browser origin, not the disk directory.

1. Back up the working v2.0 directory.
2. In the currently running app, use **My Progress → Export progress** before upgrading.
3. Extract the complete v2.0.1 ZIP into a new directory. Do not accidentally extract over an unrelated repository.
4. Run `npm install` **once** to generate the missing `package-lock.json` with real registry metadata. The packaging environment had no registry access and deliberately did not invent this file.
5. Run `npm run qa:full`. Install Chromium first with `npx playwright install chromium`.
6. Commit the generated `package-lock.json` before using the included GitHub Actions workflow, which now enforces `npm ci`.

**Important:** The v2.0.1 release doctor will deliberately fail until `package-lock.json`, `node_modules` and built `dist/index.html` exist. This is a guardrail, not a regression. See `V2_0_1_RELEASE.md`.
