# Migration from CyberLab v2.8.1 to v2.9

## Recommended: full source ZIP in a fresh directory

1. Export your progress from the v2.8.1 dashboard (or otherwise preserve your browser's `cyberlab-` localStorage).
2. Unzip the v2.9 full project into a **new** project folder. Do not overwrite the running v2.8.1 directory until v2.9 passes the local build and browser tests.
3. Run `npm install`, `npm run verify:all`, `npm run build`, `npx playwright install chromium`, and `npm run test:browser`.
4. Start `npm run dev` and open `/training/#explorer`; verify Home, Mission Room, AD Academy, and Secrets Storage Atlas still load.
5. **Do not delete localStorage** to fix any UI error. The new Explorer uses only `cyberlab-enterprise-explorer-v29`; the existing enterprise, progress and course keys were not renamed.

## Incremental patch

Only apply `cyberlab-v2.9-patch-from-v2.8.1.zip` to a **verified original v2.8.1** working tree, from its root; the patch does not contain all previous modules. It updates package.json (without a lockfile), route registry, App, Home, five legacy version-test regexes, the v2.0 navigation test and the new Explorer files. Run `npm install` and the full test suite after applying.

## Important shared configuration warning

The Explorer uses shared Enterprise Bridge and Native Enterprise stores. Fault injection is a real configuration change in those educational engines, and can change the initial state of existing shared missions. The Explorer's **Reset lab** confirmation restores the shared enterprise controls to their initial values and discards the Explorer-only timeline; it does not clear unrelated Academy course records.
