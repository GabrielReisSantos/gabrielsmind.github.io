# CyberLab Interactive v3.0 — Connected Campaigns

**NEW:** `/training/#campaign` · Three cascading interactive incidents spanning shared AD, native network topology, NGFW policy, simulated SOC telemetry, and a synthetic leaked service token. Explore, reproduce, pin evidence, remediate and complete ten independent checks per mission. Fully local browser simulation; **not** a live attack range. Browser-authored notes and assessment records are not tamper-resistant.

Start locally:

```bash
npm install
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

**Verification caveat:** v3.0 engine/static tests were run, but full dependency-backed production build and Playwright tests could **not** run in the packaging environment. The release requires those checks before publishing.

See **[V3_0_RELEASE.md](V3_0_RELEASE.md)** for details, **[MIGRATION_V30.md](MIGRATION_V30.md)** for upgrading, and **[DEPLOY_V30_SINGLE_SITE.md](DEPLOY_V30_SINGLE_SITE.md)** for a single GitHub repo and one public website deployment (Astro portfolio root + `academy/` Vite app).

---

# CyberLab Interactive v2.9 — Enterprise Systems Explorer

**New connected training workbench:** open `/training/#explorer` from the sidebar, Home or Labs. Inspect five systems, change actual shared AD/NGFW/topology controls, reproduce three distinct faults, correlate synthetic event evidence, repair security controls and demonstrate recovery with revision-aware independent verification. The interface is professional, responsive and entirely browser-local.

Read [v2.9 release notes](V2_9_RELEASE.md), [migration guidance](MIGRATION_V29.md), and [verification status](VERIFICATION_V29.md). The complete ZIP retains all previous Academy modules. This release **requires dependency-backed build and browser QA on your computer before publication**.

```bash
npm install
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

**Important:** the Explorer shares two simulation stores with other enterprise modules; changing controls will affect their shared scenarios. New Explorer progress is stored separately under `cyberlab-enterprise-explorer-v29`. No real traffic or credentials are involved.

---

# CyberLab Interactive v2.8 — Mission Room

**New flagship incident workspace.** Enter **Mission Room** from the sidebar, dashboard, or `/training/#missionroom`. Investigate a misconfigured Active Directory permission across the native enterprise topology, NGFW, service account, reporting application, and SOC telemetry. Execute bounded commands, pin evidence, write a detection rule, make repairs, intentionally test bad fixes, and run independent current-revision replay. The design is a responsive, high-fidelity dark cybersecurity operations interface. The source remains fully browser-only, with no real attack execution.

See [Mission Room release guide](MISSION_ROOM_V28.md). The room reuses the existing UR-001 unified engine and enterprise state; the Secrets Storage Atlas, password labs, and other standalone courses remain preserved. **No fabricated repo-token integration:** a future leaked-credential scenario will need its own connected engine.

```bash
npm install
npm run verify:mission
npm run verify:all
npm run build
npm run dev
```

Open the printed Vite URL under `/training/#missionroom`. After a successful install/build, run `npx playwright install chromium && npm run test:browser`. **Only the deterministic TypeScript and source-level gates ran here; Vite build and browser acceptance require npm dependencies not available in this environment.** The ZIP has no node_modules or lockfile; commit a generated package-lock.json after installation.

---

# CyberLab v2.6 — New Password Auditing Session

CyberLab now includes a browser-only, keyboard-first **Password Auditing Lab**, with eight coherent checkpoints and bounded real WebCrypto SHA-256 candidate comparisons. Open `/#passwords` under the `/training/` Vite base or from Pentest Academy. No real hash-cracking binaries, external targets, or stored credentials. See [lab guide](docs/PASSWORD_AUDIT_LAB.md), [release notes](V2_6_RELEASE.md), [migration guide](MIGRATION_V26.md), and [verification](VERIFICATION_V26.md).

> **v2.5.1 hotfix:** See [HOTFIX_V251.md](HOTFIX_V251.md) for AD draft-recovery and build fixes.

# CyberLab v2.3.1 — Vitest & Dashboard Hotfix

**Fixes from the Ubuntu log:** Vitest previously collected 15 Playwright browser specs and failed before they could run; the dashboard omitted the new `unified` destination from its local type and resume-label map. The new `vitest.config.ts` confines Vitest to `src/**/*.test.ts(x)` and the dashboard uses the central route registry. See [HOTFIX_V231.md](HOTFIX_V231.md).

**Run after installing dependencies:** `npm run verify:test-boundaries && npm test && npm run build && npx playwright install chromium && npm run test:browser`. Do not use `npm test` as a substitute for `npm run test:browser`; they are separate runners.

