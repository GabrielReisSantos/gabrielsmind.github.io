# CyberLab Interactive v3.0 — Connected Campaigns

## Built on v2.9; existing Academy preserved

The new **Campaign Room** route `/training/#campaign` introduces three sequential incident missions that consume the real shared in-browser enterprise AD and native topology/NGFW stores:

1. **Identity breach:** Excess ResetPassword delegation enables a modeled impersonation session. Remove the right, revoke the session and preserve allowed reports HTTPS.
2. **The guest pivot:** Two independent guest-access policy layers are deliberately opened. Learners must investigate both, restore defense in depth, and terminate the resulting session while protecting business access.
3. **Silent token abuse:** A fictional reports API token is exposed while the local simulated SOC sensor is offline. Learners must document the blind spot/impact, restore monitoring, rotate the token, terminate the surviving session, and retest. Historical data access remains recorded even after successful response.

Each mission includes a responsive topology/workbench, clickable devices, deliberate fault injection, replay, synthetic events (explicitly distinguished from sensor-ingested events), evidence pinning, root-cause options, written case notes, security-negative/availability-positive probes and ten evidence-based exit checks. Completion unlocks the next mission. Campaign progress stored under `cyberlab-connected-campaign-v30` and included in `cyberlab-` progress backup. Earlier Academy keys and components are unchanged.

## Engine boundaries and important caveats

- **Shared:** AD helpdesk reset permission, WS01 reports allow policy, and native guest topology/NGFW rules. Changes affect Systems Explorer and other modules using those two shared stores.
- **Campaign-local:** attack sessions, the synthetic exposed reports API token, monitoring flag, data-access consequence, captured evidence and written incident reports. These do **not** represent real GitHub tokens or Secrets Atlas case state. They are not synchronized into arbitrary standalone Academy modules.
- Commands are fictional and no real passwords, malware, packets or network services are executed.
- No trusted identity or tamper-proof grading: a browser user can modify local storage or source code.
- Reset clearly warns before resetting **shared** enterprise controls. Other course progress is not cleared.

## Test status in the creation environment

Passed: `npm run verify:campaign` (40 deterministic checks), `npm run verify:campaign-ui` (16 static UI/route checks), previous v2.9 UI and v2.8 Home regression checks, native enterprise (35), Enterprise Bridge (52), Unified (38), Mission Room (20), Systems Explorer (24), experience navigation (128), and selected legacy invariants.

**Not passed / not executed:** Full `npm test` (Vitest), `npm run build` (Vite + app TypeScript), and Playwright browser tests. npm registry was unreachable. Browser scripts are supplied for desktop and mobile and must pass on a network-connected machine before GitHub Pages publication. Do not interpret static TSX source checks as proof the UI rendered in a browser.

## Install locally

```bash
unzip cyberlab-interactive-v3.0-connected-campaigns.zip -d ~/Desktop/cyberlab-v3
cd ~/Desktop/cyberlab-v3
npm install
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

Open `http://127.0.0.1:5173/training/#campaign` (or the local URL shown by Vite).

## Deployment recommendation

See `DEPLOY_V30_SINGLE_SITE.md` for the **one Astro portfolio repository + `academy/` folder + one GitHub Pages deployment** approach and `deployment-portfolio/single-repository-deploy.yml` for the copy-ready workflow. Deploy only after the required local build and browser checks pass.
