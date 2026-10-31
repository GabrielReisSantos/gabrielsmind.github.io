# CyberLab Interactive v2.1.0 — Unified Cyber Range

## Delivered

- **UR-001 — Compromised service identity**: unified fictional enterprise state linking AD reset permission, stolen service credential, active app session, APP01 scheduler secret, endpoint/identity/NGFW telemetry, and independent repair verification.
- Integrated, responsive Mission Control with topology, terminal, event stream, evidence viewer, detection rule authoring, remediation, and replay checklist.
- Causal `commandId` and `eventId` relationships: each generated record points to the modeled action that caused it.
- Three families of synthetic observations; baseline legitimate admin and scheduler activity; an audit-gap experiment.
- Strict, safe detection DSL and false-positive check against authorized activity.
- Revision-scoped replay: removing an ACL alone is insufficient; rotation and session revocation protect the attacker path; app secret synchronization preserves availability.
- Event-sourced local draft restore using allowlisted commands, no real secrets. Markdown report export.
- New `#unified` deep link; feature tile in Home; entry in Investigate; completion count in My Progress; progress backup includes v2.1 keys.
- Vitest engine tests, browser acceptance spec, `verify:unified`, and GitHub workflow gate.

## Preserved

All existing v2.0.1 source files and functional routes are retained. The prior 3D Range, standalone Purple Team Lab, AD Academy, certification paths and other labs are unchanged in their business logic.

## Deliberate limitations

1. **No real networks, malware, Windows Event Log, Active Directory, EDR or NGFW.** All commands, events and attack outcomes are simulated in deterministic TypeScript.
2. **Shared mission state inside UR-001 only.** Existing labs are not yet synchronized to this new enterprise model.
3. **No independent hosted assessment.** Browser storage is under learner control and does not prove exam-grade competence.
4. **No dependency-backed build confirmation in this workspace.** npm registry DNS returned `EAI_AGAIN` while generating the lockfile. `npm install`, full `npm test`, `npm run build`, `npm run test:browser` remain mandatory locally before deployment.
5. App progress persists locally; draft replay is limited to 500 allowlisted commands. The feature does not persist a real device or virtual machine.

## Install / verify

```bash
npm install
npm run verify:unified
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run release:check
npm run dev
```

**Release gate:** Only call the release deployable after lockfile generation/commit, real Vite build, unit test suite, browser acceptance tests, and release doctor all pass.
