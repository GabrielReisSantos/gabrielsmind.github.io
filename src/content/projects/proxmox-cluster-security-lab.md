# Proxmox cluster overview

## Disclosure and acknowledgment
This document describes the Proxmox cluster in a form that is safe to share publicly. IP addresses, hostnames, and other sensitive implementation details have been sanitized. The project was developed in the context of volunteer work for DIVD, and its realization was made possible through that environment. I also want to acknowledge the mentoring and guidance of Jeroen Ellermeijer and Remco Bijlsma, as well as the collaboration of my teammate Humza Ahmad.

## 1. High-Level Goal
The cluster is designed to provide a flexible lab environment for:

- Virtualization with Proxmox VE
- Segmented security testing environments
- Firewall-controlled routing through OPNsense
- Remote administrative access through WireGuard VPN
- Isolation between management, lab, attacker, victim, monitoring, and malware-research zones

## 2. Cluster architecture
The environment consists of multiple Proxmox nodes joined into a single cluster.

### Example sanitized node layout

| Node | Role | Notes |
|------|------|-------|
| `pve-node-01` | Primary cluster node | Hosts critical VMs and core services |
| `pve-node-02` | Secondary node | Used for additional workloads / redundancy |
| `pve-node-03` | Secondary node | Can host isolated lab workloads |
| `pve-node-04` | Secondary node | Optional / standby / future use |
| `pve-node-05` | Research / quarantine node | Can be reserved for malware aquarium workloads |

A dedicated node for malware research is not mandatory, but it is a better design choice when the goal is to keep detonation and suspicious traffic separated from normal lab operations.

## 3. Main components

### Proxmox VE
Proxmox provides:
- VM and container management
- Cluster membership and quorum
- Shared administration through the web UI and shell
- Virtual bridges for traffic separation

### OPNsense VM
OPNsense acts as the internal firewall and traffic control point. It is used for:
- Routing between internal lab networks
- Defining access rules between zones
- Hosting WireGuard for remote admin access
- Enforcing segmentation between trusted and hostile environments

### WireGuard VPN
WireGuard is used as the secure administrative entry point into the environment.
Instead of exposing cluster management directly to the internet, access is intended to follow this path:

`Admin device -> WireGuard -> OPNsense -> Allowed management services`

This reduces exposure and makes access control cleaner.

### Malware Aquarium Zone
The aquarium in this design refers specifically to the **Malware-Aquarium** project by Rio Kierkels and Rares Bratean. In the project README, it is described as a bounded space where malware can live inside a fully reachable network with interconnected machines and extensible, controllable visibility paths.
In this cluster document, the aquarium should therefore be understood as a **dedicated malware research and containment segment**.

Its purpose is to support:
- malware detonation research
- packet capture and behavior observation
- controlled forensic collection
- testing of detection pipelines
- isolated investigation of suspicious files or payloads
- observation of propagation behavior inside a constrained environment

This zone should be treated as **more hostile than the attacker zone** because the workloads may execute unknown or intentionally dangerous code.

## 4. Sanitized network design
The exact IPs are intentionally removed. The ranges below are **examples only**.

| Zone | Example Subnet | Purpose |
|------|----------------|---------|
| Management | `10.10.10.0/24` | Proxmox node management and admin access |
| Cluster/Internal | `10.10.20.0/24` | Cluster communication / internal services |
| Lab / Server Zone | `10.10.30.0/24` | Internal lab servers and infrastructure |
| Attacker Zone | `10.10.40.0/24` | Controlled offensive testing systems |
| Victim Zone | `10.10.50.0/24` | Simulated target machines |
| SOC / Monitoring Zone | `10.10.60.0/24` | Logging, monitoring, SIEM, case tools |
| VPN Clients | `10.10.70.0/24` | WireGuard peer address pool |
| Aquarium / Quarantine Zone | `10.10.80.0/24` | Malware research, packet capture, detonation |
| Controlled Internet Simulation | `10.10.90.0/24` | Optional fake services, sinkhole, INetSim-like support |

## 4A. Malware-Aquarium project reference
This lab section is inspired by the public **rio/malware-aquarium** repository.

### What that project is
According to the repository README, the project is a proof of concept that combines malware-analysis requirements, secure architecture, and analysis of Trojan and worm TTPs. The authors state that it was tested with **TrickBot** and **HermeticWizard**, and that those deployments revealed more detailed behavior than two free online sandboxes used for comparison.

