# Proxmox Cluster Overview

## Purpose
This document explains the structure of the Proxmox cluster in a way that is safe to share publicly or keep in general notes. All IP addresses, hostnames, and sensitive details have been sanitized.

---

## 1. High-Level Goal
The cluster is designed to provide a flexible lab environment for:

- Virtualization with Proxmox VE
- Segmented security testing environments
- Firewall-controlled routing through OPNsense
- Remote administrative access through WireGuard VPN
- Isolation between management, lab, attacker, victim, monitoring, and malware-research zones

The main design principle is **controlled access with network segmentation**, not flat-network convenience.

---

## 2. Cluster Architecture
The environment consists of multiple Proxmox nodes joined into a single cluster.

### Example sanitized node layout

| Node | Role | Notes |
|------|------|-------|
| `pve-node-01` | Primary cluster node | Hosts critical VMs and core services |
| `pve-node-02` | Secondary node | Used for additional workloads / redundancy |
| `pve-node-03` | Secondary node | Can host isolated lab workloads |
| `pve-node-04` | Secondary node | Optional / standby / future use |
| `pve-node-05` | Research / quarantine node | Can be reserved for malware aquarium workloads |

In practice, one node may be used more heavily than the others depending on available CPU, RAM, storage, and which VMs are currently needed.

A dedicated node for malware research is not mandatory, but it is a strong design choice when the goal is to keep detonation and suspicious traffic separated from normal lab operations.

---

## 3. Main Components

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

In this cluster document, the aquarium should therefore be understood as a **dedicated malware research and containment segment**, not just a generic sandbox VM.

Its purpose is to support:
- malware detonation research
- packet capture and behavior observation
- controlled forensic collection
- testing of detection pipelines
- isolated investigation of suspicious files or payloads
- observation of propagation behavior inside a constrained environment

This zone should be treated as **more hostile than the attacker zone** because the workloads may execute unknown or intentionally dangerous code.

That means the aquarium is not just another subnet. It is a containment area informed by the Malware-Aquarium concept.

---

## 4. Sanitized Network Design
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

These subnets are placeholders. In a real deployment, the addressing should follow a documented scheme and avoid overlap with home, office, or VPN networks.

---

## 4A. Malware-Aquarium Project Reference
This lab section is inspired by the public **rio/malware-aquarium** repository.

### What that project is
According to the repository README, the project is a proof of concept that combines malware-analysis requirements, secure architecture, and analysis of Trojan and worm TTPs. The authors state that it was tested with **TrickBot** and **HermeticWizard**, and that those deployments revealed more detailed behavior than two free online sandboxes used for comparison.

### What that means for this cluster
In this Proxmox design, the aquarium should be documented as:
- a hostile research segment
- a place to observe malware behavior across multiple reachable machines
- a zone with intentionally designed visibility paths
- an environment that depends on external containment controls such as OPNsense policy, snapshot discipline, logging, and sanitized documentation

### What it does not mean
It does **not** mean the whole GitHub project is already deployed exactly as-is in this cluster.
It means the architecture reserves a dedicated zone that can host or adapt that concept safely.

### Attribution note
If this design is shared outside private notes, the reference should credit the project creators and link to the repository rather than pretending the concept was invented locally.

---

## 5. Access Model

### Intended management flow
1. An administrator connects through WireGuard.
2. The WireGuard tunnel terminates on OPNsense.
3. OPNsense allows only specific traffic from trusted VPN peers.
4. Access to the Proxmox web UI and SSH is restricted to approved sources.
5. Lab networks do **not** get unrestricted access to the management plane.
6. The aquarium zone is reachable only through explicitly approved paths for analysis or maintenance.

### Security objective
The goal is to avoid this bad design:

`Internet -> Proxmox GUI`

And replace it with this safer design:

`Internet -> VPN -> Firewall policy -> Proxmox GUI`

That is the correct direction. Direct public exposure of the Proxmox GUI is unnecessary risk.

For the aquarium zone, the goal is also to avoid this bad design:

`Malware VM -> Open internet / internal management / unrestricted east-west traffic`

And replace it with this safer design:

`Malware VM -> Strict firewall policy -> controlled simulation / monitored egress / blocked by default`

---

## 6. Example Logical Zones

### Management Zone
Used for:
- Proxmox node interfaces
- Administrative SSH
- Cluster web UI
- Limited internal management services

This zone should be reachable only from:
- Trusted admin workstation(s)
- VPN-assigned admin peers
- Explicitly approved internal systems

### Attacker Zone
Used for:
- Red-team style test machines
- Controlled attack simulations
- Tools that may generate noisy or suspicious traffic

This zone should be tightly filtered and never treated as trusted.

### Victim Zone
Used for:
- Simulated endpoints and servers
- Web apps, Windows clients, Linux services, OT/ICS test devices
- Demonstration targets for lateral movement and detection exercises

This zone should be isolated from management and only allow the minimum required flows.

### SOC / Monitoring Zone
Used for:
- Logging platforms
- Detection tools
- Case management
- Traffic analysis and alerting

This zone often needs visibility into other zones, but visibility does **not** mean unlimited access.

### Aquarium / Quarantine Zone
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

If internet-like behavior is needed, it is better to emulate or constrain it than to let malware talk freely.

### Controlled Internet Simulation Zone
Used for:
- fake DNS, HTTP, SMTP, or update services
- INetSim-style response behavior
- sinkhole testing
- observing callback attempts without giving real external access

