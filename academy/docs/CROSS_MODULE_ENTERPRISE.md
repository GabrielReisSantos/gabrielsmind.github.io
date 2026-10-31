# Cross-Module Enterprise Lab — hands-on guide

## Intended learning outcome

Learn that a successful attack requires multiple independent conditions—directory authorization, network reachability, usable credentials, and application authorization—and that removing one condition does not automatically repair the others.

## The model

This is a deterministic browser simulation involving fictional `lina.helpdesk` on `WS01` (10.10.10.42), `DC01` (10.10.10.10), `NGFW` (10.10.10.1), `svc-reports`, and `APP01` (10.20.10.20). Only two cross-module shared controls are currently implemented: Helpdesk ResetPassword delegation to `svc-reports`, and WS01-to-APP01 TCP/443 security policy. The internal reporting scheduler remains independent of the WS01-specific rule.

## Exercise A — Network policy changes a different module

1. In **NGFW Simulator**, locate **Connected Enterprise**. Set `WS01 → APP01 · TCP/443` to DENY.
2. Click **Open Unified Cyber Range** and enter `network trace app01`. It must show a DENY and add a synthetic `TRAFFIC` record if traffic auditing is enabled.
3. Enter `attack reset svc-reports`, then `attack login app01`. The reset remains valid if AD delegation is present, but the application logon is **network denied**. No successful Windows Event 4624 or application authentication event should be emitted for this blocked attempt.
4. Return to **3D Network Range** and set the *shared enterprise rule* to ALLOW. This does **not** alter the standalone editable topology.
5. Go back to Unified Cyber Range and try `attack login app01`. The already acquired credential may now establish an application session; observe correlated Windows, NGFW and application records.

## Exercise B — AD delegation and the surviving session

1. In **AD Academy**, set the shared Helpdesk ResetPassword delegation to RESTRICTED.
2. Return to Unified Cyber Range and enter `attack reset svc-reports`. It must be denied. Do not expect Event 4724 for the denied attempt.
3. If the service credential was already compromised and an attacker session is active, the historical credential/session state remains. The directory ACL change does not automatically revoke it.
4. Complete the mitigation with `fix rotate-credential`, `fix revoke-sessions`, `fix sync-application`, and the three independent verification commands.
5. When controls are changed across workbenches, previous retests become stale. Retest at the new configuration revision.

## Commands and assessment

Use `help` in the Unified Range console for the exact allowlist. Run `simulate normal` before tuning a rule, then pin both the attack reset and privileged logon observations. Example detection: `event_id=4724 actor=lina.helpdesk target=svc-reports`.

The mission requires finding the excessive permission, recording baseline and attack evidence, precise detection, removing the delegation, rotating compromised credentials, revoking sessions, restoring legitimate application credentials, retaining audit coverage, and re-running verification. Merely blocking TCP/443 does **not** satisfy the complete identity-remediation checklist.

## Data, scope and limitations

- All activity and logs are synthetic and confined to the browser. No local shell or external network interaction is performed.
- Shared controls persist in `localStorage` and are included in CyberLab progress exports. No secret values or actual credentials are stored by this enterprise layer.
- The original NGFW simulator's ordered policy table, 3D topology editor and AD Academy's independent missions remain separate model instances. Changing an arbitrary legacy object does not alter UR-001; use only the explicitly labeled connected enterprise controls.
- This is not a production PAN-OS policy engine, Active Directory, real Windows logging or a complete enterprise digital twin.
