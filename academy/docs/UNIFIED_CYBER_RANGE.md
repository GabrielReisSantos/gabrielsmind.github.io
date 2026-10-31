# CyberLab v2.1 — Unified Cyber Range (UR-001)

## Status and scope

This is a **deterministic browser-only simulation**, not a VM, lab network, Active Directory domain, Palo Alto firewall, endpoint sensor, or live SOC. UR-001 shares one state object across its topology, identity permissions, attacker access, synthetic Windows/NGFW/application event stream, detection rules, remediation controls, and replay. Existing separate CyberLab modules remain available but are **not yet connected to UR-001's state**.

## Scenario

- WS01 — fictional helpdesk workstation (10.10.10.42), user `lina.helpdesk`, member of `Helpdesk`.
- DC01 — fictional AD domain controller (10.10.10.10), containing account `svc-reports` with excessive delegated ResetPassword rights for `Helpdesk`.
- NGFW — fictional network policy device (10.10.10.1), allowing intended HTTPS access to APP01.
- APP01 — fictional reports application (10.20.10.20), where `svc-reports` has application administrative access. An approved `reports-scheduler` needs the same current service credential to run.

The attacker can reset the privileged service identity and authenticate to APP01. The student must observe causal audit events, distinguish authorized activity from suspicious activity, write a detection, remove unnecessary delegation, rotate the account credential, revoke old application sessions, synchronize the approved service credential, and verify three properties: attack blocked, approved application working, monitoring available.

## Learning workflow

1. `whoami`, `ad groups`, `ad inspect svc-reports`, `ad acl svc-reports`, `network trace app01`.
2. `simulate normal` to produce baseline authorized identity-admin and application traffic.
3. `attack reset svc-reports` followed by `attack login app01`.
4. Click the 4724 and 4624 attack events. Pin each as evidence. Each record references its causing `A#` action.
5. Enter a bounded detection rule, for example `event_id=4724 actor=lina.helpdesk target=svc-reports`, and confirm it matches a malicious record without matching an ordinary administrator reset.
6. Select the correct root cause and write a meaningful explanation (at least 50 characters).
7. `fix remove-reset-acl`, `fix rotate-credential`, `fix revoke-sessions`, `fix sync-application`.
8. `verify attack`, `verify service`, `verify monitoring`. Re-run all verification commands after **any configuration change**: old results belong to a previous revision and are invalidated.
9. When all criteria pass, export the Markdown report.

### Commands and telemetry

The console only accepts an exact allowlist (`help` displays it). Nothing executes on the host or remote networks. Command `A#` emits records `E#` with a `commandId` field. Normal, attack, and verification records have different `kind` labels. Sources are `windows` (DC01 / APP01), `firewall` (NGFW), or `application` (APP01).

- 4724: modeled successful password-reset attempt, emitted only when the reset is permitted and account-management auditing is enabled. A denied reset **does not** automatically produce 4724.
- 4624: successful modeled account logon; 4625: modeled failed account logon, contingent on the logon auditing control.
- 4672: modeled assignment of special privileges to the successful Windows logon. Its presence in an actual environment depends on the relevant account privileges and OS auditing behavior.
- `TRAFFIC`: **invented** NGFW-like synthetic traffic record; not a Palo Alto log schema.
- `APP-AUTH`: **invented** reports application log; not a standard Windows event ID.

The model is pedagogical and does **not** implement actual Kerberos packet exchanges, Windows authorization, ticket caches, Palo Alto App-ID, traffic decryption, or full event semantics. Use the separate foundational lessons for protocol-specific details.

### Detection expression format

Rules contain 2–6 whitespace-separated `field=value` clauses, e.g. `event_id=4724 actor=lina.helpdesk target=svc-reports`. Supported fields: `event_id`, `actor`, `target`, `source`, `outcome`, `family`. `event_id` and either `actor` or `target` are required. Exact, case-normalized comparisons only; no regex, code evaluation, or queries outside the current in-memory event list. Rules are evaluated against recorded events including baseline normal activity, so false-positive counts are visible.

### Red/blue replay design

Removing the excessive ACL prevents fresh reset attempts but doesn't invalidate a previously acquired credential or authenticated session. Rotating the service identity invalidates the stolen credential but can leave an existing application session alive. The legitimate application must be reconfigured to use the new secret, otherwise its scheduler fails. `verify attack` replays model checks at the *current* revision; if the simulated reset or unauthorized application logon is still possible, it reports failure and generates synthetic telemetry accordingly.

### Save and privacy

A draft is saved locally under `cyberlab-v21-range-draft`, and is restored through deterministic replay of **only allowlisted commands**. Learner selection, pinned event IDs, detection query, and explanation are restored. The mission completion marker is `cyberlab-v21-range-completed`, included in ordinary CyberLab progress backups. The simulator does not contain or collect real passwords, samples, endpoints, tokens, or PII. Browser localStorage is user-controlled and is **not** a trusted credential vault or tamper-proof grading database.

### Testing

- `npm run verify:unified` — standalone strict TypeScript compilation of the pure engine plus executable invariants.
- `npm test` — includes `src/unified/engine.test.ts` (real Vitest dependency required).
- `npm run build` — real TypeScript/Vite build (requires installed dependencies).
- `npm run test:browser` — tests desktop and mobile Chromium in Playwright, including `tests/browser/unified.spec.ts` (requires built site + installed Chromium).

## Extending beyond UR-001

Future integration can map the **same event and revision schema** into the preexisting 3D Network Range, AD Academy, NGFW and Certification modules. That cross-module bridge is not implemented in v2.1. New missions should not be superficial copies: they should have distinctly different causal graphs and independent business-service verification.
