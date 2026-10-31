/** CyberLab v3.0 Connected Campaign: bounded deterministic teaching simulation.
 * AD and native topology/NGFW state are imported from the same stores as Explorer.
 * Campaign-only secret, sensors, and sessions are explicitly labeled fictional.
 */
import {enterprisePaths,type EnterpriseState} from '../enterprise/engine';
import {forwardNative,isolateGuest,type NativeEnterprise} from '../enterprise/nativeEngine';
import {evaluate as evaluateNgfw} from '../ngfw/engine';
import {editRule} from '../threeD/topologyEngine';
import {GUEST_HTTPS} from '../explorer/engine';
export type MissionId='identity'|'pivot'|'secrets';
export type Probe='identity'|'service'|'guest'|'secret'|'sensor';
export type Layer='topology'|'firewall';
export type CampaignEvent={id:string;mission:MissionId;seq:number;kind:'attack'|'probe'|'change'|'report';source:string;severity:'critical'|'warning'|'success'|'info';title:string;detail:string;recorded:boolean;signature:string;observed:'exposure'|'clean'|'failure'|'context'};
export type CampaignReport={cause:string;impact:string;remediation:string;retest:string};
export type MissionAssessment={signature:string;passed:boolean;checks:{label:string;ok:boolean;detail:string}[]};
export type CampaignLocal={version:1;revision:number;selected:MissionId;guided:boolean;started:MissionId[];completed:MissionId[];seq:number;events:CampaignEvent[];pinned:string[];sessions:{identity:boolean;pivot:boolean;secrets:boolean};tokenExposed:boolean;tokenRotated:boolean;monitoring:boolean;dataCopied:boolean;reports:Record<MissionId,CampaignReport>;assessments:Partial<Record<MissionId,MissionAssessment>>};
export const CAMPAIGN_STORAGE='cyberlab-connected-campaign-v30';
export const MISSION_ORDER:MissionId[]=['identity','pivot','secrets'];
export const MISSION_INFO:Record<MissionId,{number:string;name:string;eyebrow:string;brief:string;objective:string;rootCause:string;hint:string;attack:string;negative:string}>= {
 identity:{number:'01',name:'Identity breach',eyebrow:'AD · SECURITY LOGS · INCIDENT RESPONSE',brief:'An overprivileged helpdesk operator can reset a service account and create an unauthorized reports session.',objective:'Trace the privilege abuse, remove excessive delegation, terminate the live session, and keep approved HTTPS working.',rootCause:'ad-delegation',hint:'Windows 4724 is a password-reset indicator. A revoked ACL cannot retroactively log out a session.',attack:'Reset svc-reports and establish an application session',negative:'Denying all HTTPS stops the attack but also breaks the reporting service.'},
 pivot:{number:'02',name:'The guest pivot',eyebrow:'VLAN · NGFW · DEFENSE IN DEPTH',brief:'An unsafe guest exception crosses two independent security boundaries and exposes the reporting application.',objective:'Identify both permissive layers, remove the path, terminate guest sessions, and preserve business traffic.',rootCause:'dual-policy',hint:'Test both topology filtering and the ordered NGFW rulebase. Fixing one is not the same as restoring both controls.',attack:'Traverse guest segment to reports application',negative:'Closing only one control layer blocks this attempt but leaves a preventable exposure.'},
 secrets:{number:'03',name:'Silent token abuse',eyebrow:'SECRETS · SENSOR HEALTH · RESPONSE',brief:'A fictional API token is exposed while security telemetry is offline. Revoking access is not the same as explaining what happened.',objective:'Establish impact, rotate the simulated token, restore the sensor, terminate sessions, and validate the authorized service.',rootCause:'token-exposure',hint:'You must address the leaked secret and the monitoring gap. Past data access is not undone by rotation.',attack:'Reuse exposed reports API token',negative:'Turning on logs cannot invalidate a stolen token, and rotating a token cannot restore missing telemetry.'}
};
const EMPTY_REPORT=():CampaignReport=>({cause:'',impact:'',remediation:'',retest:''});
export const initialCampaign=():CampaignLocal=>({version:1,revision:0,selected:'identity',guided:true,started:[],completed:[],seq:0,events:[],pinned:[],sessions:{identity:false,pivot:false,secrets:false},tokenExposed:false,tokenRotated:false,monitoring:true,dataCopied:false,reports:{identity:EMPTY_REPORT(),pivot:EMPTY_REPORT(),secrets:EMPTY_REPORT()},assessments:{}});
const safeText=(v:unknown,max=900):v is string=>typeof v==='string'&&v.length<=max;
export function restoreCampaign(raw:unknown):CampaignLocal{
 const fallback=initialCampaign();if(!raw||typeof raw!=='object'||Array.isArray(raw))return fallback;
 try{if(JSON.stringify(raw).length>125000)return fallback;}catch{return fallback;}
 const v=raw as Partial<CampaignLocal>;
 if(v.version!==1||!Number.isSafeInteger(v.revision)||v.revision!<0||!MISSION_ORDER.includes(v.selected as MissionId)||typeof v.guided!=='boolean'||!Array.isArray(v.started)||!Array.isArray(v.completed)||!Number.isSafeInteger(v.seq)||v.seq!<0||!Array.isArray(v.events)||v.events.length>85||!Array.isArray(v.pinned)||v.pinned.length>35||!v.sessions||typeof v.sessions!=='object'||['identity','pivot','secrets'].some(m=>typeof v.sessions![m as MissionId]!=='boolean')||typeof v.tokenExposed!=='boolean'||typeof v.tokenRotated!=='boolean'||typeof v.monitoring!=='boolean'||typeof v.dataCopied!=='boolean'||!v.reports||!v.assessments)return fallback;
 if(!v.started.every(m=>MISSION_ORDER.includes(m))||!v.completed.every(m=>MISSION_ORDER.includes(m))||new Set(v.completed).size!==v.completed.length)return fallback;
 if(!v.events.every(e=>e&&safeText(e.id,20)&&/^CE-\d{4,}$/.test(e.id)&&Number.isSafeInteger(e.seq)&&e.seq>=1&&e.seq<=v.seq!&&MISSION_ORDER.includes(e.mission)&&['attack','probe','change','report'].includes(e.kind)&&safeText(e.source,70)&&['critical','warning','success','info'].includes(e.severity)&&safeText(e.title,150)&&safeText(e.detail)&&typeof e.recorded==='boolean'&&safeText(e.signature,120)&&['exposure','clean','failure','context'].includes(e.observed)))return fallback;
 if(!v.pinned.every(id=>typeof id==='string'&&v.events!.some(e=>e.id===id)))return fallback;
 for(const id of MISSION_ORDER){const r=v.reports[id];if(!r||Object.values(r).length!==4||!Object.values(r).every(p=>safeText(p,1200)))return fallback;}
 const assessments:CampaignLocal['assessments']={};
 for(const id of MISSION_ORDER){const a=v.assessments[id];if(!a)continue;if(!safeText(a.signature,120)||typeof a.passed!=='boolean'||!Array.isArray(a.checks)||a.checks.length>12||!a.checks.every(c=>c&&safeText(c.label,110)&&typeof c.ok==='boolean'&&safeText(c.detail,600)))return fallback;assessments[id]={signature:a.signature,passed:a.passed,checks:a.checks.map(c=>({...c}))};}
 return {...fallback,...v,started:[...v.started],completed:[...v.completed],events:v.events.map(e=>({...e})),pinned:[...v.pinned],sessions:{...v.sessions},reports:Object.fromEntries(MISSION_ORDER.map(id=>[id,{...v.reports![id]}])) as CampaignLocal['reports'],assessments};
}
export function guestLayerOpen(n:NativeEnterprise,layer:Layer):boolean{if(layer==='topology')return !isolateGuest(n);return evaluateNgfw(GUEST_HTTPS,n.firewall,[]).verdict==='allow';}
export function setGuestLayer(n:NativeEnterprise,layer:Layer,allow:boolean):NativeEnterprise{
 if(layer==='topology'){
  if(!n.topology.rules.some(r=>r.id==='native-guest-deny'))return n;
  return {...n,revision:n.revision+1,topology:editRule(n.topology,'native-guest-deny',{enabled:true,action:allow?'allow':'deny'})};
 }
 const firewall=structuredClone(n.firewall);firewall.security=firewall.security.filter(r=>r.id!=='campaign-guest-https'&&r.id!=='explorer-guest-https');
 if(allow)firewall.security.unshift({id:'campaign-guest-https',name:'Campaign unsafe guest exception',from:'untrust',to:'dmz',destination:GUEST_HTTPS.dst,app:'ssl',service:'application-default',action:'allow',enabled:true,profile:false});
 return {...n,revision:n.revision+1,firewall};
}
export type CampaignView={signature:string;business:boolean;identityExposed:boolean;guestTopology:boolean;guestFirewall:boolean;guestReachable:boolean;sessions:CampaignLocal['sessions'];monitoring:boolean;tokenExposed:boolean;tokenValid:boolean;dataCopied:boolean;businessReason:string;connectedModules:string[]};
export function inspectCampaign(e:EnterpriseState,n:NativeEnterprise,l:CampaignLocal):CampaignView{
 const f=forwardNative(n),gT=guestLayerOpen(n,'topology'),gF=guestLayerOpen(n,'firewall');
 const tokenValid=l.tokenExposed&&!l.tokenRotated;
 return {signature:`E${e.revision}/N${n.revision}/L${l.revision}/I${Number(l.sessions.identity)}/P${Number(l.sessions.pivot)}/S${Number(l.sessions.secrets)}/T${Number(l.tokenExposed)}${Number(l.tokenRotated)}/M${Number(l.monitoring)}`,business:f.allowed&&e.wsToApp443,identityExposed:enterprisePaths(e).canResetServiceAccount,guestTopology:gT,guestFirewall:gF,guestReachable:gT&&gF,sessions:{...l.sessions},monitoring:l.monitoring,tokenExposed:l.tokenExposed,tokenValid,dataCopied:l.dataCopied,businessReason:f.reason,connectedModules:['Active Directory','Network topology','Native NGFW','SOC telemetry','Secrets lifecycle']};
}
function logEvent(l:CampaignLocal,event:Omit<CampaignEvent,'id'|'seq'>):CampaignLocal{
 const seq=l.seq+1,id=`CE-${String(seq).padStart(4,'0')}`;const events=[...l.events,{...event,id,seq}].slice(-80);
 return {...l,seq,events,pinned:l.pinned.filter(k=>events.some(e=>e.id===k)),assessments:{}};
}
export function note(l:CampaignLocal,v:CampaignView,title:string,detail:string):CampaignLocal{return logEvent(l,{mission:l.selected,kind:'change',source:'Configuration audit',severity:'info',title,detail,recorded:true,signature:v.signature,observed:'context'});}
export function seedMission(l:CampaignLocal,id:MissionId):CampaignLocal{
 if(l.completed.includes(id)||MISSION_ORDER.indexOf(id)>0&&!l.completed.includes(MISSION_ORDER[MISSION_ORDER.indexOf(id)-1]))return l;
 return {...l,revision:l.revision+1,selected:id,started:l.started.includes(id)?l.started:[...l.started,id],assessments:{}};
}
export function replayAttack(l:CampaignLocal,e:EnterpriseState,n:NativeEnterprise):CampaignLocal{
 const id=l.selected;if(!l.started.includes(id))return l;
 const view=inspectCampaign(e,n,l);
 const success=id==='identity'?view.identityExposed&&view.business:id==='pivot'?view.guestReachable:id==='secrets'?view.tokenValid&&view.business:false;
 const sessions={...l.sessions,[id]:success?true:l.sessions[id]};
 const post={...l,revision:l.revision+(success&&!l.sessions[id]?1:0),sessions,dataCopied:l.dataCopied||(id==='secrets'&&success)};
 const final=inspectCampaign(e,n,post);
 const configText=id==='identity'?'Directory ACL + native WS01/APP01 path':id==='pivot'?'Guest topology rule + NGFW ordered rulebase':'Fictional API secret + native reports path';
 const title=success?(id==='identity'?'Service-account session established':id==='pivot'?'Guest foothold established':'Token reused; simulated report data accessed'):'Replay blocked by current controls';
 return logEvent(post,{mission:id,kind:'attack',source:l.monitoring?'Correlated SOC telemetry':'Local simulator · telemetry unavailable',severity:success?'critical':'success',title,detail:`${configText}. ${success?'Unauthorized activity succeeded against the modeled controls.':'One or more modeled controls blocked this attempt.'} ${!l.monitoring?'SOC sensor is offline: this is a simulator observation, NOT an ingested SOC log.':''}`,recorded:l.monitoring,signature:final.signature,observed:success?'exposure':'clean'});
}
export function probeCampaign(l:CampaignLocal,e:EnterpriseState,n:NativeEnterprise,probe:Probe):CampaignLocal{
 const s=inspectCampaign(e,n,l);
 const mapped:{ok:boolean;title:string;detail:string;source:string}=(
  probe==='identity'?{ok:!s.identityExposed,title:'Helpdesk reset delegation',detail:s.identityExposed?'ACL permits reset of svc-reports.':'Least-privilege ACL blocks unauthorized reset.',source:'Simulated Windows Security · 4724'}:
  probe==='service'?{ok:s.business,title:'Approved HTTPS continuity',detail:s.business?'WS01 → NGFW → APP01 HTTPS reaches reports.':`Approved reports unavailable: ${s.businessReason}`,source:'Native topology + NGFW flow'}:
  probe==='guest'?{ok:!s.guestTopology&&!s.guestFirewall,title:'Guest boundary check',detail:`Topology: ${s.guestTopology?'ALLOW':'DENY'}; NGFW: ${s.guestFirewall?'ALLOW':'DENY'}. End-to-end: ${s.guestReachable?'REACHABLE':'BLOCKED'}.`,source:'Topology + NGFW independent evaluation'}:
  probe==='secret'?{ok:!s.tokenValid,title:'Service API token exposure',detail:s.tokenValid?'Fictional leaked token is still valid.':'No usable leaked API token remains.',source:'Synthetic secrets audit'}:
  {ok:s.monitoring,title:'Telemetry pipeline health',detail:s.monitoring?'Synthetic SOC sensor captures future replay events.':'Sensor unavailable. Probe output is local only; no SOC event is collected.',source:'Local sensor diagnostic'});
 return logEvent(l,{mission:l.selected,kind:'probe',source:s.monitoring?mapped.source:'Local diagnostic · sensor offline',severity:mapped.ok?'success':'warning',title:mapped.title,detail:mapped.detail,recorded:probe==='sensor'||s.monitoring,signature:s.signature,observed:mapped.ok?'clean':'failure'});
}
export function pinCampaign(l:CampaignLocal,id:string):CampaignLocal{
 if(!l.events.some(e=>e.id===id))return l;
 return {...l,pinned:l.pinned.includes(id)?l.pinned.filter(p=>p!==id):[...l.pinned,id].slice(-30),assessments:{}};
}
export const CAUSE_OPTIONS:Record<MissionId,{id:string;label:string}[]>={
 identity:[{id:'blocked-https',label:'Reports HTTPS uses the wrong port'},{id:'ad-delegation',label:'Excess delegated password-reset rights'},{id:'dns-cache',label:'Stale DNS response'}],
 pivot:[{id:'dual-policy',label:'Guest access allowed by topology and NGFW layers'},{id:'certificate',label:'Untrusted certificate authority'},{id:'dns-cache',label:'Incorrect DNS caching'}],
 secrets:[{id:'firewall-only',label:'Only the inbound firewall rule'},{id:'token-exposure',label:'Leaked token and missing security telemetry'},{id:'password-length',label:'End-user password length'}]
};
export function assessCampaign(l:CampaignLocal,e:EnterpriseState,n:NativeEnterprise):CampaignLocal{
 const id=l.selected,s=inspectCampaign(e,n,l),report=l.reports[id];
 const threatPinned=l.events.some(ev=>ev.mission===id&&l.pinned.includes(ev.id)&&ev.kind==='attack'&&ev.observed==='exposure');
 const recent=(name:string)=>l.events.some(ev=>ev.mission===id&&ev.kind==='probe'&&ev.signature===s.signature&&ev.title===name&&ev.recorded&&ev.observed==='clean');
 const controls=id==='identity'?!s.identityExposed&&!s.sessions.identity:id==='pivot'?!s.guestTopology&&!s.guestFirewall&&!s.sessions.pivot:!s.tokenValid&&!s.sessions.secrets&&s.monitoring;
 const priorControls=id==='identity'||(!s.identityExposed&&!s.sessions.identity&&(id==='pivot'||(!s.guestTopology&&!s.guestFirewall&&!s.sessions.pivot)));
 const checks=[
  {label:'Threat reproduced & pinned',ok:threatPinned,detail:'Collect a real simulated attack event from this mission before remediation.'},
  {label:'Root cause identified',ok:report.cause===MISSION_INFO[id].rootCause,detail:'Select the underlying cause rather than a symptom.'},
  {label:'Earlier mission safeguards retained',ok:priorControls,detail:'Prior repaired identity and guest controls must remain effective across the entire campaign.'},
  {label:'Unsafe access contained',ok:controls,detail:id==='identity'?'Remove AD reset delegation AND revoke the surviving session.':id==='pivot'?'Close both policy layers AND revoke the session.':'Rotate the fictional token, restore telemetry AND revoke the session.'},
  {label:'Legitimate service preserved',ok:s.business,detail:s.businessReason},
  {label:'Detection online',ok:s.monitoring,detail:'Sensor must be running after remediation.'},
  {label:'Fresh authorized-business retest',ok:recent('Approved HTTPS continuity'),detail:'Run a new business probe after your final configuration change.'},
  {label:'Fresh threat-control retest',ok:recent(id==='identity'?'Helpdesk reset delegation':id==='pivot'?'Guest boundary check':'Service API token exposure'),detail:'Re-run relevant negative security probe against current revision.'},
  {label:'Evidence-based investigation report',ok:report.impact.trim().length>=35&&report.remediation.trim().length>=35&&report.retest.trim().length>=30,detail:'Explain actual impact, implemented remediation and negative/positive verification.'},
  {label:'Sensor evidence of the original threat',ok:l.events.some(ev=>ev.mission===id&&ev.kind==='attack'&&ev.observed==='exposure'&&ev.recorded)||id==='secrets'&&l.events.some(ev=>ev.mission===id&&ev.kind==='probe'&&ev.title==='Telemetry pipeline health'&&ev.observed==='failure'),detail:'SOC event or documented sensor gap; simulator-only events are not treated as ingested logs.'},
 ];
 const assessment={signature:s.signature,checks,passed:checks.every(c=>c.ok)};
 return {...l,assessments:{...l.assessments,[id]:assessment},completed:assessment.passed?[...new Set([...l.completed,id])]:l.completed};
}
export function currentAssessment(l:CampaignLocal,s:CampaignView):MissionAssessment|null{return l.assessments[l.selected]?.signature===s.signature?l.assessments[l.selected]!:null;}
export function exportCampaign(l:CampaignLocal,e:EnterpriseState,n:NativeEnterprise):string{
 const s=inspectCampaign(e,n,l);const md=['# CyberLab Connected Campaign — Local Investigation Record','','**Synthetic browser-only training. No live access, real logs, or tamper-resistant scoring.**',`\nConfiguration: ${s.signature}`];
 for(const id of MISSION_ORDER){const r=l.reports[id];md.push(`\n## ${MISSION_INFO[id].number} · ${MISSION_INFO[id].name}`,`Status: ${l.completed.includes(id)?'Completed locally':'Not completed'}`,`Root cause: ${r.cause||'Not selected'}`,`Impact: ${r.impact||'Not provided'}`,`Remediation: ${r.remediation||'Not provided'}`,`Retest: ${r.retest||'Not provided'}`,'### Pinned evidence',...l.events.filter(ev=>ev.mission===id&&l.pinned.includes(ev.id)).map(ev=>`- ${ev.id} [${ev.kind}] ${ev.title}: ${ev.detail}`));}
 md.push('\n## Full simulated timeline',...l.events.map(ev=>`- ${ev.id} ${ev.mission}/${ev.kind} ${ev.recorded?'[sensor or config recorded]':'[local only, sensor offline]'} ${ev.title}`));return md.join('\n')+'\n';
}
