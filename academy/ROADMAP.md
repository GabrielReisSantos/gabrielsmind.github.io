## Completed in v2.3
Native enterprise 3D topology, true packet path composed with NGFW rule evaluation, cross-module UR-001 verification, and guest isolation assessment. Standalone training scenarios remain isolated.

## Next
Generalize a declarative enterprise graph adapter so more scenes and native policy groups can join with explicit environment IDs rather than implicit links. Also require real browser/performance/accessibility validation prior to deployment.

# Post-v2.2 opportunities

1. **Real engine adapters:** map selected native NGFW rules and 3D topology objects to a canonical shared path, with reversible migrations and event semantics; do not silently treat unrelated lab scenarios as the enterprise mission.
2. **Shared evidence schema:** a unified event stream with provenance, audit controls and replay versioning across independent scenarios.
3. **Additional connected missions:** lateral movement, identity privilege abuse, policy mistakes and service-availability regressions, each verified for positive and negative paths.
4. **Browser release gate:** run full `npm test`, `npm run build`, Playwright desktop/mobile acceptance, then commit a generated `package-lock.json` on a networked machine and use `npm ci` in CI.

---

## Beyond v2.1

- **P0:** Complete full dependency-backed QA and mobile/desktop browser tests, generate and commit a genuine package-lock.json.
- **P1:** Bridge the UR-001 state and event schema into the existing 3D Range, AD Academy, NGFW simulation and certification lab links. Those connections are **not yet implemented**.
- **P2:** Add genuinely distinct mission causes (Kerberos/NTLM, TLS trust and segmentation), authored detection rules with defensible false-positive evaluation, and more nuanced failure telemetry.

## CyberLab 2.0 status

The unified shell, catalog navigation, resumption dashboard, progress page, certification mode selection, and Purple workflow rail are implemented. **Next release gates:** npm-backed build, full Vitest+Playwright runs on Ubuntu, manual keyboard and mobile layout review, and committed npm lockfile. An accessibility review with real browser tooling remains required before publication. Existing feature roadmap follows.

# v1.8 quality gates

- Verify the full React/Vite production build on Ubuntu with real npm dependencies.
- Run Playwright `adacademy.spec.ts` at `/training/#adlab`, check desktop and mobile layouts.
- Test all original routes and saved local progress.
- Review AD protocol lessons with a Windows/AD specialist; classroom simulations are not a domain controller.
- Add more synthetic telemetry and protocol validation only if the observations remain internally consistent.
- Keep the public deployment static and independent of live AD/LDAP.

# Next quality gates after v1.7

- **Must pass before publishing:** full npm dependency install, TypeScript production build, Playwright acceptance suite, browser visual review and final `/training/` deployment.
- **Expand objective fidelity:** compare generated certificates against a reference OpenSSL CLI script; additional negative tests for pathLen, EKU, key mismatches, and name constraints.
- **TLS realism:** event-by-event TLS 1.3 inspection, client authentication, mTLS authorization, hostname/CA path troubleshooting; keep it deterministic unless an independently reviewed standards-compliant runtime is used.
- **Secrets realism:** expand synthetic API to 401 vs 403, rotation overlap window, audit failures, and compromised credentials; never store real secrets in localStorage.
- **Learning quality:** improve code review with independent checks and teach genuine NGINX/requests execution through real external labs only if the browser-only requirement changes.
