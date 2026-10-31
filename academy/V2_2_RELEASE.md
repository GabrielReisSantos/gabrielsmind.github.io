# CyberLab v2.2 — Cross-Module Enterprise

## Delivered

A new `src/enterprise/` state layer adds a deterministic, versioned and locally persisted **fictional shared enterprise scenario**. The following workbenches show the same control values and link back to the UR-001 investigation:

- **AD Academy:** toggle Helpdesk's inappropriate `ResetPassword` delegation on the `svc-reports` service identity.
- **NGFW Simulator:** allow or deny the `WS01 → NGFW → APP01 TCP/443` enterprise training flow.
- **3D Network Range:** view and change the same explicit enterprise path control.
- **Unified Cyber Range:** consume both controls, show a joined identity/network graph and command-linked telemetry; remediate the delegation and publish the change back to other modules.

Each change has an origin and a shared revision. Updates persist under `cyberlab-enterprise-v22`, and are propagated to other mounted views and tabs using normal browser storage notifications. They are included in existing browser progress backups by the `cyberlab-` key prefix. Existing `cyberlab-v21-range-draft` command transcripts are not deleted.

## Exercise behavior

- Disabling the shared WS01 HTTPS path prevents new application logons, generates a simulated NGFW deny (when traffic auditing is enabled), and changes `network trace app01` to a deny result.
- Re-enabling the path restores reachability but **does not** create or repair credentials.
- Revoking the ResetPassword permission blocks future attempts but **does not** remove a stolen credential or existing application session.
- A change to any linked control invalidates previously recorded attack, service and monitoring retests. The independent mission grader still requires the full identity, credential, session, monitoring and service-recovery workflow.
- Standalone NGFW/3D/AD sandbox state remains intentionally independent. Only the visibly marked shared controls participate. This is not a fully shared physical forwarding or PAN-OS policy engine.

## Verification

- `npm run verify:enterprise` compiles the pure engines with strict TypeScript and runs cross-module assertions including both allow and deny paths, persistence shape validation and retest invalidation.
- `src/enterprise/engine.test.ts` exercises the same model under Vitest.
- `tests/browser/enterprise.spec.ts` covers navigation from NGFW/AD/3D workbenches, telemetry and stored route changes.
- Existing source-level verifiers have been updated for v2.2 metadata without weakening their behavioral assertions.
- The CI workflow includes `verify:enterprise`.

**Not established here:** real npm/Vite production build, full Vitest, Playwright, on-device mobile or cross-tab testing. No `package-lock.json` is fabricated. Run these on a networked development machine and review browser test results before publishing.