**Release gate:** v2.3.1 is not production-verified until the dependency-backed unit tests, Vite build and actual browser tests pass locally. If you already have a `package-lock.json` from v2.3.0, run `npm install` to update the lockfile to 2.3.1, then commit it.

---

# CyberLab v2.3 — Native NGFW / 3D Enterprise

**Upgrade:** A dedicated enterprise scene now computes physical and ordered NGFW policy verdicts for the Unified Cyber Range. See `docs/NATIVE_ENTERPRISE.md` and `MIGRATION_V23.md`.

# CyberLab Interactive v2.2 — Cross-Module Enterprise

**New in v2.2:** shared, persistent UR-001 enterprise controls linked between AD Academy, NGFW Simulator, 3D Network Range, and Unified Cyber Range. Helpdesk ResetPassword delegation and the WS01→NGFW→APP01 TCP/443 rule now affect the same simulated attack state, causally linked telemetry, and retest outcomes. See [v2.2 release notes](V2_2_RELEASE.md), [mission guide](docs/CROSS_MODULE_ENTERPRISE.md), [migration](MIGRATION_V22.md), and [verification](VERIFICATION_V22.md).

**Accuracy boundary:** only the explicitly labeled *Shared mission configuration* controls synchronize. The older AD, NGFW, and 3D exercises remain independent; editing arbitrary legacy policy rules, cable links, or graph edges does not alter the new shared mission. No real shell, PAN-OS, AD, network or authentication service is contacted.

---

# CyberLab Interactive v2.1 — Unified Cyber Range

**New:** UR-001, a connected identity/network/application attack-and-defense mission. Open `/training/#unified`. See [Unified Cyber Range Guide](docs/UNIFIED_CYBER_RANGE.md), [Release Notes](V2_1_RELEASE.md), [Verification](VERIFICATION_V21.md), and [Migration](MIGRATION_V21.md).

# CyberLab v2.0.1 — Production Quality candidate

See [v2.0.1 release details](V2_0_1_RELEASE.md) and [migration instructions](MIGRATION_V201.md).

# CyberLab Interactive 2.0 — Unified Experience

**Complete browser-only cybersecurity training platform.** This release redesigns the navigation, home, learning catalogs, progress overview, certification mode controls, and Purple Team workflow visualization while preserving legacy simulation engines, deep links, and progress keys.

[Release details](V2_RELEASE.md) · [Migration](MIGRATION_V2.md) · [Verification](VERIFICATION_V2.md)

## Installation (requires Node.js 22 and internet access to npm)

```sh
npm install
npm run verify:experience
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

The project uses the Vite base `/training/`. By default it is reachable at `http://127.0.0.1:5173/training/` in development. Existing hashes such as `#world`, `#adlab`, `#purple`, and `#certification` continue working. New hub routes are `#learn`, `#labs`, `#investigate`, `#progress`.

**Important:** This source release passed offline engine checks but the npm-backed full build and Playwright checks could not run here due to npm DNS access (`EAI_AGAIN`). Do not publish until those pass on your machine. No package-lock.json is supplied; generate one with npm install and commit it before deployment.

---

## Archived earlier-release documentation

# CyberLab Interactive v1.9.3 — Certification Quality

**New:** persistent timed exam attempts, flagged-question navigation, objective-aligned quality checks, spaced recall, and answer history. See [v1.9.3 release notes](CERTIFICATION_V193_RELEASE.md) and [verification status](VERIFICATION_V193.md). The full Vite/browser build requires local verification.

---

# CyberLab Interactive v1.9.2 — Certification Question Bank Expansion

**Certification Academy update:** 36 original questions each for the Palo Alto Networks Network Security Professional, NGFW Engineer and Cloud Security Professional training paths (**108 questions total**). Added 71 original scenario-based questions while retaining the original 37 and existing browser-saved study answers.

Question distribution follows the exam *domain weightings* from the supplied datasheets (Network Security Professional, June 2026; Next-Generation Firewall Engineer, November 2025; Cloud Security Professional, August 2025). The questions are independently authored study aids and **are not official Palo Alto exam questions or a predictor of official readiness**.

The timed practice now randomly selects **30 of 36 questions**, allocating coverage approximately by blueprint domain weight, with a **45-minute timer**. Answers and explanations are shown after submission; study mode continues to show immediate feedback and permits retries. Quiz progress is stored in the browser using the existing `cyberlab-cert-answers-v3` key.

| Certification | Domain question counts | Total |
|---|---|---:|
| Network Security Professional | 6 / 5 / 11 / 4 / 6 / 4 | 36 |
| NGFW Engineer | 14 / 14 / 8 | 36 |
| Cloud Security Professional | 4 / 5 / 10 / 10 / 7 | 36 |

