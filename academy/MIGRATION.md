# Upgrade v1.6 → v1.7

1. Keep the v1.6 folder as a backup. Unzip this package into a **fresh** directory.
2. Run `npm install`, `npm run verify:pki-advanced`, `npm run verify:all`, and `npm run build`.
3. Open the local `/training/#foundation` URL and select **PKI & TLS Engineering**.
4. Follow the Certificate Factory in order; its keys and certificates are in memory only and reset on reload.
5. Existing v1.6 progress records remain unchanged. New recall history uses `cyberlab-pki-v17-practice` in localStorage and is included by the existing progress export feature.
6. This is not an upstream change to the public website. Publish only after all local checks pass.

### Changes made

- Add `src/foundations/pkiadvanced` with `engine.ts`, `lessons.ts`, `recall.ts`, `AdvancedPkiLab.tsx`, `advanced.css`.
- Extend the shared lab DER issuer with configurable CA pathLen and server/client EKU; old callers retain valid defaults, and the root now supports issuing one intermediate.
- Add new learning and dashboard entry, new progress metric, browser tests, and offline integrity harness.
- Update release/version and documentation. No new runtime dependencies.
