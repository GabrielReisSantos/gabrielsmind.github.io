# CyberLab v2.3 — Native NGFW / 3D Enterprise

## New

- Dedicated editable 3D / 2D enterprise topology with physical cabling, interface shutdown, next-hop routing and ordered topology policy that feed UR-001.
- Native enterprise NGFW policy interface with ordered first-match security rules, enable/disable, action, and DMZ route, evaluated by the existing NGFW packet engine.
- Shared, persisted enterprise configuration and same-tab/cross-tab subscriptions; original standalone exercises remain isolated.
- Unified Cyber Range now reflects native forwarding cause, rule and configuration revision, and invalidates stale retests even if the allow/deny answer does not change.
- Guest segmentation included in the UR-001 safety grading.
- Native packet trace and troubleshooting guide; additional offline, unit, and browser tests.

## Accuracy

No actual PAN-OS, virtual machine, TLS socket or physical network is involved. Two simplified classroom forwarding engines are composed sequentially. Only the dedicated enterprise scene is linked; this is not full unification of every old rule or 3D cable.

## Remaining release gates

Run `npm test`, `npm run build`, and `npm run test:browser` with the real installed dependencies and committed lockfile before production deployment. See `MIGRATION_V23.md`.