**Verify after `npm install`:** `npm run verify:certifications && npm test && npm run build`. For browser verification: `npx playwright install chromium && npm run test:browser`. The older learning modules, Purple Team visual hotfix and `/training/` base path remain unchanged.

---

# CyberLab Interactive v1.9 — Purple Team Lab

**New:** Single-screen Red + Blue + Defense practice for fictional Active Directory environments, connected to the v1.8 AD Academy. Three scenarios, typed synthetic attack actions, Windows/endpoint event telemetry controlled by audit settings, detection tuning, narrow remediation, replay, evidence pinning and Markdown report export. No live attacks or domain connectivity.

Start at `/training/#purple`. See `docs/PURPLE_TEAM_LAB.md`, `MIGRATION_V19.md` and `VERIFICATION_V19.md`.

---

# CyberLab Interactive v1.8 — Active Directory Academy

**Static, browser-only training platform.** React + TypeScript + Vite, built for `/training/` on `www.gabrielreissantos.com`. No VM, backend, cloud account, real network scanning, or production secrets vault.

## v1.8 at a glance

**Active Directory Academy:** 8 concept lessons, Kerberos / NTLM stepper, seven-pattern abuse-and-defense reference, typed diagnostic terminal, graph investigation and gated remediation. The original AD Graph Lab remains available. See `docs/AD_ACADEMY.md`.

## Previous v1.7 features

**Foundations → PKI & TLS Engineering:** 43 typed drills across four learning tracks:

1. **Certificate Factory:** real WebCrypto ECDSA P-256 root CA (pathLen 1), constrained intermediate CA (pathLen 0), separate server and client keys, signed PKCS#10 CSRs, serverAuth and clientAuth X.509 leaves, PEM export (certificates and CSRs only).
2. **TLS & mTLS diagnostics:** deliberately missing intermediate, wrong DNS SAN, simulated expiry, untrusted anchor, synthetic revocation, and mutual client certificate authentication. `openssl s_client` is simulated; no TLS socket is established. Commands use a deliberately limited OpenSSL-compatible learning syntax.
3. **NGFW Decryption:** conceptual, Palo Alto-inspired Forward Proxy versus Inbound Inspection, Forward Trust/Untrust roles, upstream identity checks, and private-key requirements for inbound inspection. Does not run PAN-OS or decrypt real traffic.
4. **Secrets & API:** fictional inventory scopes, controlled overlap during rotation, consumer cutover, stale-token revocation, `401/403`, audit confirmation, a Python source-structure exercise, and an NGINX TLS/mTLS configuration exercise.

### How to start

Start the root-to-leaf exercises **in order**; all tracks share the *same ephemeral in-memory session*. After completing the Certificate Factory, practice the TLS track. A required dependency that is missing will produce a meaningful diagnostic instead of silently succeeding. Use **Clear & repeat** to practice typing the command unaided.

**Practice scores** distinguish independent typing from hint/paste-assisted completion; successful independent repetitions are scheduled for review after 1, 3, 7, and 14 days. They are training prompts, not verified skill certification.

### Installation on Ubuntu

```bash
cd ~/Desktop
mkdir -p cyberlab-interactive-v1.8
unzip ~/Downloads/cyberlab-interactive-v1.8-ad-academy.zip -d cyberlab-interactive-v1.8
cd cyberlab-interactive-v1.8
npm install
npm run verify:adacademy
npm run verify:pki-advanced
npm run verify:all
npm run build
npm run dev
```

Use the URL printed by Vite, ordinarily `http://127.0.0.1:5173/training/`. Navigate to **Foundations → PKI & TLS Engineering**. Test the production build with `npm run preview` before deploying.

### Run browser tests

```bash
npx playwright install chromium
npm run test:browser
```

### Cryptography boundaries

- The built-in keypair, CSR and certificate generation uses **real browser WebCrypto**. You can download root, intermediate, server and client public X.509/CSR artifacts. Browser keys are **throwaway demonstration keys**; private key export is deliberately disabled in the advanced module.
- The imported OpenSSL-style CLI commands run inside a **restricted interpreter**; no arbitrary shell code executes.
- Full RFC 5280 path validation, OCSP/CRLs, live TLS, PAN-OS decryption and production credential storage are **not implemented**. Revocation and policy decisions are bounded simulations.
- Client-side source checks for NGINX and Python do **not** compile, execute or attest to secure behavior. Use a real interpreter and configuration checker in a separate, properly controlled training environment when appropriate.
- Student code should contain **no real API keys, private keys, personal information or confidential customer records**. Only non-sensitive practice metadata is saved in the browser.

