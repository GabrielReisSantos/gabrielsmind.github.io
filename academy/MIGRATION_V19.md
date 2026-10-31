# Upgrade CyberLab 1.8 → 1.9

- Extract v1.9 into a **new** directory; keep the working v1.8 install as backup.
- `package.json` remains at ZIP root. Version is now `1.9.0`.
- Added **Purple Team Lab** in the Investigate navigation, AD Academy, and dashboard. Its URL is `/training/#purple`.
- All v1.8 files and learning modules are retained; the engine and AD Academy remain separate, with links between them. This is not an actual Windows or AD emulator.
- Saved v1.8 local progress is not migrated into a different origin automatically. Both versions use the same localStorage origin if hosted under the same domain. New keys are `cyberlab-v19-purple-progress-<scenario>` and `cyberlab-v19-purple-completed`.
- A new `verify:purple` script is in `npm run verify:all` and the CI quality workflow. An additional `tests/browser/purple.spec.ts` file covers attack/log/hardening and unsafe remediation flows.
- No new runtime npm package was added. Client-only deployment remains `/training/`.
- Release status is **source-verified**, not a confirmed production build until `npm install`, `npm run build`, and Playwright pass on your own Ubuntu environment.
