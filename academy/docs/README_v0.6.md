# CyberLab Interactive v0.6 — Web Playground, AD Graph, Traffic Correlation

**Independent browser-only cybersecurity study application.** React 18 + TypeScript + Vite. No cloud lab, VM, Proxmox, Docker, privileged execution, scanning services, database, API backend, or live network exploitation.

> This is an original educational simulator, **not** an official Cisco, Palo Alto Networks, or OffSec product, certified exam emulator, or substitute for authorized hands-on practice. All exercise hosts, users, attack outcomes, and response bodies are fictional fixtures.

## Install and run on Ubuntu

Download `cyberlab-interactive-v0.6.zip` and extract it into **a new directory** so v0.5 remains available for rollback:

```bash
mkdir -p ~/Desktop/cyberlab-interactive-v0.6
unzip ~/Downloads/cyberlab-interactive-v0.6.zip -d ~/Desktop/cyberlab-interactive-v0.6
cd ~/Desktop/cyberlab-interactive-v0.6
npm install
npm test
npm run build
npm run dev
```

Open `http://localhost:5173/` (or the address displayed by Vite). **`package.json` is at the ZIP root.** Node 20+ is recommended; Node 22 is suitable. Progress from v0.5 remains in the same browser's `localStorage` when using the same origin. The new module progress keys are separate.

## New in v0.6

### HTTP Playground — five complete vulnerability/repair workflows

Nav **HTTP Playground** (also linked from **Pentest · OSCP**). Every exercise has:

1. An editable HTTP method, *relative fixture path*, headers, and body.
2. A safe baseline request and a controlled probe to load into the editor.
3. Vulnerable/patched behavior toggle.
4. Synthetic response status, headers, content, trace and illustrative code snippets.
5. An evidence register, root cause diagnosis and Markdown evidence export.
6. Completion gates requiring **normal vulnerable baseline, demonstrated finding, pinned proof, patched risk prevention, normal patched baseline, and correct diagnosis**.

| Exercise | Risk indicator | Patched control |
| --- | --- | --- |
| Reflected XSS | HTML-like marker reflected without encoding | Contextual HTML escaping (200 response with safe encoded text) |
| SQL injection | Malformed item condition produces unintended synthetic result set | Bound parameter with input validation |
| Object authorization / IDOR | Alice can read Bob's test order | Server-side object ownership check |
| Path traversal | Synthetic private path marker returned outside document root | Allowlisted filename with constrained path |
| Unsafe uploads | Risky active-content file accepted under client-supplied MIME/extension | Server-side allowlist, private storage and attachment serving |

**Important limits:** No real SQL engine, filesystem, uploaded file, DOM script execution, proxy, HTTP request, login, database, or security exploit. Inputs are interpreted by fixed TypeScript fixture functions. The `X-Lab-Identity` header is editable metadata; identity is deliberately bound to Alice inside the fixture and cannot be spoofed. Request and response content is rendered as text, never inserted into the page as HTML.

### Active Directory Attack Paths — three visual investigations

Nav **AD Attack Paths**. Scenarios cover **overdelegated service ACLs**, **conditional SPN / weak service identity exposure**, and **excessive GPO editing rights**. The SVG graph offers clickable nodes and edges, a highlighted potential path, fictional directory evidence, root-cause analysis and least-privilege permission toggles. Validation requires:

- Inspecting the initial risky path.
- Pinning two evidence records and identifying the root cause.
- Breaking the risky path without breaking the authorized administrative path.
- Changing only intentionally excess privileges, not essential group memberships.

**Important limits:** Reachability in a simulated relationship graph is *potential exposure*, not actual credential theft, ticket exploitation, GPO execution, lateral movement or domain compromise. Conditional edges require assumptions such as weak passwords, actual account control, authentication and target configuration. There is no BloodHound connector or live directory access.

### Traffic Correlation — eight cross-source failure timelines

Nav **Traffic Timeline**. Reuses all eight v0.5 Troubleshooting Lab scenarios through **the same `runProbe()` engine**. The UI generates fictional chronological events with a common flow identifier, layer/source labels, status, diagnostic detail, event pinning, source filters, and stage comparisons between failed and repaired probes. Learners must:

- Record a failing flow, inspect two different diagnostic sources, pin a failed/warning event.
- Identify the matching root cause, adjust one configuration control and record a passing **secure** retest.
- Compare changed stages in the before-and-after timeline.

**Important limits:** Neither PAN-OS traffic logs nor PCAPs are parsed; flow timestamps and diagnostic output are synthetic. The stage ordering is an explanatory abstraction, not exact forwarding-plane implementation.

## Previous modules preserved

- Foundations + CCNA subnetting, VLAN, trunking, routing, services, knowledge checks.
- Zero Trust / network segmentation workbench.
- NGFW training, original troubleshooting, Packet Studio.
- Palo Alto Network Security Professional, NGFW Engineer, Cloud Security Professional study tracks (original short questions).
- OSCP-oriented full 20-module / 61-unit / 188-objective map, 12 original small fixtures.
- OSCP Mission Control with five evidence-gated multistage investigations and Markdown reporting.

## Project structure

```text
src/
  App.tsx                         navigation
  webplay/httpEngine.ts          in-memory HTTP fixture engine
  webplay/WebPlayground.tsx      request/response interface
  adlab/adEngine.ts              conditional permission graph and path search
  adlab/ADGraphLab.tsx           interactive SVG graph and repair workflow
  correlation/correlationEngine.ts   correlated events from existing runProbe()
  correlation/CorrelationWorkbench.tsx  timeline and repair comparison
  v6.css                         new-module interface styles
  deep/                           original troubleshooting engine / UI
  pentest/                        original curriculum and missions
  foundations/,ngfw/,advanced/,certification/ ... original modules
```

## Tests and validation

- `npm test` runs existing Vitest suites and three added engine suites.
- `npm run build` runs TypeScript and Vite compilation (must be performed on your computer).
- An **offline core check** is available even if Vitest cannot be installed:

```bash
tsc --strict --target ES2022 --module commonjs --moduleResolution node \
  --outDir /tmp/cyberlab-engine-build \
  src/webplay/httpEngine.ts src/adlab/adEngine.ts \
  src/correlation/correlationEngine.ts src/deep/troubleshootEngine.ts
node VERIFY_ENGINE.cjs /tmp/cyberlab-engine-build
```

The offline check verifies 103 assertions on outcome consistency and evidence/repair gates. See `VERIFICATION.md` for precise boundaries.

## Safety, data and privacy

The new learning engines do not invoke `fetch()`, `XMLHttpRequest`, `WebSocket`, arbitrary shell commands, external HTTP endpoints, eval, a database, or a real filesystem. Markdown exports are Blob downloads. Your progress is stored locally in browser `localStorage`. No Google Fonts request is made (system font fallback used). If you publish the app, standard browser hosting still transfers its static assets from the host; this does not create a cloud *lab environment*.

## What comes next

Prioritize deeper correctness and guided feedback before increasing breadth: HTTP cookie/session state, context-specific injection demonstrations, multi-hop AD graph constraints, and cross-source timeline realism. Expand the number of substantive practice cases only once the existing ones pass usability and technical review.
