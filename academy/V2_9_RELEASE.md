# CyberLab Interactive v2.9.0 — Enterprise Systems Explorer

## Release focus

A purpose-built, professional, responsive **Enterprise Systems Explorer** that makes cause and effect tangible in the existing browser-only Academy. Open `http://127.0.0.1:5173/training/#explorer` or navigate from Home / the sidebar / Labs. This is the **complete project source**, not a standalone mockup or a generated screenshot.

### What learners can do

- Inspect five clickable systems: WS01, DC01, NGFW, APP01 and GUEST. The 2D visualization renders the **actual cable configuration** from the existing native topology state; select a node to inspect zone, IPv4 address, interfaces, active links and related records.
- Introduce and repair three different modeled faults: excessive AD reset delegation, broken approved reporting HTTPS, and a guest network exception that affects **both** the topology policy and the independently evaluated native NGFW rulebase.
- Run four deterministic probes: directory/reset permission, approved TCP/443 business flow, guest-to-DMZ flow, and cross-domain unauthorized-session replay.
- Review the synthetic timeline and its source, current configuration revision, packet path, result and detailed cause; pin incident evidence. When SOC monitoring is disabled, simulated probes continue but their record is explicitly marked as a blind spot.
- Remediate individual controls, revoke unauthorized sessions, preserve business traffic and security telemetry, and retest.
- Complete six independent verification requirements: least privilege; business flow; topology **and** firewall guest denial; SOC monitoring; attacker-session revocation; and fresh current-revision probes plus pinned **problem** evidence.
- Export a case report in Markdown. Guided mode provides phased explanations; independent mode hides task guidance. Browser state is replay-safe and uses bounded validated records.

### Boundaries and accuracy

- This is an **educational simulator**, not real AD/NGFW traffic, a network capture, real SOC telemetry, an SIEM or a PAN-OS implementation. No backend, Linux privilege, shell execution or external network access required.
- The Enterprise Bridge (`cyberlab-enterprise-v22`) and Native Enterprise (`cyberlab-native-enterprise-v23`) are shared with prior modules. The Explorer only owns its workflow/session/timeline under `cyberlab-enterprise-explorer-v29`. **An Explorer configuration change can affect existing shared mission exercises.** A reset prompts for confirmation and resets the two shared enterprise stores; it does not reset unrelated course progress.
- Guest access is evaluated in two real simulation stages: a native physical/topology `simulate()` call and a separate `evaluateNgfw()` call. A single open layer is explicitly classified as *weakened defense in depth*, **not** a successful end-to-end connection. Both layers must deny to pass remediation grading.
- Learner-collected evidence is synthetic, not a defensible forensic artifact. Saved localStorage and exported reports are user-editable; no server-trusted certification or tamper-proof grades are claimed.

### Source changes

- New `src/explorer/{engine.ts,engine.test.ts,SystemsExplorer.tsx,explorer.css}`
- Navigation / Home / route registry integration
- `VERIFY_V29.cjs`, `VERIFY_V29_UI.cjs`, `tests/browser/explorer.spec.ts`
- Existing version-gated regression scripts extended to accept v2.9; **all previous modules remain in the complete ZIP**
- New source-only commands: `npm run verify:explorer`, `npm run verify:explorer-ui`.

### Installation and verification

```bash
unzip cyberlab-interactive-v2.9-systems-explorer.zip -d cyberlab-v2.9
cd cyberlab-v2.9
npm install
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

Visit the development server's `/training/#explorer` route. For publication under the personal site, Vite's base remains `/training/`.

### Release verification status

The TypeScript pure-engine compiler, scenario assertions, route checks and existing off-line regression suites run successfully in the packaging environment. **Full dependency-backed Vitest suite, Vite production build, and Playwright desktop/mobile flows remain unverified** because the npm registry cannot be resolved (`EAI_AGAIN`). `package-lock.json` and `node_modules` cannot be generated here; complete these checks on a connected machine before public deployment. Do not claim production readiness until they pass.