This zone is useful when the objective is to observe behavior without allowing uncontrolled outbound traffic.

---

## 7. Why Segmentation Matters
A flat lab network becomes a mess fast.

Without segmentation:
- attacker machines can reach management too easily
- test malware can leak into areas it should not reach
- monitoring becomes harder to interpret
- firewall rules become vague and fragile
- mistakes are harder to contain

With segmentation:
- each zone has a clear function
- traffic paths are intentional
- rules can be audited
- risk is easier to control
- demonstrations of IT-to-OT or red-vs-blue scenarios become more realistic
- malware research can happen without turning the whole cluster into a containment failure

---

## 8. Proxmox Cluster Notes

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
Just because something is inside a cluster does **not** mean it is automatically highly available.
HA requires deliberate design:
- compatible storage strategy
- quorum stability
- failover planning
- node capacity to absorb workloads

If those pieces are missing, calling it “high availability” is mostly fantasy.

The same applies to malware research. Putting a detonation VM into a cluster does not make the design safe. Safety comes from containment, access control, logging, and revertability.

---

## 9. Firewall Philosophy
The firewall policy should stay simple and intentional.

### Good pattern
- default deny between zones
- allow only required flows
- restrict management access to admin sources
- document every rule by purpose
- use aliases/groups for maintainability
- treat aquarium egress as denied unless there is a specific research need

### Bad pattern
- broad any-to-any rules
- temporary rules left permanently enabled
- mixing trusted admin traffic with lab attack traffic
- letting malware-analysis systems reach normal infrastructure
- no written explanation of why a rule exists

The cluster becomes hard to secure the moment rules are added without discipline.

---

## 10. Aquarium Design Notes
The malware aquarium should be described as a **quarantine island** inside the cluster, specifically aligned with the Malware-Aquarium concept rather than a vague sandbox label.

That means:
- it is still hosted by the same Proxmox environment
- but it does not share the same trust level as normal lab systems
- and its routing should be intentionally constrained

### Safe architectural pattern
A reasonable pattern is:

`Aquarium VM -> Aquarium VLAN/Subnet -> OPNsense rules -> optional fake internet / capture / sinkhole`

Not this:

`Aquarium VM -> unrestricted LAN / unrestricted WAN`

### What makes the aquarium useful
- repeatable detonation
- easy snapshot rollback
- packet capture visibility
- controlled DNS and HTTP observations
- comparison between host telemetry and network telemetry
- observation of propagation and post-compromise behavior across reachable systems

### What makes the aquarium unsafe
- bridge reuse with trusted systems
- management-plane reachability from malware VMs
- direct access to real production or home devices
- no firewall logging
- unclear cleanup process after testing

If the containment model is sloppy, the “aquarium” is just malware running in your lab. That is not a research environment. That is negligence.

---

## 11. Sanitizing for Documentation
When sharing notes, screenshots, diagrams, or markdown publicly, sanitize at least:

- real IP addresses
- public IPs
- VPN endpoint details
- domain names
- device serials
- MAC addresses
- usernames
- internal project names if sensitive

### Good sanitization example
Instead of:
- `192.168.12.14`
- `cluster.internal.company.local`
- `gabriel-laptop`

Use:
- `10.10.10.14`
- `cluster-mgmt.example.local`
- `admin-workstation`

The point is not cosmetic. The point is reducing infrastructure leakage.

---

## 12. Example Summary Diagram (Text Form)

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

This reflects the intended trust model:
- all meaningful access is routed through the firewall
- the management plane is protected
- each lab zone is separated
- the aquarium is contained as a hostile research segment, not treated like a normal subnet

---

## 13. Operational Principles

### Principle 1: Management is sacred
Do not casually expose Proxmox management to other lab zones.

### Principle 2: VPN first
Remote admin access should come through WireGuard, not direct public exposure.

### Principle 3: Default deny wins
If a flow is not clearly needed, block it.

### Principle 4: Separate trust levels
Attacker, victim, SOC, aquarium, and management should not live in the same unrestricted space.

### Principle 5: Dangerous workloads need containment
Malware research belongs in a quarantine model, not in a convenience model.

### Principle 6: Document what exists
If the cluster depends on undocumented rules, it is fragile.

---

## 14. Public-Safe Description
If a short public description is needed, this version is safe:

> I built a Proxmox-based virtualization cluster with segmented lab networks, OPNsense firewalling, WireGuard-protected administrative access, and an isolated malware-research aquarium zone inspired by the public Malware-Aquarium concept. The environment is designed for security testing, detection engineering, and controlled detonation experiments while keeping management access separated from hostile or high-risk workloads.

---

## 15. Final Note
This cluster is not just a virtualization stack. It is a controlled lab environment where network trust boundaries matter.

If you keep the design disciplined, it becomes a serious platform for:
- blue-team exercises
- adversary simulation in isolated zones
- malware detonation research
- firewall and segmentation testing
- SOC workflow validation
- IT/OT security demonstrations

If you let it drift into a flat mess with random exceptions, it stops being a serious lab and becomes a liability.


---

## 16. Public Reference
Project reference: `https://github.com/rio/malware-aquarium`

Use that public reference only in sanitized notes. Keep internal deployment details, real VLAN IDs, bridge names, real firewall aliases, and actual routing rules in a separate private document.
