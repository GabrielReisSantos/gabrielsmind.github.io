/** CyberLab v2.9 Enterprise Systems Explorer.
 * Pure, deterministic browser training projections on the existing shared enterprise,
 * physical topology and native NGFW engines. Never emits real traffic.
 */
import {enterprisePaths,type EnterpriseState} from '../enterprise/engine';
import {forwardNative,isolateGuest,type NativeEnterprise} from '../enterprise/nativeEngine';
import {simulate} from '../threeD/topologyEngine';
import {evaluate as evaluateNgfw,type Traffic} from '../ngfw/engine';
export type ProbeId='identity'|'business'|'guest'|'attack';
export type NodeId='ws01'|'dc01'|'fw'|'app01'|'guest';
export type Severity='info'|'success'|'warning'|'critical';
export type TimelineEntry={id:string;seq:number;kind:'change'|'probe'|'verification';source:string;node:NodeId;severity:Severity;title:string;detail:string;result:'pass'|'fail'|'risk'|'notice';config:string;path:string[]};
export type Assessment={config:string;passed:boolean;items:{id:string;label:string;ok:boolean;detail:string}[]};
export type ExplorerLocal={version:1;seq:number;guided:boolean;monitoring:boolean;sessionActive:boolean;timeline:TimelineEntry[];pinned:string[];assessment:Assessment|null};
export type ExplorerSnapshot={revision:string;helpdeskReset:boolean;business:boolean;guestExposed:boolean;guestTopologyOpen:boolean;guestFirewallOpen:boolean;monitoring:boolean;sessionActive:boolean;businessReason:string;businessPath:string[];guestReason:string;guestFirewallReason:string;guestPath:string[];riskCount:number};
export const GUEST_HTTPS:Traffic={id:'explorer-guest-https',label:'Guest reports HTTPS',summary:'Synthetic guest access attempt to reports application',src:'10.30.10.25',dst:'10.20.10.20',sport:53443,dport:443,proto:'tcp',app:'ssl',flag:'SYN'};
export const EXPLORER_STORAGE='cyberlab-enterprise-explorer-v29';
export function initialExplorer():ExplorerLocal{return {version:1,seq:0,guided:true,monitoring:true,sessionActive:false,timeline:[],pinned:[],assessment:null};}
export function restoreExplorer(raw:unknown):ExplorerLocal{
 const fallback=initialExplorer();if(!raw||typeof raw!=='object'||Array.isArray(raw))return fallback;
 try{if(JSON.stringify(raw).length>100000)return fallback;}catch{return fallback;}
 const v=raw as Partial<ExplorerLocal>;
 if(v.version!==1||!Number.isSafeInteger(v.seq)||typeof v.seq!=='number'||v.seq<0||typeof v.guided!=='boolean'||typeof v.monitoring!=='boolean'||typeof v.sessionActive!=='boolean'||!Array.isArray(v.timeline)||v.timeline.length>70||!Array.isArray(v.pinned)||v.pinned.length>70)return fallback;
 const validNodes:NodeId[]=['ws01','dc01','fw','app01','guest'];
 const validSeverities:Severity[]=['info','success','warning','critical'];
 if(!v.timeline.every(t=>t&&typeof t.id==='string'&&/^EV-[0-9]+$/.test(t.id)&&Number.isSafeInteger(t.seq)&&t.seq>=1&&t.seq<=v.seq!&&['change','probe','verification'].includes(t.kind)&&typeof t.source==='string'&&t.source.length<70&&validNodes.includes(t.node)&&validSeverities.includes(t.severity)&&typeof t.title==='string'&&t.title.length<160&&typeof t.detail==='string'&&t.detail.length<1200&&['pass','fail','risk','notice'].includes(t.result)&&typeof t.config==='string'&&t.config.length<110&&Array.isArray(t.path)&&t.path.length<15&&t.path.every(p=>typeof p==='string'&&p.length<35)))return fallback;
 if(!v.pinned.every(id=>typeof id==='string'&&v.timeline!.some(t=>t.id===id)))return fallback;
 const assessment=v.assessment;
 if(assessment!==null&&assessment!==undefined&&(!assessment||typeof assessment.config!=='string'||typeof assessment.passed!=='boolean'||!Array.isArray(assessment.items)||assessment.items.length!==6||!assessment.items.every(i=>i&&typeof i.id==='string'&&typeof i.label==='string'&&typeof i.ok==='boolean'&&typeof i.detail==='string')))return fallback;
 return {...fallback,seq:v.seq,guided:v.guided,monitoring:v.monitoring,sessionActive:v.sessionActive,timeline:v.timeline.map(t=>({...t,path:[...t.path]})),pinned:[...v.pinned],assessment:assessment?{...assessment,items:assessment.items.map(i=>({...i}))}:null};
}
export function inspectSystems(e:EnterpriseState,n:NativeEnterprise,local:ExplorerLocal):ExplorerSnapshot{
 const network=forwardNative(n);
 const guest=simulate(n.topology,{source:'guest',destination:'app01',protocol:'tcp',port:443});
 const guestFirewall=evaluateNgfw(GUEST_HTTPS,n.firewall,[]);
 const business=network.allowed&&e.wsToApp443;
 const guestTopologyOpen=!isolateGuest(n),guestFirewallOpen=guestFirewall.verdict==='allow';
 const guestExposed=guestTopologyOpen&&guestFirewallOpen;
 const riskCount=Number(e.helpdeskReset)+Number(!business)+Number(guestTopologyOpen||guestFirewallOpen)+Number(!local.monitoring)+Number(local.sessionActive);
 return {revision:`E${e.revision} · N${n.revision} · M${Number(local.monitoring)} · S${Number(local.sessionActive)}`,
  helpdeskReset:enterprisePaths(e).canResetServiceAccount,business,guestExposed,guestTopologyOpen,guestFirewallOpen,monitoring:local.monitoring,sessionActive:local.sessionActive,
  businessReason:network.reason,businessPath:network.path,guestReason:guest.reason,guestFirewallReason:guestFirewall.reason,guestPath:guest.path,riskCount};
}
export function eventSignature(s:ExplorerSnapshot):string{return s.revision;}
export function pushEvent(state:ExplorerLocal,item:Omit<TimelineEntry,'id'|'seq'>):ExplorerLocal{
 const seq=state.seq+1,id=`EV-${String(seq).padStart(4,'0')}`;
 const timeline=[...state.timeline,{...item,id,seq}].slice(-65);
 return {...state,seq,timeline,pinned:state.pinned.filter(k=>timeline.some(t=>t.id===k)),assessment:null};
}
export function noteChange(state:ExplorerLocal,s:ExplorerSnapshot,node:NodeId,title:string,detail:string,severity:Severity='warning'):ExplorerLocal{
 return pushEvent(state,{kind:'change',node,source:'Configuration audit',severity,title,detail,result:'notice',config:eventSignature(s),path:[]});
}
export function runProbe(state:ExplorerLocal,s:ExplorerSnapshot,probe:ProbeId):ExplorerLocal{
 let next=state;let item:Omit<TimelineEntry,'id'|'seq'>;
 const base={kind:'probe' as const,config:eventSignature(s)};
 switch(probe){
 case 'identity':item={...base,source:'Windows Security · 4724',node:'dc01',severity:s.helpdeskReset?'critical':'success',title:s.helpdeskReset?'Unauthorized reset permission confirmed':'Reset delegation denied',detail:s.helpdeskReset?'Helpdesk operator can reset svc-reports. Windows event 4724 modeled; the delegated right violates least privilege.':'Directory ACL denies a helpdesk reset of svc-reports; no credential change occurs.',result:s.helpdeskReset?'risk':'pass',path:['ws01','dc01']};break;
 case 'business':item={...base,source:'Network session / NGFW',node:'fw',severity:s.business?'success':'warning',title:s.business?'Approved HTTPS flow delivered':'Business flow interrupted',detail:s.business?'WS01 → APP01 TCP/443 succeeds through the native physical path and ordered NGFW rule.':`WS01 → APP01 TCP/443 fails. Native forwarding diagnosis: ${s.businessReason}`,result:s.business?'pass':'fail',path:s.businessPath};break;
 case 'guest':{
  const weak=s.guestTopologyOpen||s.guestFirewallOpen;
  item={...base,source:'Topology trace + NGFW policy',node:'guest',severity:s.guestExposed?'critical':weak?'warning':'success',title:s.guestExposed?'Guest reaches DMZ through two misconfigured layers':weak?'Guest defense-in-depth weakened':'Guest isolated by both control layers',detail:`Topology: ${s.guestTopologyOpen?'ALLOW':'DENY'} (${s.guestReason}). Native NGFW: ${s.guestFirewallOpen?'ALLOW':'DENY'} (${s.guestFirewallReason}). ${s.guestExposed?'Both layers permit the synthetic session.':weak?'One layer still blocks access; correct both to restore defense-in-depth.':'Both independent layers block the session.'}`,result:s.guestExposed?'risk':weak?'fail':'pass',path:s.guestPath};break;
 }
 case 'attack':{
  const reached=s.helpdeskReset&&s.business;
  if(reached)next={...next,sessionActive:true};
  const status={...s,sessionActive:next.sessionActive};
  item={...base,config:eventSignature(status),source:'Correlated identity + network',node:'app01',severity:reached?'critical':'success',title:reached?'Simulated unauthorized application session':'Attack replay prevented',detail:reached?'An overprivileged password reset followed by permitted HTTPS results in an active unauthorized reports session. Changing the ACL later will not terminate an existing session.':'Identity or network controls prevent a new unauthorized session. Existing sessions, if any, require separate revocation.',result:reached?'risk':'pass',path:reached?['ws01','dc01','fw','app01']:['ws01','dc01']};break;
 }
 }
 // Monitoring is a real training control: sensor outage suppresses event ingestion,
 // with a single observable diagnostic rather than pretending telemetry was collected.
 if(!state.monitoring){item={...item,source:'Local probe · sensor offline',severity:'warning',title:`Sensor blind spot: ${item.title}`,detail:`The probe ran, but monitoring was disabled; no SOC event was collected. ${item.detail}`};}
 return pushEvent(next,item);
}
export function collectEvidence(state:ExplorerLocal,id:string):ExplorerLocal{
 if(!state.timeline.some(e=>e.id===id))return state;
 return {...state,pinned:state.pinned.includes(id)?state.pinned.filter(k=>k!==id):[...state.pinned,id].slice(-30),assessment:null};
}
export function assess(state:ExplorerLocal,s:ExplorerSnapshot):ExplorerLocal{
 const signature=eventSignature(s);
 const probes=['identity','business','guest'] as const;
 const last=probes.map(p=>state.timeline.filter(e=>e.kind==='probe'&&e.config===signature&&(
  p==='identity'?e.source.includes('4724')||e.title.includes('Reset delegation'):
  p==='business'?e.title.includes('HTTPS flow')||e.title.includes('Business flow'):
  e.title.includes('Guest'))).at(-1));
 const evidence=state.pinned.some(id=>state.timeline.some(t=>t.id===id&&t.kind==='probe'&&!t.source.includes('sensor offline')&&(t.result==='risk'||t.result==='fail')));
 const items=[
  {id:'identity',label:'Least-privilege directory ACL',ok:!s.helpdeskReset,detail:'svc-reports reset delegation removed from helpdesk'},
  {id:'business',label:'Approved reporting connectivity',ok:s.business,detail:s.businessReason},
  {id:'guest',label:'Guest segmentation: topology + NGFW deny',ok:!s.guestTopologyOpen&&!s.guestFirewallOpen,detail:`Topology: ${s.guestReason}; NGFW: ${s.guestFirewallReason}`},
  {id:'monitoring',label:'SOC monitoring online',ok:s.monitoring,detail:'Audit pipeline is accepting synthetic telemetry'},
  {id:'session',label:'Unauthorized session revoked',ok:!s.sessionActive,detail:'No active attacker application session'},
  {id:'evidence',label:'Recent independent probes + pinned evidence',ok:last.every(Boolean)&&evidence&&s.monitoring,detail:'Current revision: identity, business and guest tests, plus a pinned investigation record'},
 ];
 const assessment={config:signature,passed:items.every(i=>i.ok),items};
 return {...state,assessment};
}
export function assessmentCurrent(s:ExplorerLocal,view:ExplorerSnapshot):Assessment|null{return s.assessment?.config===eventSignature(view)?s.assessment:null;}
export function exportExplorer(state:ExplorerLocal,s:ExplorerSnapshot):string{
 const assessment=assessmentCurrent(state,s);
 return `# CyberLab Enterprise Systems Explorer — Local case record\n\n**Synthetic educational simulation. No real packet execution or proof of production security.**\n\nConfiguration: ${s.revision}\n\n## Current posture\n- Helpdesk reset delegation: ${s.helpdeskReset?'EXPOSED':'RESTRICTED'}\n- Approved HTTPS service: ${s.business?'AVAILABLE':'UNAVAILABLE'}\n- Guest end-to-end access: ${s.guestExposed?'REACHABLE':'BLOCKED'}
- Guest topology policy: ${s.guestTopologyOpen?'ALLOW':'DENY'}
- Guest NGFW policy: ${s.guestFirewallOpen?'ALLOW':'DENY'}\n- Monitoring: ${s.monitoring?'ENABLED':'DISABLED'}\n- Unauthorized session: ${s.sessionActive?'ACTIVE':'NONE'}\n\n## Assessment\n${assessment?assessment.items.map(i=>`- [${i.ok?'x':' '}] ${i.label}: ${i.detail}`).join('\n'):'Not verified against current configuration.'}\n\n## Pinned evidence\n${state.timeline.filter(t=>state.pinned.includes(t.id)).map(t=>`- ${t.id} | ${t.source} | ${t.title} | ${t.detail}`).join('\n')||'None'}\n\n## Local action timeline\n${state.timeline.map(t=>`- ${t.id} [${t.kind}] ${t.title} — ${t.detail}`).join('\n')||'No actions recorded'}\n`;
}
