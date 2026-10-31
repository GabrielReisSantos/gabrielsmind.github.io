# Upgrade v2.7 → v2.8 Mission Room

Preferred: unzip the **complete v2.8 source** into a fresh directory, `npm install`, then verify before replacing your deployment. Alternative: apply the patch to an exact, clean **v2.7.0 Secrets Storage Atlas** source tree. **Do not apply the patch to v2.6 or earlier.**

No pre-existing storage keys or hash routes were renamed. Mission Room adds `#missionroom` and shares the **existing** `cyberlab-v21-range-draft`, `cyberlab-v21-range-completed`, enterprise and native state keys. The next-time-you-open-UR-001 transcript can reflect Mission Room changes and vice versa, by design. Export your learning progress before upgrading and before resetting shared controls.

Check `npm run verify:mission && npm run verify:all && npm run build`, then `npx playwright install chromium && npm run test:browser` on a computer with npm registry access.

The Mission Room **Reset** button resets shared AD and native NGFW enterprise settings (confirmation required). It does not reset progress in unrelated modules; prior UR-001 historical completion is retained.
