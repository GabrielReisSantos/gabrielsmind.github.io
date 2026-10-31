/** CyberLab's deterministic, educational NGFW model. No sockets or real packets.
 * Sequence is intentionally simplified: this is NOT the PAN-OS dataplane. */
export type Zone = 'trust' | 'untrust' | 'dmz';
export type AppId = 'ssl' | 'web-browsing' | 'ssh' | 'dns' | 'unknown-tcp';
export type Verdict = 'allow' | 'deny';
export type StepState = 'pass' | 'drop' | 'info';
export type Stage = 'ingress' | 'session' | 'forwarding' | 'nat' | 'security' | 'appid' | 'content' | 'egress';
export interface TraceStep {
  id: Stage;
  phase: 'Ingress' | 'Session setup / fastpath' | 'Application identification' | 'Content inspection' | 'Forwarding / egress';
  title: string;
  state: StepState;
  detail: string;
  evidence: string;
}
export interface Traffic {
  id: string;
  label: string;
  summary: string;
  src: string;
  dst: string;
  sport: number;
  dport: number;
  proto: 'tcp' | 'udp';
  app: AppId;
  threat?: boolean;
  flag?: 'SYN' | 'ACK';
}
export interface SecurityRule {
  id: string; name: string; from: Zone | 'any'; to: Zone | 'any';
  destination: string; app: AppId | 'any';
  service: 'any' | 'application-default' | 'tcp/443' | 'tcp/22';
  action: Verdict; profile: boolean; enabled: boolean;
}
export interface NatRule {
  id: string; name: string; type: 'snat' | 'dnat';
  from: Zone; original: string; translated: string; port: number | null; enabled: boolean;
}
export interface LabConfig {
  security: SecurityRule[];
  nat: NatRule[];
  dmzRoute: boolean;
  decrypt: boolean;
  threatPrevention: boolean;
}
export interface Session {
  id: number;
  original: {src:string;dst:string;sport:number;dport:number;proto:'tcp'|'udp'};
  translated: {src:string;dst:string;sport:number;dport:number;proto:'tcp'|'udp'};
  zones: {from:Zone;to:Zone};
  application: AppId;
  rule: string;
  packets: number;
}
export interface Evaluation {
  verdict: Verdict;
  reason: string;
  actionSource: 'ingress'|'state'|'route'|'policy'|'profile'|'forwarding';
  steps: TraceStep[];
  matchedRule?: string;
  matchedNat?: string;
  original: string;
  translated: string;
  sessionHit: boolean;
  session?: Session;
  application: AppId;
  zones?: {from:Zone;to:Zone};
}
export const TRAFFIC: Traffic[] = [
  {id:'outbound',label:'Outbound HTTPS',summary:'Workstation → Internet web service',src:'10.10.10.15',dst:'203.0.113.80',sport:53000,dport:443,proto:'tcp',app:'ssl',flag:'SYN'},
  {id:'inbound',label:'Published HTTPS (DNAT)',summary:'Internet → public VIP → DMZ web server',src:'192.0.2.25',dst:'198.51.100.20',sport:51200,dport:443,proto:'tcp',app:'ssl',flag:'SYN'},
  {id:'ssh',label:'Untrusted SSH',summary:'Internet → direct DMZ management port',src:'192.0.2.25',dst:'10.20.20.10',sport:51201,dport:22,proto:'tcp',app:'ssh',flag:'SYN'},
  {id:'threat',label:'Threat inside HTTPS',summary:'Workstation → encrypted download with a simulated signature',src:'10.10.10.15',dst:'203.0.113.80',sport:53001,dport:443,proto:'tcp',app:'ssl',threat:true,flag:'SYN'},
  {id:'nonstandard',label:'HTTPS on TCP/8443',summary:'App-ID vs application-default service',src:'10.10.10.15',dst:'203.0.113.80',sport:53002,dport:8443,proto:'tcp',app:'ssl',flag:'SYN'},
  {id:'dns',label:'Internal DNS',summary:'Workstation → resolver in the same zone',src:'10.10.10.15',dst:'10.10.10.53',sport:54000,dport:53,proto:'udp',app:'dns'},
];
export const REPLY: Traffic = {id:'reply',label:'Reply ACK',summary:'Internet server → existing outbound NAT session',src:'203.0.113.80',dst:'198.51.100.5',sport:443,dport:53000,proto:'tcp',app:'ssl',flag:'ACK'};
export function freshConfig(): LabConfig {return {
  dmzRoute:true,decrypt:false,threatPrevention:true,
  nat:[
    {id:'dnat-web',name:'Publish DMZ HTTPS',type:'dnat',from:'untrust',original:'198.51.100.20',translated:'10.20.20.10',port:443,enabled:true},
    {id:'snat-web',name:'Trust outbound SNAT',type:'snat',from:'trust',original:'10.10.10.15',translated:'198.51.100.5',port:null,enabled:true},
  ],
  security:[
    {id:'deny-ssh',name:'Block untrusted SSH',from:'untrust',to:'dmz',destination:'any',app:'ssh',service:'tcp/22',action:'deny',profile:false,enabled:true},
    {id:'publish',name:'Allow published HTTPS',from:'untrust',to:'dmz',destination:'198.51.100.20',app:'ssl',service:'application-default',action:'allow',profile:true,enabled:true},
    {id:'web-out',name:'Trust → web (SSL)',from:'trust',to:'untrust',destination:'any',app:'ssl',service:'application-default',action:'allow',profile:true,enabled:true},
  ]
};}
export function scenarioConfig(caseId:string):LabConfig {
  const c=freshConfig();
  if(caseId==='dnat') c.nat=c.nat.map(r=>r.id==='dnat-web'?{...r,enabled:false}:r);
  if(caseId==='zone') c.security=c.security.map(r=>r.id==='publish'?{...r,to:'trust'}:r);
  if(caseId==='shadow') c.security.unshift({id:'shadow',name:'Overly broad deny',from:'untrust',to:'dmz',destination:'any',app:'any',service:'any',action:'deny',profile:false,enabled:true});
  if(caseId==='profile') {c.decrypt=false;c.threatPrevention=false;}
  if(caseId==='route') c.dmzRoute=false;
  return c;
}
export const CASES = [
  {id:'dnat',name:'01 · Published service unreachable',level:'Beginner',traffic:'inbound',goal:'Restore HTTPS access to the published DMZ server.',symptom:'An external user reaches the public VIP but never reaches the server. Check how the destination is translated and which security zone applies.',hint:'Inspect NAT rules. The published HTTPS DNAT may be disabled.',expected:'allow' as Verdict},
  {id:'zone',name:'02 · Wrong destination zone',level:'Intermediate',traffic:'inbound',goal:'Correct the security rule without weakening the default policy.',symptom:'The DNAT rule works, but the firewall reports an interzone-default deny for the published application.',hint:'Security policy uses the original destination IP but the post-DNAT destination zone. Inspect the Publish rule.',expected:'allow' as Verdict},
  {id:'shadow',name:'03 · Rule shadowing',level:'Intermediate',traffic:'inbound',goal:'Make the specific publish rule win before the broad deny.',symptom:'A broad denial is matching before the intended allow rule. The order of the rulebase matters.',hint:'Move the Publish rule above the overly broad deny, or disable the problematic rule.',expected:'allow' as Verdict},
  {id:'route',name:'04 · Missing DMZ route',level:'Intermediate',traffic:'inbound',goal:'Restore forwarding to the DMZ without bypassing security policy.',symptom:'DNAT finds the internal host, but the post-translation routing lookup cannot reach its network.',hint:'Check the routing control: the DMZ route is missing.',expected:'allow' as Verdict},
  {id:'profile',name:'05 · Invisible encrypted threat',level:'Advanced',traffic:'threat',goal:'Ensure the simulated known signature is detected and blocked.',symptom:'Traffic is allowed even though the sample is marked malicious. The firewall sees TLS, but cannot inspect the encrypted content.',hint:'Enable the teaching-model TLS decryption and the Threat Prevention profile. Decryption alone does not block the sample.',expected:'deny' as Verdict},
] as const;
const phaseMap:Record<Stage,TraceStep['phase']> = {ingress:'Ingress',session:'Session setup / fastpath',forwarding:'Session setup / fastpath',nat:'Session setup / fastpath',security:'Session setup / fastpath',appid:'Application identification',content:'Content inspection',egress:'Forwarding / egress'};
const stageName:Record<Stage,string>={ingress:'Packet ingress',session:'Session lookup',forwarding:'Forwarding / route lookup',nat:'NAT policy lookup',security:'Security policy',appid:'Application identification',content:'Content inspection',egress:'Packet egress'};
const zoneOf=(ip:string):Zone=>ip.startsWith('10.10.10.')?'trust':(ip.startsWith('10.20.20.')||ip.startsWith('10.20.10.'))?'dmz':'untrust';
const routeTo=(dst:string,c:LabConfig):Zone|null=>(dst.startsWith('10.20.20.')||dst.startsWith('10.20.10.'))?(c.dmzRoute?'dmz':null):zoneOf(dst);
const fmt=(src:string,sport:number,dst:string,dport:number)=>`${src}:${sport} → ${dst}:${dport}`;
const copyTuple=(p:Traffic)=>({src:p.src,dst:p.dst,sport:p.sport,dport:p.dport,proto:p.proto});
const appPort=(app:AppId)=>({ssl:443,'web-browsing':80,ssh:22,dns:53,'unknown-tcp':-1})[app];
const serviceMatch=(r:SecurityRule,p:Traffic)=>r.service==='any'||
  (r.service==='application-default'&&p.dport===appPort(p.app))||
  (r.service==='tcp/443'&&p.proto==='tcp'&&p.dport===443)||
  (r.service==='tcp/22'&&p.proto==='tcp'&&p.dport===22);
