/** Deterministic teaching model. No network I/O; not a PAN-OS implementation.
 * One synthetic client/server flow per scenario; simulations deliberately abstract TCP details. */
export type Zone = 'trust'|'untrust'|'dmz';
export type TcpAction = 'SYN'|'SYN_ACK'|'ACK'|'APP_SIGNATURE'|'DATA'|'THREAT'|'FIN'|'RST';
export type TcpState = 'SYN_SENT'|'SYN_RECEIVED'|'ESTABLISHED'|'FIN_WAIT';
export type App = 'incomplete'|'ssl'|'ssh'|'web-browsing';
export type Verdict = 'allow'|'deny';
export type Stage = 'Ingress'|'Session lookup'|'NAT'|'Routing'|'Security policy'|'App-ID'|'Content inspection'|'Egress';
export interface Trace {stage:Stage; status:'pass'|'deny'|'info'; detail:string; evidence:string}
export interface Flow {id:string; name:string; source:string; destination:string; sourcePort:number; destinationPort:number; zone:Zone; expectedApp:Exclude<App,'incomplete'>}
export interface Interface {name:string;zone:Zone;vr:string;address:string}
export interface Route {id:string;prefix:string;via:string;iface:string;vr:string;enabled:boolean}
export interface NatRule {id:string;name:string;kind:'dnat'|'snat';zone:Zone;original:string;translated:string;port:number|null;enabled:boolean}
export interface Policy {id:string;name:string;from:Zone|'any';to:Zone|'any';destination:string;app:App|'any';port:number|null;action:Verdict;profile:boolean;enabled:boolean}
export interface Config {vr:string;routes:Route[];interfaces:Interface[];nat:NatRule[];policies:Policy[];decrypt:boolean;prevention:boolean;timeout:number}
export interface Session {id:number;flowId:string;state:TcpState;app:App;client:string;serverOriginal:string;serverTranslated:string;clientTranslated:string;sourcePort:number;destinationPort:number;from:Zone;to:Zone;rule:string;lastSeen:number;packets:number}
export interface Log {time:number;flowId:string;action:string;verdict:Verdict;detail:string}
export interface LabState {config:Config;sessions:Session[];logs:Log[];time:number;nextId:number}
export interface PacketResult {state:LabState;verdict:Verdict;reason:string;trace:Trace[];original:string;translated:string;flowId:string;action:TcpAction}
export const FLOWS:Flow[]=[
 {id:'outbound',name:'Trust → Internet HTTPS',source:'10.10.10.15',destination:'203.0.113.80',sourcePort:53000,destinationPort:443,zone:'trust',expectedApp:'ssl'},
 {id:'inbound',name:'Internet → published DMZ web',source:'192.0.2.25',destination:'198.51.100.20',sourcePort:51200,destinationPort:443,zone:'untrust',expectedApp:'ssl'},
 {id:'ssh',name:'Untrusted SSH → DMZ',source:'192.0.2.25',destination:'10.20.20.10',sourcePort:51201,destinationPort:22,zone:'untrust',expectedApp:'ssh'},
 {id:'web',name:'Trust → HTTP on TCP/80',source:'10.10.10.15',destination:'203.0.113.81',sourcePort:53002,destinationPort:80,zone:'trust',expectedApp:'web-browsing'},
];
export function defaultConfig():Config{return {
 vr:'default',timeout:30,decrypt:false,prevention:true,
 interfaces:[{name:'ethernet1/1',zone:'trust',vr:'default',address:'10.10.10.1/24'}, {name:'ethernet1/2',zone:'untrust',vr:'default',address:'198.51.100.5/24'}, {name:'ethernet1/3',zone:'dmz',vr:'default',address:'10.20.20.1/24'}],
 routes:[{id:'trust',prefix:'10.10.10.0/24',via:'connected',iface:'ethernet1/1',vr:'default',enabled:true},{id:'dmz',prefix:'10.20.20.0/24',via:'connected',iface:'ethernet1/3',vr:'default',enabled:true},{id:'default',prefix:'0.0.0.0/0',via:'198.51.100.1',iface:'ethernet1/2',vr:'default',enabled:true}],
 nat:[{id:'publish',name:'Publish HTTPS VIP',kind:'dnat',zone:'untrust',original:'198.51.100.20',translated:'10.20.20.10',port:443,enabled:true},{id:'source',name:'Outbound dynamic SNAT (fixed IP model)',kind:'snat',zone:'trust',original:'10.10.10.15',translated:'198.51.100.5',port:null,enabled:true}],
 policies:[{id:'block-ssh',name:'Block external SSH',from:'untrust',to:'dmz',destination:'any',app:'ssh',port:22,action:'deny',profile:false,enabled:true},{id:'publish-https',name:'Allow published HTTPS',from:'untrust',to:'dmz',destination:'198.51.100.20',app:'any',port:443,action:'allow',profile:true,enabled:true},{id:'trust-web',name:'Allow trust web traffic',from:'trust',to:'untrust',destination:'any',app:'any',port:null,action:'allow',profile:true,enabled:true}]
};}
export function initialState(config:Config=defaultConfig()):LabState{return {config,sessions:[],logs:[],time:0,nextId:1};}
function ipNumber(ip:string):number|null{const p=ip.split('.').map(Number);return p.length===4&&p.every(n=>Number.isInteger(n)&&n>=0&&n<=255)?(((p[0]*2**24)+(p[1]<<16)+(p[2]<<8)+p[3])>>>0):null;}
export function matchesCidr(ip:string,cidr:string):boolean{const [prefix,rawBits]=cidr.split('/');const bits=rawBits===undefined?32:Number(rawBits);const a=ipNumber(ip),b=ipNumber(prefix);if(a===null||b===null||!Number.isInteger(bits)||bits<0||bits>32)return false;const mask=bits===0?0:(0xffffffff << (32-bits))>>>0;return ((a&mask)>>>0)===((b&mask)>>>0);}
export function routeLookup(dst:string,c:Config):Route|undefined{return c.routes.filter(r=>r.enabled&&r.vr===c.vr&&matchesCidr(dst,r.prefix)).sort((a,b)=>Number(b.prefix.split('/')[1])-Number(a.prefix.split('/')[1]))[0];}
function ruleMatch(rule:Policy,flow:Flow,to:Zone,app:App){return rule.enabled&&(rule.from==='any'||rule.from===flow.zone)&&(rule.to==='any'||rule.to===to)&&(rule.destination==='any'||rule.destination===flow.destination)&&(rule.app==='any'||rule.app===app)&&(rule.port===null||rule.port===flow.destinationPort);}
export function policyLookup(flow:Flow,to:Zone,app:App,c:Config):Policy|undefined{return c.policies.find(r=>ruleMatch(r,flow,to,app));}
export function natLookup(flow:Flow,kind:NatRule['kind'],c:Config):NatRule|undefined{return c.nat.find(r=>r.enabled&&r.kind===kind&&r.zone===flow.zone&&(r.original==='any'||r.original===(kind==='dnat'?flow.destination:flow.source))&&(r.port===null||r.port===flow.destinationPort));}
function tuple(source:string,sport:number,dest:string,dport:number){return `${source}:${sport} → ${dest}:${dport}`;}
export function applyPacket(old:LabState,flowId:string,action:TcpAction):PacketResult{
 const flow=FLOWS.find(f=>f.id===flowId)??FLOWS[0];const trace:Trace[]=[];
 const add=(stage:Stage,status:Trace['status'],detail:string,evidence:string)=>trace.push({stage,status,detail,evidence});
 let state:LabState={...old,sessions:old.sessions.map(s=>({...s})),logs:[...old.logs]};
 let session=state.sessions.find(s=>s.flowId===flow.id);
 // SYN-ACK is a server-to-client packet. Show its wire ingress tuple before undoing NAT.
 const original=action==='SYN_ACK'&&session
  ?tuple(session.serverTranslated,flow.destinationPort,session.clientTranslated,flow.sourcePort)
  :tuple(flow.source,flow.sourcePort,flow.destination,flow.destinationPort);
 let translated=session?tuple(session.clientTranslated,flow.sourcePort,session.serverTranslated,flow.destinationPort):original;
 let verdict:Verdict='deny';let reason='';
 const finish=():PacketResult=>{state.logs=[{time:state.time,flowId:flow.id,action,verdict,detail:reason},...state.logs].slice(0,100);return {state,verdict,reason,trace,original,translated,flowId:flow.id,action};};
 add('Ingress','pass',`Synthetic ${action.replace('_','-')} received on ${action==='SYN_ACK'&&session?session.to:flow.zone} interface.`,original);
 add('Session lookup',session?'pass':'info',session?`Session #${session.id} in ${session.state}; ${session.packets} prior packets.`:'Five-tuple does not match any active session.',session?`id=${session.id}, last-seen=${session.lastSeen}s`:'SESSION MISS');
 if(action==='SYN'){
  if(session){reason=`Existing session #${session.id}; new SYN requires clearing or closing the flow.`;add('Session lookup','deny',reason,'Duplicate SYN in simplified state machine');return finish();}
  const dnat=natLookup(flow,'dnat',state.config);
  const dst=dnat?.translated??flow.destination;
  add('NAT',dnat?'pass':'info',dnat?`First matching DNAT: ${dnat.name}.`:'No destination NAT matched.',`${flow.destination} → ${dst}`);
  if(flow.destination==='198.51.100.20'&&!dnat){reason='Public VIP has no DNAT translation.';add('NAT','deny',reason,'Unpublished VIP');return finish();}
  const route=routeLookup(dst,state.config);
  const iface=state.config.interfaces.find(i=>i.name===route?.iface&&i.vr===state.config.vr);
  if(!route||!iface){reason=`No valid route/interface in VR ${state.config.vr} for ${dst}.`;add('Routing','deny',reason,'LPM / virtual-router lookup failed');return finish();}
  if(dst.startsWith('10.20.20.') && iface.zone!=='dmz'){reason=`No valid DMZ route: ${dst} would follow ${route.prefix} via ${iface.zone}; expected DMZ interface.`;add('Routing','deny',reason,`Selected fallback ${route.prefix} / ${route.iface} · missing specific DMZ route`);return finish();}
  add('Routing','pass',`Longest-prefix match ${route.prefix} via ${route.iface} (${iface.zone}).`,`VR ${state.config.vr} · next hop ${route.via}`);
  const snat=natLookup(flow,'snat',state.config);const source=snat?.translated??flow.source;
  if(snat)add('NAT','pass',`Egress source translation: ${snat.name}.`,`${flow.source} → ${source}`);
  translated=tuple(source,flow.sourcePort,dst,flow.destinationPort);
  const rule=policyLookup(flow,iface.zone,'incomplete',state.config);
  // Approximation: provisional policy uses incomplete app; App-ID rechecks after payload.
  if(!rule||rule.action==='deny'){
   reason=rule?`Denied by ${rule.name}.`:`Interzone default deny (${flow.zone} → ${iface.zone}); no provisional allow rule.`;
   add('Security policy','deny',reason,`Original destination ${flow.destination} · post-DNAT zone ${iface.zone}`);return finish();
  }
  add('Security policy','pass',`Initial incomplete-app decision permitted by ${rule.name}.`,`Original dst ${flow.destination} / post-DNAT zone ${iface.zone}`);
  add('App-ID','info','Handshake has not identified application yet; provisional incomplete stage.','App-ID: incomplete');
  session={id:state.nextId++,flowId:flow.id,state:'SYN_SENT',app:'incomplete',client:flow.source,serverOriginal:flow.destination,serverTranslated:dst,clientTranslated:source,sourcePort:flow.sourcePort,destinationPort:flow.destinationPort,from:flow.zone,to:iface.zone,rule:rule.name,lastSeen:state.time,packets:1};
  state.sessions.push(session);verdict='allow';reason=`SYN forwarded; session #${session.id} created (SYN_SENT).`;
  add('Egress','pass',reason,translated);return finish();
 }
 if(!session){reason=`Out-of-state ${action}; no matching TCP session.`;add('Session lookup','deny',reason,'Stateful firewall: missing session');return finish();}
 if(action==='SYN_ACK'){
  if(session.state!=='SYN_SENT'){reason=`SYN-ACK unexpected in ${session.state}.`;add('Session lookup','deny',reason,'Expected SYN_SENT');return finish();}
  session.state='SYN_RECEIVED';verdict='allow';reason='Reverse SYN-ACK matched the translated state; awaiting client ACK.';
  translated=tuple(session.serverOriginal,flow.destinationPort,session.client,flow.sourcePort);
  add('NAT','pass','Return path uses reverse mapping stored in the session.','No inbound security rule created for reply');
 }else if(action==='ACK'){
  if(session.state!=='SYN_RECEIVED'){reason=`ACK unexpected in ${session.state}.`;add('Session lookup','deny',reason,'Expected SYN_RECEIVED');return finish();}
  session.state='ESTABLISHED';verdict='allow';reason='Three-way handshake complete; ESTABLISHED.';
 }else if(action==='APP_SIGNATURE'){
  if(session.state!=='ESTABLISHED'){reason=`Application data rejected before ESTABLISHED (actual ${session.state}).`;add('Session lookup','deny',reason,'Complete SYN/SYN-ACK/ACK first');return finish();}
  session.app=flow.expectedApp;
  add('App-ID','pass',`Synthetic ${session.app==='ssl'?'TLS ClientHello':session.app==='ssh'?'SSH banner':'HTTP request'} identified ${session.app}.`,`APP_SIGNATURE → ${session.app}; protocol payload modeled, not decoded`);
  const rule=policyLookup(flow,session.to,session.app,state.config);
  if(!rule||rule.action==='deny'){
   verdict='deny';reason=rule?`App-ID re-evaluation denied by ${rule.name}.`:'No rule permits application after App-ID re-evaluation.';
   add('Security policy','deny',reason,`App ${session.app}, original destination ${session.serverOriginal}`);
   state.sessions=state.sessions.filter(s=>s.id!==session!.id);return finish();
  }
  session.rule=rule.name;verdict='allow';reason=`App-ID re-evaluation allowed ${session.app} via ${rule.name}.`;
  add('Security policy','pass',reason,`Rule ${rule.name} · application ${session.app}`);
 }else if(action==='DATA'||action==='THREAT'){
  if(session.state!=='ESTABLISHED'){reason=`Payload rejected: session ${session.state}.`;add('Session lookup','deny',reason,'Expected ESTABLISHED');return finish();}
  if(session.app==='incomplete'){reason='Classify application before inspecting content.';add('App-ID','deny',reason,'Send application signature first');return finish();}
  const rule=state.config.policies.find(r=>r.name===session!.rule);
  if(action==='THREAT'&&state.config.decrypt&&state.config.prevention&&rule?.profile){
   verdict='deny';reason='Synthetic LAB-TEST-001 signature blocked by threat profile.';
   add('Content inspection','deny',reason,'TLS visibility: enabled; profile: attached; threat prevention: enabled');
   state.sessions=state.sessions.filter(s=>s.id!==session!.id);return finish();
  }
  add('Content inspection','info',action==='THREAT'?'Simulated signature was NOT blocked. Inspect decryption, profile attachment, and prevention settings.':'Benign synthetic payload accepted.',`Decrypt ${state.config.decrypt} · profile ${Boolean(rule?.profile)} · prevention ${state.config.prevention}`);
  verdict='allow';reason='Payload forwarded using established session.';
 }else if(action==='FIN'){
  if(session.state!=='ESTABLISHED'){reason=`FIN unexpected in ${session.state}.`;add('Session lookup','deny',reason,'Expected ESTABLISHED');return finish();}
  session.state='FIN_WAIT';verdict='allow';reason='FIN initiated close (FIN_WAIT).';
 }else if(action==='RST'){
  verdict='allow';reason='RST closed the existing session.';
  state.sessions=state.sessions.filter(s=>s.id!==session!.id);
 }
 if(verdict==='allow'){
  if(state.sessions.some(s=>s.id===session!.id)){session.lastSeen=state.time;session.packets++;}
  add('Egress','pass',reason,translated);
 }
 return finish();
}
export function advanceTime(old:LabState,seconds:number):LabState{
 const time=old.time+seconds;const active=old.sessions.filter(s=>time-s.lastSeen<old.config.timeout);
 const expired=old.sessions.filter(s=>!active.includes(s));
 return {...old,time,sessions:active.map(s=>({...s})),logs:[...expired.map(s=>({time,flowId:s.flowId,action:'TIMEOUT',verdict:'deny' as Verdict,detail:`Session #${s.id} expired after ${time-s.lastSeen}s inactivity.`})),...old.logs].slice(0,100)};
}
export function configure(state:LabState,config:Config):LabState{return {...state,config,sessions:[],logs:[{time:state.time,flowId:'system',action:'COMMIT',verdict:'allow',detail:'Configuration changed; classroom sessions cleared for deterministic results.'},...state.logs]};}
export function troubleshootingConfig(id:string):Config{
 const c=defaultConfig();
 if(id==='nat')c.nat=c.nat.map(n=>n.id==='publish'?{...n,enabled:false}:n);
 if(id==='route')c.routes=c.routes.map(r=>r.id==='dmz'?{...r,enabled:false}:r);
 if(id==='shadow')c.policies.unshift({id:'shadow',name:'Broad deny (shadow)',from:'trust',to:'untrust',destination:'any',app:'any',port:null,action:'deny',profile:false,enabled:true});
 if(id==='appid')c.policies.unshift({id:'deny-ssl',name:'Unexpected SSL deny',from:'trust',to:'untrust',destination:'any',app:'ssl',port:443,action:'deny',profile:false,enabled:true});
 return c;
}
export const FAULTS=[
 {id:'nat',label:'VIP is unreachable',flow:'inbound',hint:'DNAT must map the public VIP to 10.20.20.10; inspect NAT rule state.',stage:'NAT'},
 {id:'route',label:'DMZ route missing',flow:'inbound',hint:'The route to 10.20.20.0/24 must be enabled and bound to the DMZ interface.',stage:'Routing'},
 {id:'shadow',label:'Broad policy deny',flow:'outbound',hint:'Rulebase is first-match. Move or disable the broad deny above the allow rule.',stage:'Security policy'},
 {id:'appid',label:'Handshake succeeds, app blocked',flow:'outbound',hint:'After TLS ClientHello, the App-ID changes from incomplete to ssl and policy is re-evaluated.',stage:'App-ID'},
] as const;
export function checkFault(id:string,c:Config):boolean{
 let s=initialState(c);const flow=id==='nat'||id==='route'?'inbound':'outbound';
 for(const a of ['SYN','SYN_ACK','ACK','APP_SIGNATURE'] as const){const e=applyPacket(s,flow,a);if(e.verdict!=='allow')return false;s=e.state;}
 return true;
}
