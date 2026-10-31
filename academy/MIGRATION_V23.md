# Upgrade CyberLab v2.2 → v2.3

1. Back up your existing local browser progress using **My Progress → Export**. Also copy the existing project directory.
2. Unzip the full v2.3 source project into a new directory, or apply the v2.3 patch only to an unchanged v2.2 checkout.
3. Run `npm install`, `npm run verify:native`, `npm run verify:all`, `npm test`, `npm run build`, `npx playwright install chromium`, and `npm run test:browser`.
4. Open `#world`, find the native enterprise scene at the top, and test cable `c1` shutdown/re-enable. Visit `#ngfw`, toggle the native enterprise rule, and return to `#unified` to inspect the propagated verdict.
5. On the first load, when no `cyberlab-native-enterprise-v23` record exists, the native rule initializes from the earlier `cyberlab-enterprise-v22.wsToApp443` setting. The existing AD delegated reset permission and earlier UR-001 draft remain intact.
6. Native configuration is saved under `cyberlab-native-enterprise-v23` and is included in standard CyberLab JSON progress backups. If restoring an older backup, the native model reinitializes from the older allow/deny preference.

**Release status:** The offline regression suite is executable here. Full Vite/Vitest/Playwright checks must be run in an environment with node modules. This remains a browser-only fictional simulator.