function ruleMatches(r:SecurityRule,p:Traffic,from:Zone,to:Zone){return r.enabled && (r.from==='any'||r.from===from) &&
 (r.to==='any'||r.to===to) && (r.destination==='any'||r.destination===p.dst) &&
 (r.app==='any'||r.app===p.app) && serviceMatch(r,p);}
function isForwardSession(p:Traffic,s:Session){return p.src===s.original.src&&p.dst===s.original.dst&&p.sport===s.original.sport&&p.dport===s.original.dport&&p.proto===s.original.proto;}
function isReverseSession(p:Traffic,s:Session){return p.src===s.translated.dst&&p.dst===s.translated.src&&p.sport===s.translated.dport&&p.dport===s.translated.sport&&p.proto===s.translated.proto;}
/** Every evaluation uses pure inputs. Caller owns the session table and appends session on allow. */
export function evaluate(p:Traffic,c:LabConfig,sessions:Session[]):Evaluation{
  const steps:TraceStep[]=[];
  const add=(id:Stage,state:StepState,detail:string,evidence:string)=>steps.push({id,phase:phaseMap[id],title:stageName[id],state,detail,evidence});
  let translated=copyTuple(p);
  let matchedRule:SecurityRule|undefined;
  let nat:NatRule|undefined;
  let zones:{from:Zone;to:Zone}|undefined;
  const result=(verdict:Verdict,reason:string,actionSource:Evaluation['actionSource'],session?:Session,hit=false):Evaluation=>({
    verdict,reason,actionSource,steps,matchedRule:matchedRule?.name,matchedNat:nat?.name,
    original:fmt(p.src,p.sport,p.dst,p.dport),translated:fmt(translated.src,translated.sport,translated.dst,translated.dport),
    sessionHit:hit,session,application:p.app,zones
  });
  add('ingress','pass',`Received a ${p.proto.toUpperCase()} ${p.flag??'datagram'} on the ${zoneOf(p.src).toUpperCase()} side. Header validation passed (simulated).`,`Source ${p.src} / destination ${p.dst} / destination port ${p.dport}`);
  if(p.flag==='ACK'){
    const existing=sessions.find(s=>isReverseSession(p,s));
    if(!existing){add('session','drop','Unsolicited ACK has no matching established session. Stateful inspection drops it.','No session key for translated reverse five-tuple.');return result('deny','Out-of-state return packet: no matching session.','state');}
    add('session','pass',`Reverse-flow session #${existing.id} found. The existing policy decision applies in both directions.`,`Session #${existing.id} · ${existing.rule} · packets ${existing.packets+1}`);
    translated={src:existing.original.dst,dst:existing.original.src,sport:existing.original.dport,dport:existing.original.sport,proto:p.proto};
    add('egress','pass','Return packet is reverse-translated and forwarded through the established session.',fmt(translated.src,translated.sport,translated.dst,translated.dport));
    return result('allow','Reverse traffic permitted by established state, not a new inbound allow rule.','state',{...existing,packets:existing.packets+1},true);
  }
  const hit=sessions.find(s=>isForwardSession(p,s));
  if(hit){
    add('session','pass',`Session #${hit.id} already exists: fastpath for this teaching model.`,`Rule ${hit.rule} · ${hit.packets+1} packets`);
    translated={...hit.translated};
    add('egress','pass','Forwarding using the translation and zones stored in the session.',fmt(translated.src,translated.sport,translated.dst,translated.dport));
    return result('allow','Existing session hit: no new rulebase evaluation.','state',{...hit,packets:hit.packets+1},true);
  }
  add('session','info','No existing session. The firewall must set up a new flow.','Five-tuple lookup: MISS');
  const from=zoneOf(p.src);
  const preZone=routeTo(p.dst,c);
  add('forwarding','info',`Initial forwarding lookup resolves the destination toward ${preZone?.toUpperCase()??'an unknown egress'}.`,`Pre-NAT destination ${p.dst} · ingress zone ${from}`);
  nat=c.nat.find(r=>r.enabled&&r.from===from && (r.original==='any'||r.original===(r.type==='dnat'?p.dst:p.src)) && (r.port===null||r.port===p.dport));
  if(nat){
    translated={...translated,[nat.type==='dnat'?'dst':'src']:nat.translated};
    add('nat','pass',`${nat.type.toUpperCase()} selected: ${nat.name}. Translation is recorded for forwarding.`,`Original ${fmt(p.src,p.sport,p.dst,p.dport)} → planned ${fmt(translated.src,translated.sport,translated.dst,translated.dport)}`);
  }else add('nat','info','No enabled NAT policy matches. The original addresses remain unchanged.','First-match ordered NAT policy; no match');
  // The classroom's public VIP exists only as a DNAT publication, not as a local service.
  if(p.dst==='198.51.100.20'&&!nat){
    add('forwarding','drop','The classroom VIP has no enabled DNAT mapping. No backend is associated with this public service.','198.51.100.20:443 → no published destination');
    return result('deny','Published VIP has no matching destination NAT; server is unreachable.','route');
  }
  const to=routeTo(translated.dst,c);
  if(!to){add('forwarding','drop','The destination after DNAT is in the DMZ subnet but the route is missing.','No route to 10.20.20.0/24');return result('deny','Forwarding failure: no route to translated destination.','route');}
  zones={from,to};
  add('forwarding','pass',`Final forwarding zone is ${to.toUpperCase()} based on the destination after NAT selection.`,`Policy zones ${from} → ${to}; policy destination address remains ${p.dst} (pre-NAT)`);
  add('security','info','Provisional policy candidate lookup uses source zone, post-NAT destination zone, and original destination IP. Final application-specific enforcement follows classification.',`Zones ${from} → ${to} · original destination ${p.dst}`);
  add('appid','pass',`Synthetic handshake/signature classifies ${p.app}. Real App-ID can evolve during the session and cause policy re-evaluation.`,`App-ID = ${p.app} · service ${p.proto.toUpperCase()}/${p.dport}`);
  matchedRule=c.security.find(r=>ruleMatches(r,p,from,to));
  const verdict:Verdict=matchedRule?.action??(from===to?'allow':'deny');
  const ruleName=matchedRule?.name??(from===to?'intrazone-default':'interzone-default');
  if(verdict==='deny'){
    add('security','drop',`Application-aware security rule ${ruleName} denies the session. First matching rule wins.`,`From ${from} → ${to}, destination ${p.dst} (pre-NAT), App-ID ${p.app}, port ${p.dport}`);
    steps[steps.length-1].phase='Application identification';
    return result('deny',`${ruleName}: policy denied this new session.`,'policy');
  }
  add('security','pass',`Application-aware policy re-evaluation permits the session via ${ruleName}.`,`Rule application ${matchedRule?.app??'default'} · service ${matchedRule?.service??'default'} · destination ${p.dst}`);
  steps[steps.length-1].phase='Application identification';
  if(p.threat){
    if(c.decrypt && c.threatPrevention && (matchedRule?.profile??false)){
      add('content','drop','Simulated TLS decryption exposes a known threat signature; the attached prevention profile blocks the content.','Synthetic threat signature: LAB-TEST-001 · action reset/drop');
      return result('deny','Threat Prevention blocked a synthetic signature after simulated decryption.','profile');
    }
    add('content','info',`Threat signature not visible: ${!c.decrypt?'TLS decryption disabled':!c.threatPrevention?'global threat inspection disabled':'no security profile attached to matching rule'}.`,`Encrypted payload cannot be inspected by this simple classroom model.`);
  } else add('content','pass',c.decrypt&&p.app==='ssl'?'Decrypted payload checked; no synthetic threat signature found.':'No detected threat; inspection visibility depends on profile and decryption configuration.',`Profile attached: ${Boolean(matchedRule?.profile)} · decryption: ${c.decrypt}`);
  add('egress','pass','Session installed and allowed packet transmitted (visual simulation only).',`Egress zone ${to} · ${fmt(translated.src,translated.sport,translated.dst,translated.dport)}`);
  const session:Session={id:Math.max(0,...sessions.map(s=>s.id))+1,original:copyTuple(p),translated,zones,application:p.app,rule:ruleName,packets:1};
  return result('allow',`${ruleName} allowed this flow${nat?` with ${nat.type.toUpperCase()}`:''}.`,'forwarding',session);
}
/** A scenario is complete only when the expected causal stage is reached. */
export function isResolved(caseId:string,c:LabConfig,e:Evaluation):boolean {
  if(caseId==='profile')return e.verdict==='deny'&&e.actionSource==='profile';
  if(caseId==='route')return e.verdict==='allow'&&c.dmzRoute;
  return e.verdict==='allow'&&e.actionSource==='forwarding';
}
