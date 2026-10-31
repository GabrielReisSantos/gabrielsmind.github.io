# Purple Team Lab — AD attack, telemetry, detection, remediation

## Scope and educational intent

CyberLab v1.9 adds a **single-screen Purple Team workspace** to the v1.8 standalone training application. All infrastructure, users, computer names, commands, event streams and effects are synthetic. This is a browser-only reasoning simulator: it does **not** invoke PowerShell, attack a real server, emit Windows events, connect to a directory service, or provide malware/payload execution. It is not a source of authoritative detection signatures or a substitute for validation in an authorized lab.

### Three scenario paths

| Scenario | Typed adversary sequence | Generated telemetry when audited | Required defensive controls |
| --- | --- | --- | --- |
| Kerberos service-ticket exposure | `enum spn` → `request tickets` → `login app01` | DC01 Security 4769 for TGS requests; APP01 4624/4625 for logons | Move to strong managed service credential and rotate exposed secret |
| Excessive service-account reset delegation | `enum acl` → `reset svc-backup` → `login app01` | DC01 4724 **only when the modeled reset is accepted** and audited; APP01 logon events | Restrict service account ResetPassword right and rotate affected credential |
| Unauthorized GPO modification | `enum gpo` → `edit workstation-policy` → `apply policy` | DC01 5136 for a **successful AD-side modification** with Directory Service Changes auditing **and a matching SACL**; synthetic `LAB-GPO-APPLY` host event | Restrict GPO editing and restore approved policy |

Read the event explanation shown in the UI: a Windows event is never, by itself, proof that the attacker achieved impact. LDAP enumeration and offline credential analysis may not produce a simple Windows Security event. The GPO demo is about modeled AD-side metadata changes; SYSVOL-file changes need different coverage.

Official Microsoft references used for event semantics:
- 4769 — A Kerberos service ticket was requested: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4769
- 4724 — An attempt was made to reset an account's password: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4724
- 5136 — A directory service object was modified: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-5136

### Complete a scenario

1. Choose a scenario. Read the fictional environment, graph and objective.
2. Review the audit prerequisites. GPO 5136 requires both Directory Service Changes auditing and an object SACL.
3. Click **Generate approved business activity**. It is deliberately included as a false-positive control.
4. Start the baseline. Type the three **CyberLab commands** in order in the Red Team terminal. The sequence is visible in Beginner/Intermediate; in Advanced/Exam mode, the command guide is suppressed.
5. Compare the generated Security/endpoint logs with the terminal output and pin a baseline event. The events are attached to a run, scenario and revision.
6. Test a broad event-ID detection rule, then a contextual tuned rule. A tuned rule should catch suspicious activity without alerting on approved business events.
7. Select the root cause and apply the specific narrow security controls. You may test an unsafe broad shutdown to see why it fails business continuity.
8. Start **repair retest**, repeat all three actions, then type **`test legitimate`** to verify the authorized service still works. Pin an event or terminal outcome from the retest.
9. Record a technical assessment and submit. A passing assessment requires baseline evidence, correct root cause, tuned detection, current-revision hardening, preserved audit coverage, safe replay and a report.
10. Export the evidence report as Markdown. User notes and evidence IDs remain local to the browser.

### Validation boundaries

- Event correlation and alerts are synthetic and deterministic; the labels describe the **lab's known ground truth**, which a production SOC normally would not have.
- The detection builder offers three **presets** (off, event ID only, contextually tuned), not arbitrary Sigma/KQL/Splunk search editing. The tuned preset demonstrates a concept, not a production-ready rule.
- The legitimate business test is independently modeled via a distinct approved workflow and reports failure when the unsafe service-wide control is selected. It is not a real end-to-end application availability test.
- Exam mode uses the existing 15-minute browser-local challenge gate and defers gate feedback until submission. Client-side scoring can be modified by a motivated user and is **not tamper-resistant certification**.
- The synthetic shell uses an allowlist; unknown input is rejected. Only fictitious training commands are executed by the TypeScript state machine.

### Key engineering files

- `src/purple/engine.ts` — pure scenario engine, log emission, audit dependencies, detections, controls, evidence, rubric and report.
- `src/purple/PurpleLab.tsx` — integrated Red/Blue/Defense/Report workbench.
- `src/purple/purple.css` — responsive design.
- `src/purple/engine.test.ts` — Vitest contracts for the engine.
- `tests/browser/purple.spec.ts` — Playwright acceptance scenarios, subject to real browser verification.
- `VERIFY_V19.cjs` — 172 standalone assertions, no npm dependencies besides an available `tsc` binary.

### Local run

```bash
npm install
npm run verify:purple
npm run verify:all
npm run build
npm run dev
```

Open the Vite URL at `/training/#purple`. For browser tests: `npx playwright install chromium && npm run test:browser`. The build and browser interaction still need to be validated locally if dependencies cannot be installed in the packaging environment.

### Deployment

The current Vite `base` remains `/training/`. The Purple Team route is hash-based: `/training/#purple`. The application has no backend, cloud provisioning, containers or VM requirements. The existing GitHub Pages deployment workflow remains available, but it has not been deployed automatically.
