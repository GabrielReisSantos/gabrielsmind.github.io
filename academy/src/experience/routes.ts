/** Stable navigation registry. Existing hash routes and storage keys remain unchanged. */
export const LAB_ROUTES={
 foundation:{label:'Foundations',group:'learn',description:'Networking, coding, TLS, certificates and secrets',tag:'FOUNDATIONS'},
 adlab:{label:'Active Directory',group:'learn',description:'Directory services, Kerberos and abuse paths',tag:'IDENTITY'},
 passwords:{label:'Password Auditing Lab',group:'learn',description:'Hash identification, wordlists, rules, masks, John and defensive remediation',tag:'OSCP · HASHES'},
 secrets:{label:'Secrets Storage Atlas',group:'learn',description:'GitHub, SQL, Windows, Linux, macOS, iOS and container credential locations and controls',tag:'OSCP · SECRETS'},
 pentest:{label:'Pentest Academy',group:'learn',description:'Structured OSCP methodology and lessons',tag:'OFFENSIVE'},
 world:{label:'3D Network Range',group:'labs',description:'Build topology, repair VLANs, trace packets',tag:'NETWORK'},
 ngfw:{label:'NGFW Simulator',group:'labs',description:'Learn security policies, App-ID, NAT and routing',tag:'FIREWALL'},
 studio:{label:'Packet Studio',group:'labs',description:'Stateful flows, packet tracing and NAT',tag:'PACKETS'},
 webplay:{label:'HTTP Playground',group:'labs',description:'Web request and security behavior',tag:'WEB'},
 explorer:{label:'Systems Explorer',group:'labs',description:'Connected enterprise systems, actual shared-state faults, investigation and evidence-based recovery',tag:'NEW · V2.9'},
 campaign:{label:'Connected Campaign',group:'investigate',description:'Three linked incidents across AD, native network, NGFW, SOC telemetry and secrets',tag:'NEW · V3.0'},
 missionroom:{label:'Mission Room',group:'investigate',description:'Immersive shared-state incident mission with topology, SOC evidence, live remediation and replay',tag:'NEW · FIELD OPERATIONS'},
 unified:{label:'Unified Cyber Range',group:'investigate',description:'Cross-module AD and NGFW controls linked to one attack, telemetry, detection and replay environment',tag:'CONNECTED · V2.3'},
 purple:{label:'Purple Team Lab',group:'investigate',description:'Red actions, Windows events, detection and remediation',tag:'RED + BLUE'},
 incident:{label:'INC-0042 · Outage',group:'investigate',description:'Restore availability while preserving policy',tag:'SOC'},
 investigation2:{label:'CASE-001 · Investigation',group:'investigate',description:'Collect evidence, determine root cause and retest',tag:'FORENSICS'},
 practice:{label:'OSCP Deep Practice',group:'investigate',description:'Five evidence-driven security scenarios',tag:'OSCP'},
 troubleshoot:{label:'Troubleshooting Lab',group:'investigate',description:'Diagnose and repair infrastructure faults',tag:'DIAGNOSTICS'},
 correlation:{label:'Traffic Correlation',group:'investigate',description:'Correlate packets and network telemetry',tag:'TELEMETRY'},
 missions:{label:'OSCP Missions',group:'investigate',description:'Validate findings and produce reports',tag:'OFFENSIVE'},
 certification:{label:'Certification Academy',group:'certifications',description:'Blueprint-aligned study, reviews and mock exams',tag:'EXAMS'}
} as const;
export type LabRoute=keyof typeof LAB_ROUTES;
export type HubRoute='home'|'learn'|'labs'|'investigate'|'certifications'|'progress'|'guide';
export type AppRoute=LabRoute|Exclude<HubRoute,'certifications'>;
export const HUBS=['home','learn','labs','investigate','certifications','progress','guide'] as const;
export const LAB_IDS=Object.keys(LAB_ROUTES) as LabRoute[];
export function isLabRoute(value:string):value is LabRoute{return Object.prototype.hasOwnProperty.call(LAB_ROUTES,value);}
export function isAppRoute(value:string):value is AppRoute{return value!=='certifications'&&(HUBS as readonly string[]).includes(value)||isLabRoute(value);}
export function routeGroup(page:AppRoute):HubRoute{
 if(isLabRoute(page))return LAB_ROUTES[page].group;
 return page;
}
export function routeLabel(page:AppRoute):string{
 if(isLabRoute(page))return LAB_ROUTES[page].label;
 return {home:'Home',learn:'Learn',labs:'Labs',investigate:'Investigate',progress:'My Progress',guide:'How to Use'}[page];
}
export function routesFor(group:'learn'|'labs'|'investigate'|'certifications'):LabRoute[]{return LAB_IDS.filter(id=>LAB_ROUTES[id].group===group);}