## Existing modules preserved

CCNA, Zero Trust, network range (2D/3D), packet flow, NGFW, troubleshooting, original Coding Foundations, original Crypto Foundations, Palo Alto certification training, OSCP missions and deep practice, Active Directory, HTTP Playground, and investigation workbenches remain present.

## Deployment

Vite remains configured with `/training/` as base. See `DEPLOYMENT.md`; deploy only after **`npm run build` and Playwright succeed locally**.

## v1.8 — Active Directory Academy

Navigate to **Learn → AD Academy · Kerberos & Paths** (route `#adlab`).

The AD Academy introduces eight structured foundations lessons: directory objects, domains, forests, DNS-based DC discovery, LDAP, Kerberos, NTLM, delegated ACLs, GPOs and privilege paths. It includes a simulated Kerberos/NTLM authentication sequence with fault injection; a seven-pattern Abuse & Defense Atlas; and a redesigned investigation workbench that shares the v0.6 graph scenarios.

### Browser-only training and safety

* All diagnostic commands are entered manually but evaluated by an allowlisted in-memory engine. No PowerShell, Windows API, Kerberos ticket operation, LDAP connection, NTLM negotiation, password guessing, or directory modification occurs.
* Graph edges describe potential permission relationships. **A modeled path is not proof of exploitation.** Conditional rights and privilege prerequisites are documented.
* Investigation scoring requires a baseline captured before editing, independent relevant observations, diagnosis, a narrow fix, a fresh same-revision retest, intact approved access, and a technical explanation.
* Completed concept checks and investigations are recorded in `localStorage`; they can be backed up using the existing progress exporter. They are not certified or tamper-resistant grades.
* The original AD Graph Lab remains accessible through the **Original Graph Lab** tab.

### Verify

```bash
npm install
npm run verify:adacademy
npm run verify:all
npm run build
npm run dev
# After playwright browsers are installed:
npx playwright install chromium
npm run test:browser
```

The v1.8 standalone source-level test suite does not replace the real npm build or browser acceptance tests. Do not publish until those pass on your system.

## v1.9.1 Purple Team build hotfix & correlation timeline

- Removed unused imports that failed the strict TypeScript production build.
- Corrected AES-GCM decryption to supply WebCrypto-compatible `ArrayBuffer` copies rather than casting a possibly shared buffer.
- Fixed Purple Team Vitest setup to run the required independent `test legitimate` probe before expecting a passing grade. The **grader remains strict**.
- Added Red Team action -> Windows event -> detection visual correlation (Before, After, Compare). The timeline is derived from the existing state; it cannot invent missing events.
- Added `npm run verify:purple-ui` (offline behavioral verification) and correlation unit tests.

### Validate on Ubuntu

```sh
npm install
npm run verify:purple-ui
npm run verify:purple
npm test
npm run build
npm run dev
```

If Vitest still reports failures, save the **complete failing assertion and stack trace** from `npm test -- --reporter=verbose` because only the Purple Team assertion at line 17 was included in the original report.

## v2.4: How to Use, Camera & AD visualization
The new `#guide` explains controls and guides a learner through their first investigation. The 3D network canvas supports orbit, pan, scroll/pinch zoom, keyboard movement and camera reset. In AD Academy > Investigate & Defend, the same permission graph can be explored in 2D or perspective-projected 3D with evidence-backed milestones. See `V2_4_RELEASE.md` and `MIGRATION_V24.md`.

---

## v2.5 — AD Mission Control and verified onboarding

AD Academy's *Investigate & Defend* mode now saves per-case drafts, shows the next evidence-based objective, and supports Guided vs Independent learning. Its shared 2D/3D graph adds identity search, relationship filters and focus controls. The How to Use checklist records six actual learner actions rather than accepting manual checks. Existing labs and completed missions remain available.

See [v2.5 release notes](V2_5_RELEASE.md), [migration guide](MIGRATION_V25.md), and [verification results](VERIFICATION_V25.md). Browser/local build checks are **not yet verified** in this release package.

### v2.7 — Secrets Storage Atlas

A 14-case browser-only OSCP-oriented learning workbench covers credential/verifier storage and exposure in GitHub, SQL/databases, Windows, Linux, macOS, iPhone/iOS, and containers/Kubernetes. Learners use a **restricted simulated console**, classify findings from fictional evidence, apply the modeled control, and retest. Per-case progress is replay-validated and included in browser backups. No real system, service, repository or device is accessed. Open `/training/#secrets`; see [`docs/SECRETS_STORAGE_ATLAS.md`](docs/SECRETS_STORAGE_ATLAS.md) and [`V2_7_RELEASE.md`](V2_7_RELEASE.md).
