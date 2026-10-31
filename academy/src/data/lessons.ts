export interface Lesson {
  id: number;
  tag: string;
  title: string;
  summary: string;
  concept: string;
  mission: string;
  hint: string;
  estimated: string;
}
export const LESSONS: Lesson[] = [
  {
    id:1,tag:'Explore',title:'Meet the network',summary:'Understand the devices behind a simple secured application.',
    concept:'A client requests a service. A firewall mediates traffic between security zones, while the SOC observes decisions. Click devices to discover their roles and addresses.',
    mission:'Inspect the workstation, edge firewall, and web application by clicking all three nodes in the topology.',
    hint:'Click the workstation on the left, the firewall in the middle, and the web application on the right.',estimated:'4 min'
  },
  {
    id:2,tag:'Discover',title:'Follow the DNS query',summary:'See how a hostname becomes a destination IP address.',
    concept:'DNS resolves human-readable names to IP addresses. This lesson uses an intentionally small classroom DNS zone; there is no external DNS request.',
    mission:'Open the DNS tool and successfully resolve app.cyberlab.local.',
    hint:'Choose the DNS tab in the right panel and enter app.cyberlab.local.',estimated:'5 min'
  },
  {
    id:3,tag:'Connect',title:'The HTTPS handshake',summary:'Watch a permitted TCP connection reach a protected service.',
    concept:'TCP begins with SYN, SYN-ACK and ACK. In this simplified simulation, a predefined firewall rule allows TCP/443 and the connection reaches the web application.',
    mission:'Send TCP traffic to the web application on destination port 443 and get an ALLOW result.',
    hint:'Destination: Web application; protocol: TCP; destination port: 443. The HTTPS policy is already configured.',estimated:'6 min'
  },
  {
    id:4,tag:'Defend',title:'Default deny in action',summary:'Compare an allowed service and a blocked administrative port.',
    concept:'Default deny means traffic is rejected unless an explicit policy allows it. A good firewall rule should permit required business traffic without exposing unnecessary services.',
    mission:'Allow HTTPS on TCP/443 and also demonstrate a denied TCP/22 connection to the SSH server.',
    hint:'First test TCP/443 to the web application. Then change the destination to SSH server and the port to 22.',estimated:'6 min'
  },
  {
    id:5,tag:'Build',title:'Write your own policy',summary:'Configure a least-privilege firewall rule from scratch.',
    concept:'Firewall rules should be narrowly scoped, ordered, and verified. In this prototype the policy matches protocol and destination port; source and zone restrictions come later.',
    mission:'Create an enabled ALLOW rule for TCP/443, confirm HTTPS works, and verify that SSH on TCP/22 is still blocked.',
    hint:'Go to Policies → New rule. Set TCP, port 443, Allow; save. Then test HTTPS and SSH.',estimated:'8 min'
  }
];
