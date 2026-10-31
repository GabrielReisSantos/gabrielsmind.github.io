# CyberLab v2.3 — Native NGFW / 3D enterprise integration

## Learning objective

Use one fictional UR-001 network (`WS01 10.10.10.42 → NGFW → APP01 10.20.10.20 TCP/443`) to discover how real *configuration state within the simulators* determines reachability. These are not physical devices, real network packets or actual PAN-OS operations.

The enterprise scene has five simulated nodes: `WS01`, `NGFW`, `APP01`, `DC01` and a denied `GUEST` endpoint. The old VLAN Campus / Segmented Enterprise / Public DMZ / OSCP Pivot scenes remain independent.

## Authoritative decision pipeline

1. `src/threeD/topologyEngine.ts` evaluates actual scene cables and interface administration, transit IP/subnet pairing, static next-hop routes, and the ordered topology policy. It returns a fully causal hop trace and a drop reason.
2. **Only after physical forwarding succeeds**, `src/ngfw/engine.ts` evaluates the enterprise `Traffic` five-tuple against NGFW route, zones, ordered security rules, App-ID/service, and the synthetic session decision.
3. `src/enterprise/nativeEngine.ts` composes both independent engines into a single `ForwardResult`, preserving the failure stage, causal explanation, physical path and matched security rule.
4. `src/enterprise/nativeStore.ts` persists *the actual enterprise topology and NGFW configuration* at `cyberlab-native-enterprise-v23`; subscribers update in the same tab and via `storage` events across tabs.
5. `src/unified/UnifiedRange.tsx` projects the native verdict into UR-001 and invalidates stale verification whenever the native configuration revision changes, including when traffic is still allowed but the rulebase changed.

## Guided mission

Start at `/training/#world`. In **3D Enterprise Topology**, run the native probe (3D or 2D), disable cable `c1` on the WS01 ingress, then rerun. The packet must fail before it reaches the NGFW, and the Unified Range must not claim that it produced an NGFW security-policy deny log. Re-enable the cable. Then shut down an interface and observe the causal failure. Test an incorrect APP01 route via DC01; fix the next hop.

Go to `/training/#ngfw`. In **Enterprise NGFW Rulebase**, disable or deny the specific enterprise HTTPS allow, then inspect the matched deny rule. Place the broad deny before the allow to demonstrate first-match shadowing. Restore the narrow permit and verify that WS01 passes.

Go to `/training/#unified`. Run `network trace app01`, `attack reset svc-reports`, and `attack login app01`. Fix the excessive AD ResetPassword permission, rotate the account credential, revoke attacker sessions, and update the legitimate reporting application. Prove that the attack is blocked **and** reporting still works. Observe that disabling guest isolation causes an additional safety requirement to fail.

## Important distinctions

- No user commands or source files ever reach an external firewall. No real PAN-OS dataplane, TLS stack, ARP, OSPF, or EDR is running.
- No generic NAT mapping is required for this specific internal `WS01 → APP01` flow. DNAT and SNAT training remain in the standalone NGFW workbench.
- The native `enterprise-native` topology is a dedicated scene. Its edits **do not** change the four standalone 3D challenge topologies, nor the five preconfigured NGFW troubleshooting cases.
- Enterprise permission delegation is still stored separately under `cyberlab-enterprise-v22`. The `wsToApp443` field from v2.2 is migrated once to the native enterprise allow rule when no native snapshot is present; the native forwarding outcome then becomes authoritative for network reachability.
- In a deny-before-firewall condition, the mission does not fabricate a firewall policy log. Its console states the actual physical/route reason.
- Saved enterprise configuration is a local training snapshot, not a tamper-resistant security audit record.

## Verification

`npm run verify:native` runs the pure engine's regression suite. `npm test` includes `src/enterprise/nativeEngine.test.ts`. `npm run test:browser` includes `tests/browser/native-enterprise.spec.ts`. The production build and browser assertions must be run on an environment with installed npm dependencies.
