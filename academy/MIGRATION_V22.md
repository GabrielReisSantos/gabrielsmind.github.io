# Upgrade from CyberLab v2.1 to v2.2

1. **Back up existing progress** from My Progress → Export before replacing files.
2. Back up the current source directory, then extract the **full v2.2 ZIP** into a new directory, or extract the patch into the **v2.1** source root.
3. `npm install` (and commit the generated `package-lock.json` to your repository if one does not yet exist).
4. `npm run verify:enterprise`, `npm run verify:all`, `npm run build`, `npx playwright install chromium`, `npm run test:browser`.
5. `npm run dev`, then visit `/training/#ngfw`, `/training/#adlab`, `/training/#world`, and `/training/#unified`.

All original deep links and standalone training scenarios remain. The new canonical enterprise store is separate from existing sandbox settings. Existing UR-001 command drafts restore and then receive the current shared enterprise controls, invalidating old retests when any relevant control differs.

To start with an exposed training scenario, use **Reset shared controls** in the connected enterprise panel, then **Reset mission** in Unified Cyber Range if you want a clean command transcript.

If your version is v2.0 or earlier, use the **complete** ZIP rather than the v2.1 patch.
