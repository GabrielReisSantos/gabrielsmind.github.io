# Upgrade to v2.4

**Recommended:** back up CyberLab progress from My Progress; unzip the complete release into a new directory rather than overwriting a known-good installation.

Existing hash routes, including `#world`, `#adlab`, `#unified`, and `#certification`, and all existing progress storage keys remain compatible. Added `#guide` and the optional `cyberlab-v24-guide-checklist` key. No grading data migration is required.

Upgrade from a verified v2.3.1 installation with `cyberlab-v2.4-patch-from-v2.3.1.zip` (extract at project root), or use the complete ZIP.

After upgrade run `npm install`, `npm test`, `npm run verify:all`, `npm run build`, and `npm run test:browser` with Playwright Chromium installed. To test gestures manually, check: Network 3D canvas drag/Shift-drag/wheel/pinch/buttons, WebGL 2D fallback, AD Academy > Investigate & Defend > 2D/3D selection, and refresh persistence of the new checklist and prior progress.
