# CyberLab v1.8 — Active Directory Academy

## Learning objectives

1. Explain a forest, domain, domain controller (DC), OU, users, computers, groups, SPNs, ACLs and GPOs.
2. Understand why domain-joined clients need DNS SRV records to locate directory and KDC services.
3. Distinguish LDAP directory operations from authentication (Kerberos / NTLM) and authorization (resource ACLs).
4. Walk through the Kerberos AS, TGS and AP stages without confusing a TGT with a service ticket.
5. Identify seven commonly discussed identity exposure patterns and explain the prerequisites for each.
6. Investigate a fictional AD privilege relationship using typed, non-executing commands, two independent evidence categories, and a least-privilege remediation.

## AD service flows, simplified

```text
USER WORKSTATION
  |
  | DNS SRV _ldap._tcp.dc._msdcs.corp.cyberlab.test
  v
CORP DNS --------------> dc01.corp.cyberlab.test
                                |
                                | LDAP queries: identity / policy objects
                                | KDC: Kerberos AS / TGS exchanges
                                v
                             AD DS
                                |
                  service ticket for HTTP/app01...
                                |
CLIENT ------------------------> APP01
                                |
                         Resource checks ACL
                         and application policy
```

Kerberos:

1. **AS exchange:** Client authenticates to the KDC, receives a ticket-granting ticket (TGT).
2. **TGS exchange:** Client asks the KDC for a ticket to a named service principal (SPN), presenting the TGT.
3. **AP exchange:** Client presents its **service ticket**, not the TGT, to the service.
4. **Authorization:** The resource checks effective permissions. A valid ticket does not make the user an administrator.

NTLM uses challenge-response rather than service tickets. LDAP is for querying/updating directory objects, subject to permissions. Group Policy is applied according to links, scope, filtering, and policy processing conditions. **These are separate responsibilities**, although they interoperate.

## How an attack path can form

Fictional directory example:

```text
analyst --MemberOf--> Helpdesk
Helpdesk --GenericAll (excessive)--> svc-inventory
svc-inventory --MemberOf--> App-Admins
App-Admins --AdminTo--> APP01
```

This graph indicates a potential route for privilege abuse **if effective rights, account access and other preconditions are met**. It is not proof that a password was obtained or APP01 was compromised. The learner inspects the excessive directory ACE, assesses its impact and removes only that delegation. The approved SecOps Admin → APP01 path must remain intact.

The academy also covers service ticket / weak service credential exposure, GPO edit rights, accounts without Kerberos pre-authentication, NTLM relay conditions, unconstrained delegation and replication rights. They are presented as threat models with prerequisites, telemetry and remediation, not as real exploitation steps.

## Type, diagnose and verify

The AD investigation terminal is a **bounded training interpreter**. Examples of strings a learner types:

```powershell
whoami /groups
nltest /dsgetdc:corp.cyberlab.test
nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.cyberlab.test
Get-ADDomain
Get-ADUser -Identity analyst -Properties MemberOf
Get-ADGroupMember -Identity Helpdesk
Get-Acl "AD:\CN=svc-inventory,OU=Services,DC=corp,DC=cyberlab,DC=test"
Get-GPPermission -Name Admin-Workstations -All
setspn -L svc-report
klist
```

These strings are never executed. Output and identity names are fabricated for `corp.cyberlab.test`. Some commands are intentionally tied to fixture objects and should not be interpreted as universal PowerShell usage; `help` lists supported exact commands. The academy does not interact with a real Windows domain, produce Kerberos tickets or recover passwords.

To complete a synthetic investigation:

- Record the baseline **before** changing the graph.
- Type commands and pin evidence from at least two relevant categories, including the case-specific critical observation.
- Identify the actual root cause and explain what is conditional rather than proved.
- Remove only the excessive permission.
- Retest the **current** configuration revision; ensure intended administrative access still exists.
- Write a technical finding explaining the evidence and the limited conclusion; optionally export the Markdown report.

## Recommended references

- Microsoft: [Active Directory Domain Services overview](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services)
- Microsoft: [Kerberos authentication overview](https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview)
- SpecterOps: [BloodHound documentation](https://bloodhound.specterops.io/)
- SpecterOps: [Attack graph modeling and relationship direction](https://specterops.io/blog/2025/08/01/attack-graph-model-design-requirements-and-examples/)

This is an independent educational implementation, not Microsoft Active Directory, BloodHound, or an OffSec product.
