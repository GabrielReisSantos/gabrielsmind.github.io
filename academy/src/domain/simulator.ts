/** Pure, deterministic teaching model. This never sends real packets or performs scans. */
export type Protocol = 'tcp' | 'udp' | 'icmp';
export type Action = 'allow' | 'deny';
export interface Rule {
  id: string;
  name: string;
  protocol: Protocol;
  destinationPort: number | null;
  action: Action;
  enabled: boolean;
}
export interface Packet {
  source: string;
  destination: string;
  protocol: Protocol;
  destinationPort: number | null;
}
export interface PacketResult {
  action: Action;
  rule: string;
  reason: string;
  steps: string[];
  path: string[];
}
export const DNS_RECORDS: Record<string,string> = {
  'app.cyberlab.local': '10.20.0.10',
  'ssh.cyberlab.local': '10.20.0.22',
  'dns.cyberlab.local': '10.10.0.53'
};
export const DEVICES = [
  { id: 'client', label: 'Analyst workstation', kind: 'workstation', ip: '10.10.0.15', description: 'A trusted employee workstation on the client LAN. Generates the simulated traffic.' },
  { id: 'dns', label: 'DNS resolver', kind: 'dns', ip: '10.10.0.53', description: 'Maps domain names to IP addresses from the static classroom zone.' },
  { id: 'fw', label: 'Edge firewall', kind: 'firewall', ip: '10.10.0.1', description: 'Evaluates ordered policy rules before traffic reaches protected services.' },
  { id: 'web', label: 'Web application', kind: 'server', ip: '10.20.0.10', description: 'The protected HTTPS service. Its classroom hostname is app.cyberlab.local.' },
  { id: 'ssh', label: 'SSH server', kind: 'server', ip: '10.20.0.22', description: 'An administrative host. In this exercise, inbound SSH should be blocked.' },
  { id: 'soc', label: 'SOC console', kind: 'monitor', ip: '10.30.0.8', description: 'Receives the simulated security events and firewall decisions.' }
] as const;
export type DeviceId = typeof DEVICES[number]['id'];
export const HTTPS_RULE: Rule = {id:'https',name:'Allow approved HTTPS',protocol:'tcp',destinationPort:443,action:'allow',enabled:true};
export const initialRulesForLesson = (id: number): Rule[] => id === 3 || id === 4 ? [{...HTTPS_RULE}] : [];
export function lookupDomain(input: string): {name:string;ip:string|null} {
  const name = input.trim().toLowerCase().replace(/\.$/,'');
  return {name, ip: DNS_RECORDS[name] ?? null};
}
export function evaluatePacket(packet: Packet, rules: Rule[]): PacketResult {
  const target = packet.destination === 'ssh' ? 'ssh' : 'web';
  const matched = rules.find(r => r.enabled && r.protocol === packet.protocol && (r.destinationPort === null || r.destinationPort === packet.destinationPort));
  const action = matched?.action ?? 'deny';
  const isTcp = packet.protocol === 'tcp';
  const service = packet.destinationPort === null ? packet.protocol.toUpperCase() : `${packet.protocol.toUpperCase()}/${packet.destinationPort}`;
  const steps = [
    `Client generates ${service} traffic to ${target === 'ssh' ? '10.20.0.22' : '10.20.0.10'}.`,
    `Packet arrives at the edge firewall.`,
    matched ? `Policy match: “${matched.name}” → ${action.toUpperCase()}.` : 'No matching rule; the default-deny policy applies.'
  ];
  if(action === 'allow') {
    if(isTcp) steps.push('SYN → SYN-ACK → ACK (abstracted TCP handshake).');
    steps.push('Traffic is permitted toward the destination.');
  } else steps.push('Firewall drops the packet; no connection is established.');
  steps.push('Decision is written to the simulated SOC event stream.');
  return {
    action,
    rule: matched?.name ?? 'Implicit default deny',
    reason: `${service} ${action === 'allow' ? 'permitted' : 'blocked'} by ${matched?.name ?? 'the default-deny rule'}.`,
    steps,
    path: action === 'allow' ? ['client-fw', `fw-${target}`, 'fw-soc'] : ['client-fw', 'fw-soc']
  };
}
