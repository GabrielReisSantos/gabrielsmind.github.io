# v0.5 → v0.6 upgrade

**Install separately.** Do not overwrite the working v0.5 directory until your v0.6 local test and browser smoke checks pass. The project bundle is complete and the ZIP is flat (`package.json` at root). There is no database migration, backend configuration, network permission, cloud service or VM setup.

```bash
mkdir -p ~/Desktop/cyberlab-interactive-v0.6
unzip ~/Downloads/cyberlab-interactive-v0.6.zip -d ~/Desktop/cyberlab-interactive-v0.6
cd ~/Desktop/cyberlab-interactive-v0.6
npm install
npm test
npm run build
npm run dev
```

**Test the new pages:**

1. HTTP Playground → XSS: run vulnerable baseline, vulnerable risk probe, pin finding, patch, run patched risk probe and patched baseline, select correct root cause. The patched risk response must contain escaped `&lt;script&gt;` text and must not be treated as a failed fix merely because it returns HTTP 200.
2. HTTP Playground → IDOR: confirm the Alice session cannot access Bob's order when patched; changing the request header does not change the bound fixture identity.
3. AD Attack Paths → ACL scenario: analyze original path, pin two evidence records, diagnose GenericAll, remove that *excess* edge; legitimate SecOps Admin → APP01 must stay reachable.
4. AD Attack Paths → SPN scenario: verify the path is labeled conditional and do not interpret it as a successful password crack or credential compromise.
5. Traffic Timeline → Security policy shadow: capture a failed run, inspect two diagnostic sources, pin a failed event, choose the root cause, apply the least-privilege fix, record a passing run and inspect the changed stages.
6. Open previous CCNA, Zero Trust, NGFW, Packet Studio, Pentest Academy, Missions and Palo Alto Academy pages, confirming no regressions.

**Progress:** v0.1–v0.5 `localStorage` keys remain unchanged. The new HTTP and AD modules have independent solved-state keys. Results depend on browser origin; switching host/port can change accessible storage.

**Rollback:** stop v0.6 and run your untouched v0.5 directory. No server-state changes need reverting.