### For this cluster
In this Proxmox design, the aquarium should be documented as:
- a hostile research segment
- a place to observe malware behavior across multiple reachable machines
- a zone with intentionally designed visibility paths
- an environment that depends on external containment controls such as OPNsense policy, snapshot discipline, logging, and sanitized documentation

### Doesn't mean
It does **not** mean the whole GitHub project is already deployed exactly as-is in this cluster.
It means the architecture reserves a dedicated zone that can host or adapt that concept safely.

### Attribution note
If this design is shared outside private notes, the reference should credit the project creators and link to the repository rather than pretending the concept was invented locally.

## 5. Access model

### Intended management flow
1. An administrator connects through WireGuard.
2. The WireGuard tunnel terminates on OPNsense.
3. OPNsense allows only specific traffic from trusted VPN peers.
4. Access to the Proxmox web UI and SSH is restricted to approved sources.
5. Lab networks do **not** get unrestricted access to the management plane.
6. The aquarium zone is reachable only through explicitly approved paths for analysis or maintenance.

### Security objective

A big part of the security objective here was avoiding the kind of setup that makes lab infrastructure risky for no good reason.
I did not want this:

`Internet -> Proxmox GUI`

What I wanted instead was:

`Internet -> VPN -> Firewall policy -> Proxmox GUI`

For me, that is the right direction. Exposing the Proxmox GUI directly to the internet would add risk without adding real value.
The same thinking applies to the aquarium zone. I did not want this:

`Malware VM -> Open internet / internal management / unrestricted east-west traffic`

What I wanted instead was:

`Malware VM -> Strict firewall policy -> controlled simulation / monitored egress / blocked by default`

That is the whole point of the aquarium model. If suspicious or dangerous workloads are allowed to move too freely, then the isolation stops meaning anything.

## 6. Example logical zones

### Management zone
Used for:
- Proxmox node interfaces
- Administrative SSH
- Cluster web UI
- Limited internal management services

This zone should be reachable only from:
- Trusted admin workstation(s)
- VPN-assigned admin peers
- Explicitly approved internal systems

### Attacker zone
Used for:
- Red-team style test machines
- Controlled attack simulations
- Tools that may generate noisy or suspicious traffic

This zone should be tightly filtered and never treated as trusted.

### Victim zone
Used for:
- Simulated endpoints and servers
- Web apps, Windows clients, Linux services, OT/ICS test devices
- Demonstration targets for lateral movement and detection exercises

This zone should be isolated from management and only allow the minimum required flows.

### SOC / Monitoring zone
Used for:
- Logging platforms
- Detection tools
- Case management
- Traffic analysis and alerting

This zone often needs visibility into other zones, but visibility does **not** mean unlimited access.

### Aquarium / Quarantine zone
Used for:
- Malware aquarium workloads
- Sandboxed execution and detonation
- PCAP collection
- Artifact capture
- Snapshot-and-revert style analysis
- Testing detections against realistic malicious behavior

This zone should have stricter controls than the attacker zone:
- no direct route to management
- no unrestricted route to the home LAN
- no default route to the public internet unless explicitly required
- logging enabled at the firewall and host levels
- revertable VMs and disposable workloads preferred

### Controlled internet simulation zone
Used for:
- fake DNS, HTTP, SMTP, or update services
- INetSim-style response behavior
- sinkhole testing
- observing callback attempts without giving real external access
This zone is useful when the objective is to observe behavior without allowing uncontrolled outbound traffic.

## 8. Proxmox cluster notes

### Quorum
A Proxmox cluster depends on quorum for normal operations.
If several nodes are offline, cluster actions may fail until quorum is restored or handled manually.
That means the cluster is not just “a group of hosts”; it has coordination logic. If too many members disappear, the surviving node may refuse certain actions to avoid split-brain conditions.

### Storage and VM placement
VMs can be distributed across nodes depending on:
- available storage
- performance needs
- redundancy goals
- isolation requirements

For lab environments, it is common to keep critical infrastructure on the strongest node while using other nodes for test workloads.
For the aquarium, dedicated storage and node placement are useful because they reduce accidental overlap with normal lab workloads and make cleanup easier.

