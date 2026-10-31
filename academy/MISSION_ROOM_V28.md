# CyberLab v2.8 — Mission Room

**New flagship experience** · React 18 + TypeScript + Vite · No backend or external network execution

Open **Mission Room** in the sidebar or go to `/training/#missionroom`. The latest v2.7 source tree is the base, not the older v0.8 or v2.6 archive. All existing learning modules, progress keys, and routes are retained.

## What is real in this browser simulation

The room reuses the **same `src/unified/engine.ts` state** as the established Unified Cyber Range, and the **same authoritative `src/enterprise/nativeEngine.ts` forwarding result** as the 3D/NGFW enterprise bridge. The mission's terminal, Windows-like events, application outcomes, firewall state, detection matches, evidence pins, and retest scores are derived from these engines. No stage is marked complete merely because its button was clicked.

The room provides:

- High-fidelity, responsive dark interface with distinct typography, visual hierarchy, live health metrics, professional incident panels and interactive network diagram.
- Six-phase workflow: Inspect → Reproduce → Investigate → Detect → Remediate → Verify.
- Command allowlist; causal synthetic Windows/security/application telemetry; event selection and pinning.
- A detection predicate evaluated against simulated attack and legitimate baseline records, with true- and false-positive feedback.
- Shared AD ACL changes, NGFW access-policy experiments, credential rotation, legitimate app sync, session revocation and audit-coverage degradation. An overbroad network block will **not** complete this mission.
- Case notes, root-cause selection, independent current-revision replay and Markdown report export.
- Browser-local recovery using **existing** `cyberlab-v21-range-draft` replay format; completed mission uses existing `cyberlab-v21-range-completed`. Learning progress export already includes these `cyberlab-` keys.

## Scenario UR-001 — excessive service-account reset rights

`lina.helpdesk` holds an excessive ResetPassword delegation on `svc-reports`. An attacker abuses that permission to establish privileged access to APP01. The learner must reproduce causal telemetry, contrast it with legitimate activity, collect decisive evidence, write a precise rule, remove unnecessary delegation, rotate credentials, update the scheduler, revoke sessions, preserve guest isolation and approved HTTPS, and verify all three outcomes against the current configuration.

**Not yet implemented:** the suggested future GitHub leaked-credential mission. Secrets Storage Atlas remains an independent educational module. This release is a new experience built on existing real cross-module simulation rather than falsely claiming all standalone modules share one enterprise state.

## Run

```bash
unzip cyberlab-interactive-v2.8-mission-room.zip -d ~/Desktop/cyberlab-interactive-v2.8
cd ~/Desktop/cyberlab-interactive-v2.8
npm install
npm run verify:mission
npm run verify:all
npm run build
npm run dev
```

Navigate to the Vite URL under `/training/#missionroom`. For browser acceptance, run `npx playwright install chromium && npm run test:browser` after a successful build.

**Important:** A fresh network-connected npm install is needed; this source package does not contain a generated lockfile or `node_modules`. Commit `package-lock.json` after a successful install to make deployment reproducible.

## Safe restore and scope

Mission Room automatically saves allowlisted command strings and learner notes in browser localStorage. It does **not** persist arbitrary secret materials. The **Reset** action requests explicit confirmation because it resets the same enterprise ACL/network configuration the AD Academy, 3D Enterprise Range and NGFW simulator use; no other course results are reset. Unexported browser storage is not durable cross-device storage. The saved successful-completion marker is historical practice, not tamper-resistant proof.

## Verification status

The new mission's pure TypeScript engine compiles with global TypeScript and its deterministic verification covers a complete scenario, replayed persistence, unauthorized-path closure, overly broad network blocks, stale dependent credentials, disabled auditing and guest-isolation loss. Existing unified/enterprise/native regressions were also run. **A complete Vite production build, Vitest and real Playwright rendering were not runnable in this workspace because npm package installation could not reach the registry.** Run the installation/build/browser checks before publication; source-level parsing and deterministic tests do not prove a perfect browser layout.
