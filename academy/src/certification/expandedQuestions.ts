/** Original additional practice questions authored for CyberLab, mapped to uploaded exam datasheet objectives.
 * These are independent educational examples, not official certification items. */
import type {Question} from './blueprints';

export const EXPANDED_QUESTIONS:Question[] = [
  {
    "id": "NS-14",
    "track": "netsec",
    "domain": "NS-1",
    "stem": "During session establishment, the firewall needs to perform additional classification work. Which description best distinguishes slow-path and fast-path processing?",
    "options": [
      "Slow path handles only DNS and fast path handles HTTPS",
      "Fast path always bypasses security rules",
      "Slow path covers more involved initial processing; established eligible traffic can take an optimized path",
      "Both paths are separate physical network cables"
    ],
    "correct": 2,
    "why": "Initial packets may require deeper session and policy processing, while eligible subsequent packets can follow optimized processing without losing the configured security controls.",
    "study": "1.2"
  },
  {
    "id": "NS-15",
    "track": "netsec",
    "domain": "NS-1",
    "stem": "A company must inspect permitted SSH traffic under an authorized policy. Which decryption capability relates most directly to this protocol?",
    "options": [
      "SSL Inbound Inspection",
      "SSH Proxy",
      "DNS Security",
      "NAT64"
    ],
    "correct": 1,
    "why": "SSH Proxy is the decryption mode associated with inspecting SSH traffic; SSL Forward Proxy and inbound inspection concern TLS rather than SSH.",
    "study": "1.3"
  },
  {
    "id": "NS-16",
    "track": "netsec",
    "domain": "NS-1",
    "stem": "An employee authenticates successfully but uses an unmanaged device to reach a sensitive application. Which additional context supports a Zero Trust decision?",
    "options": [
      "Only the IP address of the DNS resolver",
      "The number of hops from the endpoint",
      "Whether the TCP port is above 1024",
      "User identity, device identity or posture, resource sensitivity, and least-privilege policy"
    ],
    "correct": 3,
    "why": "Authentication is only part of the authorization decision; device and resource context helps prevent a trusted identity from receiving unrestricted network access.",
    "study": "1.4"
  },
  {
    "id": "NS-17",
    "track": "netsec",
    "domain": "NS-1",
    "stem": "A firewall rule permits anyone in a trusted VLAN to reach every server. Which redesign best follows least-privilege segmentation?",
    "options": [
      "Limit source identities, applications and destination zones to approved needs, then log decisions",
      "Add a route to every VLAN and keep allow-any",
      "Turn off User-ID to reduce overhead",
      "Use a larger subnet so users need fewer rules"
    ],
    "correct": 0,
    "why": "Zero Trust segmentation reduces implicit trust by enforcing context-aware, narrowly scoped permissions and maintaining evidence of access decisions.",
    "study": "1.4"
  },
  {
    "id": "NS-18",
    "track": "netsec",
    "domain": "NS-2",
    "stem": "A team needs an NGFW running as a virtual appliance in an existing hypervisor environment. Which option best fits?",
    "options": [
      "PA-Series physical chassis",
      "CN-Series container-focused deployment",
      "VM-Series virtual firewall",
      "Prisma SD-WAN branch router"
    ],
    "correct": 2,
    "why": "VM-Series is designed for virtualized deployments; PA-Series appliances and CN-Series container deployments address different operating environments.",
    "study": "2.1"
  },
  {
    "id": "NS-19",
    "track": "netsec",
    "domain": "NS-2",
    "stem": "A security team wants firewall capabilities integrated with containerized application infrastructure. Which product family should it evaluate?",
    "options": [
      "CN-Series",
      "A physical-only PA-Series model",
      "GlobalProtect portal alone",
      "Panorama log collector only"
    ],
    "correct": 0,
    "why": "CN-Series is oriented toward container-based environments, while the correct choice still depends on orchestration, architecture, and supported deployment requirements.",
    "study": "2.1"
  },
  {
    "id": "NS-20",
    "track": "netsec",
    "domain": "NS-2",
    "stem": "A branch has two WAN uplinks and needs path steering based on application performance. Which solution is most directly aligned?",
    "options": [
      "Advanced URL Filtering",
      "A certificate profile",
      "A User-ID redistribution agent",
      "Prisma SD-WAN"
    ],
    "correct": 3,
    "why": "Prisma SD-WAN focuses on branch connectivity and application-aware path selection; secure remote-user access is a separate use case.",
    "study": "2.2"
  },
  {
    "id": "NS-21",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "An administrator allows HTTPS but wants to restrict a specific risky application identified after the connection begins. Which capability is most useful?",
    "options": [
      "App-ID-aware security policy",
      "Static DNS host files",
      "Security zone names alone",
      "The switch CAM table"
    ],
    "correct": 0,
    "why": "App-ID supplies application classification that can be used in policy decisions independently of the destination port number.",
    "study": "3.1"
  },
  {
    "id": "NS-22",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "A user queries a domain known to be associated with malicious infrastructure. Which cloud-delivered capability most directly addresses DNS-layer threats?",
    "options": [
      "Application Command Center",
      "Advanced DNS Security",
      "Prisma SD-WAN",
      "Software image checksum verification"
    ],
    "correct": 1,
    "why": "Advanced DNS Security addresses DNS-based threat detection and prevention; the available signal and action depend on licensing and policy integration.",
    "study": "3.2.6"
  },
  {
    "id": "NS-23",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "Employees repeatedly access newly registered phishing pages. What security service most directly supplies URL risk categorization and control?",
    "options": [
      "An aggregate Ethernet interface",
      "Dynamic route redistribution",
      "Advanced URL Filtering",
      "A tunnel interface"
    ],
    "correct": 2,
    "why": "Advanced URL Filtering provides URL intelligence for policy enforcement; it does not replace identity controls or security profiles.",
    "study": "3.2.6"
  },
  {
    "id": "NS-24",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "A permitted application contains a suspected exploit attempt. Which security capability should be considered for inline prevention?",
    "options": [
      "Device-ID inventory labeling only",
      "TCP keepalive tuning",
      "Cloud route table naming",
      "Advanced Threat Prevention in an applicable security profile"
    ],
    "correct": 3,
    "why": "Threat-prevention inspection can detect and block exploit-related patterns within permitted traffic when the relevant content is visible and profiles are attached.",
    "study": "3.2.6"
  },
  {
    "id": "NS-25",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "A dashboard flags a firewall policy as overly permissive. How should an AIOps or best-practice assessment recommendation be handled?",
    "options": [
      "Review it against actual applications and requirements, then validate a proposed change",
      "Apply every recommendation without review",
      "Replace all policy with an allow-any rule",
      "Disable all telemetry to improve the score"
    ],
    "correct": 0,
    "why": "Best-practice findings are an input to change control, not proof that every recommended configuration can be safely implemented unchanged.",
    "study": "3.3"
  },
  {
    "id": "NS-26",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "A policy decision needs to consider identity relationships and changing trust context across the platform. Which blueprint concept is most relevant?",
    "options": [
      "Static source port allocation",
      "Manual cable labeling",
      "Next-Generation Trust Security",
      "Only the default route"
    ],
    "correct": 2,
    "why": "The blueprint frames Next-Generation Trust Security around identity governance, relationships, and adaptive security decisions rather than packet addressing alone.",
    "study": "3.4"
  },
  {
    "id": "NS-27",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "A developer pastes customer data into an unapproved AI application. Which first response most directly reduces exposure?",
    "options": [
      "Create an IP route to the AI site",
      "Discover AI application use and enforce appropriate data-handling and access policy",
      "Disable certificate validation",
      "Widen the SaaS allow rule"
    ],
    "correct": 1,
    "why": "AI-related data exposure should be approached through application discovery, acceptable-use controls, and data protection rather than indiscriminate connectivity changes.",
    "study": "3.6"
  },
  {
    "id": "NS-28",
    "track": "netsec",
    "domain": "NS-3",
    "stem": "Why might a team prioritize post-quantum readiness for records that must remain confidential for decades?",
    "options": [
      "The traffic is UDP",
      "All HTTPS is currently unencrypted",
      "Quantum capability is required to use VPNs today",
      "Recorded ciphertext may be exposed to future cryptanalytic advances"
    ],
    "correct": 3,
    "why": "Long-term confidentiality planning accounts for data captured now that could be decrypted later if relevant cryptographic assumptions change.",
    "study": "3.5"
  },
  {
    "id": "NS-29",
    "track": "netsec",
    "domain": "NS-4",
    "stem": "After changing a Prisma Access security rule, which evidence best demonstrates that the change is safe?",
    "options": [
      "The rule name is descriptive",
      "The deployment UI shows green",
      "Permitted user traffic works, blocked paths stay blocked, and relevant logs are reviewed",
      "The endpoint has a public IPv4 address"
    ],
    "correct": 2,
    "why": "Configuration success is not the same as secure behavior; positive and negative traffic validation is needed after policy changes.",
    "study": "4.2"
  },
  {
    "id": "NS-30",
    "track": "netsec",
    "domain": "NS-4",
    "stem": "Before a PAN-OS upgrade on a critical firewall, which operational preparation is most defensible?",
    "options": [
      "Record compatibility, backup, HA implications, maintenance plan and rollback checks",
      "Disable monitoring forever",
      "Remove device inventory records",
      "Reuse production administrative credentials in a shared script"
    ],
    "correct": 0,
    "why": "Upgrade planning needs dependency awareness, a recovery approach, and clear verification of both traffic and management after the change.",
    "study": "4.1"
  },
  {
    "id": "NS-31",
    "track": "netsec",
    "domain": "NS-5",
    "stem": "A firewall has an updated threat signature set, but users still download malicious files through an allowed rule. What should be checked?",
    "options": [
      "A mismatch between the observed file type and the profile decoder",
      "Whether an applicable profile is attached to the matching allow rule and receives inspectable content",
      "Whether the route has the smallest metric",
      "Only the number of virtual routers"
    ],
    "correct": 1,
    "why": "Security updates matter only when the corresponding protection is configured and applicable to the traffic being evaluated.",
    "study": "5.1"
  },
  {
    "id": "NS-32",
    "track": "netsec",
    "domain": "NS-5",
    "stem": "A SaaS application holds regulated customer records. Which combination is most appropriate?",
    "options": [
      "A new VLAN alone",
      "Turn off audit logs and rely on passwords",
      "Route through the cheapest WAN uplink",
      "Data classification, scoped access controls, encryption and activity visibility"
    ],
    "correct": 3,
    "why": "SaaS data protection depends on the sensitivity of records, effective authorization, encryption, and evidence of data access or transfer.",
    "study": "5.3"
  },
  {
    "id": "NS-33",
    "track": "netsec",
    "domain": "NS-5",
    "stem": "A new firewall appears in inventory but does not receive the intended centralized policy. Which management context is worth investigating?",
    "options": [
      "TCP timestamp options",
      "Whether the assigned device group has inherited the expected template stack",
      "SCM/Panorama onboarding, assignment and configuration-management status",
      "Host-only DNS cache"
    ],
    "correct": 2,
    "why": "Centralized management requires correct device onboarding, assignment and configuration distribution before policy consistency can be assumed.",
    "study": "5.4"
  },
  {
    "id": "NS-34",
    "track": "netsec",
    "domain": "NS-5",
    "stem": "A newly discovered IoT controller sends traffic to an unauthorized management host. What makes the policy investigation actionable?",
    "options": [
      "Link device identity, owning system, zone, traffic logs and allowed applications",
      "Ignore the event because IoT devices cannot authenticate",
      "Permit any protocol from the controller",
      "Disable logging to minimize storage"
    ],
    "correct": 0,
    "why": "Device identification and ownership context allow the security team to apply and verify targeted segmentation for unmanaged or specialized devices.",
    "study": "5.2"
  },
  {
    "id": "NS-35",
    "track": "netsec",
    "domain": "NS-6",
    "stem": "A VPN tunnel is up, yet a private application remains unreachable from a hybrid site. Which two dimensions must be checked independently?",
    "options": [
      "Whether the tunnel interface has the expected address and path MTU",
      "Browser cookie length and TLS cipher names",
      "Only the public DNS TTL",
      "Route or return-path reachability and effective security rules"
    ],
    "correct": 3,
    "why": "Tunnel establishment proves neither route symmetry nor application authorization; both forwarding and policy need verification.",
    "study": "6.1"
  },
  {
    "id": "NS-36",
    "track": "netsec",
    "domain": "NS-6",
    "stem": "A remote user has a valid client certificate but is denied access to a finance application. What conclusion is supported?",
    "options": [
      "The certificate automatically grants all application access",
      "The authenticated identity can still be blocked by role or segmentation policy",
      "Routing is impossible when certificates are used",
      "All packets must be malware"
    ],
    "correct": 1,
    "why": "Certificate-based authentication establishes an identity or trust condition, while authorization to a particular resource remains a separate decision.",
    "study": "6.2"
  },
  {
    "id": "FW-12",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "Two VLANs must share one physical interface without Layer 3 routing on the firewall. Which interface behavior best fits a Layer 2 deployment?",
    "options": [
      "Configure a GlobalProtect portal",
      "Attach Layer 2 interfaces to suitable VLANs and zone context",
      "Install a new license server",
      "Create an SSL forward-trust certificate"
    ],
    "correct": 1,
    "why": "A Layer 2 deployment bridges traffic within its configured VLAN topology; routing between subnets is a separate architectural function.",
    "study": "1.1.1"
  },
  {
    "id": "FW-13",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "A firewall must be the default gateway for 10.40.10.0/24 and enforce policy to other networks. Which interface type is appropriate?",
    "options": [
      "Layer 3 interface with an address in the subnet, routed context and zone",
      "Management interface only",
      "Virtual wire with no IP gateway",
      "Log collector group"
    ],
    "correct": 0,
    "why": "An L3 interface participates in IP forwarding and can serve the subnet as a gateway when the addressing, route table and zone are configured.",
    "study": "1.1.2"
  },
  {
    "id": "FW-14",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "An organization inserts an NGFW transparently between two routers with minimal address-plan changes. Which deployment option is relevant?",
    "options": [
      "A GlobalProtect gateway",
      "A server certificate profile",
      "An ACC report",
      "Virtual wire interfaces"
    ],
    "correct": 3,
    "why": "A virtual wire pair can provide inline inspection with reduced Layer 3 addressing changes, subject to the platform and topology design.",
    "study": "1.1.3"
  },
  {
    "id": "FW-15",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "Two Ethernet links must form a single logical interface for redundancy or capacity. What must be coordinated?",
    "options": [
      "Only the web-proxy URL",
      "The DNS A record",
      "Aggregate Ethernet and compatible link aggregation on the peer",
      "The firewall superuser password"
    ],
    "correct": 2,
    "why": "Aggregation requires compatible configuration across connected devices; mismatched LACP or interface settings can cause unstable forwarding.",
    "study": "1.1.5"
  },
  {
    "id": "FW-16",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "In active/passive HA, what normally happens to traffic ownership when a healthy passive peer becomes active after failure?",
    "options": [
      "Both peers always forward every session",
      "The promoted peer assumes the active forwarding role subject to failover and session state",
      "Traffic is permanently blocked",
      "The DNS server must become the new firewall"
    ],
    "correct": 1,
    "why": "Active/passive HA places forwarding ownership on the active peer, with failover behavior depending on synchronization and platform conditions.",
    "study": "1.3.2"
  },
  {
    "id": "FW-17",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "The data interface is up but its upstream next hop is unavailable. Which HA monitoring design can expose this condition?",
    "options": [
      "Path monitoring to suitable reachability targets",
      "The application page title",
      "A static website redirect",
      "Reordering unrelated certificate objects"
    ],
    "correct": 0,
    "why": "Link state can remain healthy while forwarding is broken farther upstream; path monitoring can detect the wider connectivity failure.",
    "study": "1.3.3"
  },
  {
    "id": "FW-18",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "An engineer expects an OSPF-learned network but sees no route. Which first investigation is most direct?",
    "options": [
      "Inspect only NAT address pools",
      "Replace all source zones",
      "Disable User-ID",
      "Check routing peer state, advertised prefixes and route installation"
    ],
    "correct": 3,
    "why": "Dynamic routing requires neighbor formation, route acceptance and installation; a policy permit alone does not create a learned route.",
    "study": "1.4.1"
  },
  {
    "id": "FW-19",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "A new route is redistributed unexpectedly into a routing domain. Which control should be reviewed?",
    "options": [
      "Password expiry policy",
      "SSL Forward Untrust certificate",
      "Redistribution policy and prefix selection",
      "The configured administrative access profile on the routing instance"
    ],
    "correct": 2,
    "why": "Route redistribution can expand reachability beyond intent; explicit policies limit which routes are exported between routing sources.",
    "study": "1.4.2"
  },
  {
    "id": "FW-20",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "A GlobalProtect user should send corporate subnets through the tunnel but use the local internet breakout. Which configuration concept applies?",
    "options": [
      "PAN-OS administrator role",
      "Split tunneling based on intended networks and security requirements",
      "Virtual wire pair",
      "Path-length constraint in a CA"
    ],
    "correct": 1,
    "why": "Split tunneling determines which traffic traverses the remote-access tunnel and must be designed with application and monitoring requirements.",
    "study": "1.5.4"
  },
  {
    "id": "FW-21",
    "track": "ngfw",
    "domain": "FW-1",
    "stem": "Two sites establish an IPSec tunnel but cannot exchange a protected subnet. What needs verification?",
    "options": [
      "Tunnel parameters, routes, selectors where applicable and traffic policy",
      "Only the firewall rule that permits the IKE control channel",
      "Only the presence of a route on the initiating tunnel peer",
      "Only the service-port mapping used by the management plane"
    ],
    "correct": 0,
    "why": "Successful IKE/IPSec negotiation does not independently prove that specific protected subnets have correct forwarding and security-policy treatment.",
    "study": "1.6.1"
  },
  {
    "id": "FW-22",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "A SOC analyst needs traffic logs and limited diagnostics but must not edit policy. Which administration design best fits?",
    "options": [
      "Shared superuser account",
      "Disable authentication for that analyst",
      "Grant unrestricted API write access",
      "Role-based access with read-only permissions appropriate to the job"
    ],
    "correct": 3,
    "why": "Role-based administration should align with duties and preserve auditability; broad write privileges create unnecessary configuration risk.",
    "study": "2.1"
  },
  {
    "id": "FW-23",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "Two departments need separate policy and administrative contexts on one supported physical firewall. Which feature is relevant?",
    "options": [
      "Zone protection only",
      "An SSL client certificate alone",
      "Virtual systems (VSYS)",
      "A traffic log filter"
    ],
    "correct": 2,
    "why": "Virtual systems provide logical separation of firewall contexts, but shared resources and inter-VSYS traffic still require deliberate design.",
    "study": "2.2"
  },
  {
    "id": "FW-24",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "Traffic must move from VSYS-A to VSYS-B. Why is creating only a security rule inside VSYS-A insufficient?",
    "options": [
      "Inter-VSYS connectivity also requires the appropriate interface and routing design and policy at relevant boundaries",
      "A file upload is required",
      "The packet must be changed to ICMP",
      "A root CA must sign the subnet"
    ],
    "correct": 0,
    "why": "Inter-VSYS flows rely on the chosen connectivity architecture and security enforcement across the relevant contexts, not a single isolated rule.",
    "study": "2.2.4"
  },
  {
    "id": "FW-25",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "A branch firewall shows a threat event locally, but the central monitoring platform receives nothing. Which area should be checked?",
    "options": [
      "Whether the source log has been filtered by the viewer search scope",
      "Log forwarding profiles, destination connectivity and collector/service status",
      "Whether a diagnostic panel is visible on the local administrator console",
      "Whether an optional route comment has been synchronized"
    ],
    "correct": 1,
    "why": "Central visibility depends on both generating the event and successfully forwarding it to the configured logging destination.",
    "study": "2.3.2"
  },
  {
    "id": "FW-26",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "An organization operates multiple managed firewalls and needs centralized log retention. Which design element is relevant?",
    "options": [
      "GlobalProtect split tunnel list",
      "Virtual wire MAC learning",
      "DNS recursion",
      "Log collectors, collector groups or the supported logging service"
    ],
    "correct": 3,
    "why": "Central logging architecture must account for ingestion, capacity, forwarding configuration and connectivity from managed firewalls.",
    "study": "2.3.3"
  },
  {
    "id": "FW-27",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "A PAN-OS maintenance upgrade is scheduled on an HA pair. Which step best reduces operational risk?",
    "options": [
      "Upgrade both peers without reading compatibility information",
      "Remove all policy before reboot",
      "Verify version path, HA compatibility, backups, failover steps and post-change traffic",
      "Disable all monitoring for the following month"
    ],
    "correct": 2,
    "why": "Upgrading firewalls in HA requires careful compatibility checks and a tested rollback plan as well as validation of user traffic.",
    "study": "2.4"
  },
  {
    "id": "FW-28",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "An HTTPS server presents a certificate issued by an internal CA that clients do not trust. What is the relevant fix?",
    "options": [
      "Distribute the appropriate trust anchor securely and verify the full chain and hostname",
      "Disable TLS entirely",
      "Replace the routing protocol",
      "Enable allow-any security policy"
    ],
    "correct": 0,
    "why": "TLS peer authentication requires a valid trust path and matching identity; a working network route does not establish certificate trust.",
    "study": "2.5.1"
  },
  {
    "id": "FW-29",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "An SSL Forward Proxy deployment shows untrusted-issuer warnings on managed endpoints. What certificate deployment should be reviewed?",
    "options": [
      "Only the NAT port number",
      "Distribution and trust of the firewall Forward Trust CA certificate",
      "OSPF route redistribution",
      "Endpoint MAC table size"
    ],
    "correct": 1,
    "why": "Forward Proxy creates certificates for inspected sessions; managed endpoints must trust the appropriate issuing certificate under an approved deployment.",
    "study": "2.5.4"
  },
  {
    "id": "FW-30",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "A user-based allow rule stops matching after an identity-directory change. Which dependency matters?",
    "options": [
      "The Ethernet duplex setting only",
      "The DNS domain search order only",
      "Antivirus signature names",
      "Group mapping and directory synchronization health"
    ],
    "correct": 3,
    "why": "Identity-aware rules depend on current and correct user/group mappings; stale directory information can change authorization behavior.",
    "study": "2.6.1"
  },
  {
    "id": "FW-31",
    "track": "ngfw",
    "domain": "FW-2",
    "stem": "A design requires HTTP proxy handling on a supported PAN-OS deployment. Which feature should be assessed?",
    "options": [
      "Aggregate Ethernet failover",
      "GRE dynamic routing",
      "PAN-OS web proxy configuration and supported operating mode",
      "A local-only threat signature file"
    ],
    "correct": 2,
    "why": "Web proxy functionality has its own deployment and policy considerations; it is not simply equivalent to all transparent firewall forwarding.",
    "study": "2.7"
  },
  {
    "id": "FW-32",
    "track": "ngfw",
    "domain": "FW-3",
    "stem": "A security team needs to protect traffic within Kubernetes and wants to evaluate Palo Alto container-oriented options. Which should be considered?",
    "options": [
      "CN-Series in supported architectures",
      "Only PA-Series rack mounting",
      "An ACC dashboard",
      "A User-ID syslog parser by itself"
    ],
    "correct": 0,
    "why": "CN-Series is among the container-focused deployment options; compatibility, orchestration and support requirements determine feasibility.",
    "study": "3.1"
  },
  {
    "id": "FW-33",
    "track": "ngfw",
    "domain": "FW-3",
    "stem": "A Python automation client creates a rule through a firewall API. What is required before treating the change as active?",
    "options": [
      "Only that the HTTP request returned 200",
      "Updating the DNS TTL",
      "Restarting every laptop",
      "Verify API response and appropriate configuration validation, commit or push, and traffic tests"
    ],
    "correct": 3,
    "why": "API submission, candidate configuration and active enforcement can be distinct steps; a safe workflow validates applied state and behavior.",
    "study": "3.2"
  },
  {
    "id": "FW-34",
    "track": "ngfw",
    "domain": "FW-3",
    "stem": "Terraform manages firewall objects while an engineer manually changes those same objects in the GUI. What risk increases?",
    "options": [
      "Certificate expiry never occurs",
      "Configuration drift between declared and actual state",
      "TCP session reassembly disappears",
      "Source zone becomes the destination zone"
    ],
    "correct": 1,
    "why": "Infrastructure automation should detect or reconcile out-of-band changes so the intended configuration remains authoritative.",
    "study": "3.3"
  },
  {
    "id": "FW-35",
    "track": "ngfw",
    "domain": "FW-3",
    "stem": "A centralized management design needs a broad baseline rule applied before local device-group rules. Which concept should be studied?",
    "options": [
      "Post-rule only",
      "Route-map preference",
      "Panorama pre-rules and device-group hierarchy",
      "NTP packet signing"
    ],
    "correct": 2,
    "why": "Pre-rules can establish centrally governed policy precedence; hierarchy and rule placement determine the resulting effective policy.",
    "study": "3.4.4"
  },
  {
    "id": "FW-36",
    "track": "ngfw",
    "domain": "FW-3",
    "stem": "Security operations wants a report of top applications, users and threats over a time window. What is a suitable source?",
    "options": [
      "Application Command Center and relevant logs, with filters and reporting",
      "Only a default gateway ping",
      "Running certificate generation",
      "Editing a management port speed"
    ],
    "correct": 0,
    "why": "ACC and logging can summarize applications and threats, but analysts should verify data completeness and the chosen time scope.",
    "study": "3.5"
  },
  {
    "id": "CL-14",
    "track": "cloud",
    "domain": "CL-1",
    "stem": "A cloud alert suggests a workload may be compromised. Which team function should coordinate containment and evidence preservation?",
    "options": [
      "Front-end styling team only",
      "Procurement only",
      "Security operations and incident response with workload owners",
      "DNS registrar by default"
    ],
    "correct": 2,
    "why": "SOC and incident response coordinate triage and containment while preserving evidence and working with the teams responsible for affected workloads.",
    "study": "1.1"
  },
  {
    "id": "CL-15",
    "track": "cloud",
    "domain": "CL-1",
    "stem": "An ML model labels a new cloud API call anomalous. What is the appropriate analyst response?",
    "options": [
      "Treat the score as a lead and validate identity, workload, timing and telemetry",
      "Assume anomalous always means malicious",
      "Permanently disable all cloud APIs",
      "Suppress the alert without review"
    ],
    "correct": 0,
    "why": "Anomaly scores provide supporting evidence; investigation should correlate behavior and business context before concluding compromise.",
    "study": "1.2"
  },
  {
    "id": "CL-16",
    "track": "cloud",
    "domain": "CL-2",
    "stem": "A detection matches a cloud IP address but lacks account ownership. Which added data is most valuable for triage?",
    "options": [
      "Only the public IP reputation score from a previous week",
      "Only the transport port used by the source agent",
      "Only the original source IP without cloud account ownership",
      "Cloud account, asset identity, resource owner and exposure context"
    ],
    "correct": 3,
    "why": "Identity and asset context help determine who owns the resource and what could be affected, improving escalation and remediation.",
    "study": "2.1.1"
  },
  {
    "id": "CL-17",
    "track": "cloud",
    "domain": "CL-2",
    "stem": "A cloud policy dashboard reports compliance violations. Which interpretation is most defensible?",
    "options": [
      "Every finding proves active compromise",
      "Policy violations identify configuration or governance gaps needing context and review",
      "Compliance always blocks every exploit",
      "Only a full PCAP can reveal a configuration finding"
    ],
    "correct": 1,
    "why": "Compliance findings indicate a deviation from required controls, not necessarily that an attacker exploited the condition.",
    "study": "2.1.3"
  },
  {
    "id": "CL-18",
    "track": "cloud",
    "domain": "CL-2",
    "stem": "An executive dashboard shows decreasing alert counts following a sensor deployment change. Why should the analyst be cautious?",
    "options": [
      "The graph has no legend",
      "All attacks have stopped",
      "Data-source coverage may have declined and reduced visibility",
      "A reduction always means stronger security"
    ],
    "correct": 2,
    "why": "Metrics can improve or worsen because telemetry changes, so coverage and ingestion health should be checked before interpreting trends.",
    "study": "2.2"
  },
  {
    "id": "CL-19",
    "track": "cloud",
    "domain": "CL-3",
    "stem": "An admission policy permits privileged pods in production namespaces. Which posture control is most relevant?",
    "options": [
      "Database query caching",
      "Cloud security email notifications",
      "Physical VPN cabling",
      "Kubernetes configuration and workload privilege posture checks"
    ],
    "correct": 3,
    "why": "KSPM evaluates Kubernetes configuration risks including privileged workload settings and cluster policy posture.",
    "study": "3.1.2"
  },
  {
    "id": "CL-20",
    "track": "cloud",
    "domain": "CL-3",
    "stem": "An AI service account can access a sensitive training dataset it does not need. Which AI posture concern is involved?",
    "options": [
      "TCP retransmission count",
      "Excessive identity permissions and sensitive AI data exposure",
      "A virtual wire loop",
      "DHCP address exhaustion alone"
    ],
    "correct": 1,
    "why": "AI-SPM considers AI application resources and their security context, including identity and data access risk.",
    "study": "3.1.3"
  },
  {
    "id": "CL-21",
    "track": "cloud",
    "domain": "CL-3",
    "stem": "A data store is private but contains unclassified regulated records. Which capability best supports discovering their sensitivity?",
    "options": [
      "Port mirroring",
      "Source NAT",
      "Data Security Posture Management (DSPM)",
      "Dynamic VPN path selection"
    ],
    "correct": 2,
    "why": "DSPM helps discover, classify and contextualize sensitive data; private network placement alone does not establish safe handling.",
    "study": "3.1.4"
  },
  {
    "id": "CL-22",
    "track": "cloud",
    "domain": "CL-3",
    "stem": "An organization wants to evaluate cloud configurations without installing a workload agent on each VM. Which approach is relevant?",
    "options": [
      "Agentless cloud posture or snapshot-based assessment where supported",
      "Disable access logs",
      "Replace IAM with shared credentials",
      "Force every application to run on one host"
    ],
    "correct": 0,
    "why": "Agentless scanning can gather posture or workload evidence through authorized platform integrations, subject to its visibility limitations.",
    "study": "3.1.5"
  },
  {
    "id": "CL-23",
    "track": "cloud",
    "domain": "CL-3",
    "stem": "A security team maps cloud resources to internal policy and regulatory requirements. Which posture capability best fits?",
    "options": [
      "A TCP RST counter",
      "A manual firewall serial label",
      "Browser localStorage only",
      "Unified compliance assessment and control mapping"
    ],
    "correct": 3,
    "why": "Unified compliance mapping links observed settings and evidence to control requirements so deviations can be evaluated consistently.",
    "study": "3.1.6"
  },
  {
    "id": "CL-24",
    "track": "cloud",
    "domain": "CL-3",
    "stem": "A service identity has administrator privileges across several production subscriptions but uses only read operations. What is the main risk?",
    "options": [
      "The service will always run faster",
      "Excessive permissions increase possible blast radius after credential compromise",
      "Its IP address becomes nonroutable",
      "PKI verification becomes impossible"
    ],
    "correct": 1,
    "why": "Cloud identity security examines effective privileges; reducing unnecessary privileges limits the damage possible from exposed credentials.",
    "study": "3.1.7"
  },
  {
    "id": "CL-25",
    "track": "cloud",
    "domain": "CL-3",
    "stem": "A base image has a severe vulnerability but is not used by any active workload. What additional context helps prioritize remediation?",
    "options": [
      "The publisher label of the base image without its deployment scope",
      "Office Wi-Fi SSID",
      "Deployment presence, reachability, exploitability and affected business services",
      "Only the cloud provider billing cycle"
    ],
    "correct": 2,
    "why": "Vulnerability severity is one input; exploitability, exposure and active asset usage determine practical remediation urgency.",
    "study": "3.1.8"
  },
  {
    "id": "CL-26",
    "track": "cloud",
    "domain": "CL-4",
    "stem": "A production VM needs behavioral protection while its operating system runs. Which capability is primarily relevant?",
    "options": [
      "Cloud Workload Protection (CWP)",
      "Only infrastructure template linting",
      "WAN link aggregation",
      "DNS authoritative zone transfer"
    ],
    "correct": 0,
    "why": "CWP addresses workload security during operation, complementing posture and predeployment analysis of configuration.",
    "study": "4.1.1"
  },
  {
    "id": "CL-27",
    "track": "cloud",
    "domain": "CL-4",
    "stem": "A cloud container launches an unexpected shell and contacts an unusual external address. Which evidence best supports investigation?",
    "options": [
      "Only the repository README",
      "Only the default CPU architecture",
      "Only account billing data",
      "Process lineage, container identity, network events and workload context"
    ],
    "correct": 3,
    "why": "Cloud detection and response combines runtime activity with asset and process context to distinguish anomalies from expected behavior.",
    "study": "4.1.2"
  },
  {
    "id": "CL-28",
    "track": "cloud",
    "domain": "CL-4",
    "stem": "An internet-facing API experiences abnormal requests attempting to access administrative resources. Which control is especially relevant?",
    "options": [
      "Kubernetes node naming",
      "Web Application and API Security (WAAS)",
      "Password manager autofill",
      "A static route to the intranet"
    ],
    "correct": 1,
    "why": "WAAS focuses on exposed web and API request patterns and can complement application authorization and vulnerability remediation.",
    "study": "4.1.3"
  },
  {
    "id": "CL-29",
    "track": "cloud",
    "domain": "CL-4",
    "stem": "A scanner identifies a critical package flaw in a running service. Which next step best improves decision quality?",
    "options": [
      "Reboot every cloud VM immediately",
      "Ignore the finding until annual audit",
      "Check affected workload inventory, exploitability, access path and mitigation options",
      "Disable the resource inventory"
    ],
    "correct": 2,
    "why": "Runtime and vulnerability context should inform remediation priorities and whether containment or a tested patch is warranted.",
    "study": "4.1.4"
  },
  {
    "id": "CL-30",
    "track": "cloud",
    "domain": "CL-4",
    "stem": "A cluster has no runtime alerts even though suspicious activity is known. What operational hypothesis should be tested?",
    "options": [
      "The agent or data integration may be missing, unhealthy or scoped incorrectly",
      "TLS can never be inspected",
      "The workload has no hostname",
      "Every attack generates an alert by default"
    ],
    "correct": 0,
    "why": "Absent alerts can signal missing telemetry rather than no attack; integration scope and sensor health are primary checks.",
    "study": "4.2"
  },
  {
    "id": "CL-31",
    "track": "cloud",
    "domain": "CL-4",
    "stem": "An analyst isolates a compromised workload but disrupts production traffic. Which lesson should the incident response plan incorporate?",
    "options": [
      "Containment must never be performed",
      "Every alert should close automatically",
      "Audit logs can be discarded",
      "Predefined containment options, service dependencies and approval criteria"
    ],
    "correct": 3,
    "why": "Containment should reduce adversary activity while accounting for business impact and preserving evidence for root-cause analysis.",
    "study": "4.1.2"
  },
  {
    "id": "CL-32",
    "track": "cloud",
    "domain": "CL-4",
    "stem": "What is the core difference between a cloud posture misconfiguration and a runtime detection?",
    "options": [
      "They are identical labels",
      "Posture describes insecure configuration; runtime detection concerns observed execution behavior",
      "Runtime detection cannot involve containers",
      "A posture finding always proves code execution"
    ],
    "correct": 1,
    "why": "Posture assessment and runtime monitoring answer distinct questions and are most useful when correlated against common assets.",
    "study": "4.1.1"
  },
  {
    "id": "CL-33",
    "track": "cloud",
    "domain": "CL-5",
    "stem": "Several tools report overlapping flaws in the same web application. Which ASPM outcome is most useful?",
    "options": [
      "Sort findings only alphabetically",
      "Disable the repository",
      "Correlate application risks to ownership and prioritize remediation in context",
      "Replace every firewall with a proxy"
    ],
    "correct": 2,
    "why": "Application Security Posture Management helps coordinate and prioritize application risks across sources, owners and development workflows.",
    "study": "5.1.1"
  },
  {
    "id": "CL-34",
    "track": "cloud",
    "domain": "CL-5",
    "stem": "A CI/CD workflow allows unreviewed deployment changes into production. Which security concern is most direct?",
    "options": [
      "Weak deployment pipeline controls and change governance",
      "Excessive static routes",
      "A missing approval tag on the unrelated workstation inventory",
      "A stale signature on a single lab endpoint"
    ],
    "correct": 0,
    "why": "CI/CD posture management evaluates the security of pipeline configuration, identities, approvals and deployment processes.",
    "study": "5.1.2"
  },
  {
    "id": "CL-35",
    "track": "cloud",
    "domain": "CL-5",
    "stem": "A dependency scan finds a vulnerable library reachable through an application endpoint. What should the team do?",
    "options": [
      "Assume the vulnerability is a false positive",
      "Delete all traffic logs",
      "Change the port number only",
      "Confirm affected usage, patch or mitigate, and verify the application after the change"
    ],
    "correct": 3,
    "why": "SCA findings should be tied to actual dependencies and application reachability, then fixed and validated with repeatable tests.",
    "study": "5.1.3"
  },
  {
    "id": "CL-36",
    "track": "cloud",
    "domain": "CL-5",
    "stem": "A developer accidentally pushes an API token into Git. What is the correct immediate security response?",
    "options": [
      "Rename the file without rotating the token",
      "Revoke or rotate the exposed token, investigate usage and remove it from future deployments",
      "Hide the token in a CSS comment",
      "Leave it because the repository is private"
    ],
    "correct": 1,
    "why": "Once credentials reach source history they may be copied; credential invalidation and exposure assessment are necessary beyond deleting the visible line.",
    "study": "5.1.5"
  }
];