### HA vs non-HA reality
HA requires deliberate design:
- compatible storage strategy
- quorum stability
- failover planning
- node capacity to absorb workloads

## 9. Firewall and Zero Trust approach

One of the main things I wanted to avoid in this cluster was the usual “lab mess” where every network ends up trusting every other network. For me, that defeats the whole point. I wanted the firewall policy to reflect a zero trust approach: assume nothing should talk unless there is a specific reason for it.

### What I tried to follow
- block traffic between zones by default
- only open the flows that are actually needed
- keep management access limited to specific admin sources
- make every rule readable and tied to a real purpose
- use aliases and groups so the policy stays maintainable
- keep aquarium egress blocked unless there is a strong research reason to allow it

### What I wanted to avoid
- wide any-to-any rules
- “temporary” exceptions that never get removed
- mixing trusted management traffic with attacker traffic
- allowing malware-analysis systems to touch normal infrastructure
- rules that exist without a written reason

## 10. Aquarium design notes

For me, the aquarium should behave like a quarantine island inside the cluster. It is still part of the same Proxmox environment, but it should not inherit the same trust level as the rest of the lab. If that boundary is weak, the whole idea stops being useful.

### Safe pattern

`Aquarium VM -> Aquarium VLAN/Subnet -> OPNsense rules -> optional fake internet / capture / sinkhole`

### What makes the aquarium useful
- repeatable detonation
- easy snapshot rollback
- packet capture visibility
- controlled DNS and HTTP observation
- comparison between host telemetry and network telemetry
- observation of propagation and post-compromise behavior across intentionally reachable systems

### What makes the aquarium dangerous
- reusing bridges connected to trusted systems
- letting malware VMs touch the management plane
- any direct path to real production or home devices
- missing firewall logging
- no clear cleanup process after testing

## 11. Sanitizing for documentation
When sharing notes, screenshots, diagrams, or markdown publicly, sanitize at least:
- real IP addresses
- public IPs
- VPN endpoint details
- domain names
- device serials
- MAC addresses
- usernames
- internal project names if sensitive

### Example
Instead of:
- `192.168.12.14`
- `cluster.internal.company.local`
- `gabriel-laptop`

Use:
- `10.10.10.14`
- `cluster-mgmt.example.local`
- `admin-workstation`

## 12. Example summary diagram

```text
[Admin Laptop]
      |
      | WireGuard VPN
      v
[OPNsense Firewall]
      |
      +--> [Management Zone: Proxmox Nodes]
      |
      +--> [SOC / Monitoring Zone]
      |
      +--> [Lab / Server Zone]
      |
      +--> [Victim Zone]
      |
      +--> [Attacker Zone]
      |
      +--> [Aquarium / Quarantine Zone]
                    |
                    +--> [Controlled Internet Simulation]
```
## 13. Operational principles

### Principle 1: Management should stay protected
One thing I wanted to avoid from the start was treating the management side of the cluster like just another lab network. Proxmox management should not be casually reachable from other zones.

### Principle 2: VPN first
For remote administration, I wanted WireGuard to be the front door. Direct public exposure of management services would go against the whole design.

### Principle 3: Default deny is the safer starting point
My approach here is simple: if a flow is not clearly needed, it should stay blocked. It is easier to open something deliberately than to clean up overly broad access later.

### Principle 4: Trust levels need to stay separate
The attacker zone, victim zone, SOC zone, aquarium, and management all serve different purposes. For me, putting them in the same unrestricted space would defeat the point of the lab.

### Principle 5: Dangerous workloads need containment
If I am testing malware or suspicious payloads, that belongs in a quarantine model, not in a convenience model. The aquarium only makes sense if it is treated differently from the rest of the lab.

### Principle 6: Documentation matters
If the cluster depends on rules or design choices that only exist in my head, then it is fragile. I wanted the structure to be documented well enough that it can be understood, reviewed, and improved.

## 14. Public description

If I need to describe the project briefly in a public-safe way, this is the version I would use:

> Proxmox cluster with segmented lab networks, OPNsense firewalling, WireGuard-protected administrative access, and an isolated malware-research aquarium zone inspired by the public Malware-Aquarium concept. The environment is designed for security testing, detection engineering, and controlled detonation experiments while keeping management access separated from hostile or high-risk workloads.

## 16. Public reference
Project reference: `https://github.com/rio/malware-aquarium`