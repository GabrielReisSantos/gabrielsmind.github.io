/** CyberLab Unified Cyber Range — deterministic, fictional in-browser state model.
 * No shell, network, Windows or directory access; every action is allowlisted. */
export type NodeId='WS01'|'DC01'|'APP01'|'NGFW';
export type EventFamily='windows'|'firewall'|'application';
export type EventKind='attack'|'normal'|'verification';
export type AuditControl='account'|'logon'|'traffic';
export type Diagnosis='excessive-reset-rights'|'firewall-allow'|'password-policy'|'dns-error';
export type SimEvent={id:string;commandId:string;kind:EventKind;family:EventFamily;eventId:string;node:NodeId;actor:string;target:string;source:string;outcome:string;message:string;technique:string};
export type CommandEntry={id:string;command:string;output:string;success:boolean;eventIds:string[];nodes:NodeId[]};
export type Tests={revision:number;attackBlocked:boolean;serviceWorks:boolean;monitoringEnabled:boolean;details:string[]};
export type RangeState={networkAllowed:boolean;guestIsolated:boolean;networkReason:string;networkStage:string;networkConfigRevision:number;revision:number;nextId:number;aclReset:boolean;credentialVersion:number;appCredentialVersion:number;stolenVersion:number|null;sessionActive:boolean;audits:Record<AuditControl,boolean>;events:SimEvent[];commands:CommandEntry[];pinned:string[];query:string;diagnosis:Diagnosis|null;explanation:string;baselineRun:boolean;attackObserved:boolean;tests:Tests|null};
export type Rule={clauses:{field:'event_id'|'actor'|'target'|'source'|'outcome'|'family';value:string}[]};
export type MatchSummary={matched:string[];truePositives:string[];falsePositives:string[];valid:boolean;error:string};
export type Grade={complete:boolean;requirements:{label:string;ok:boolean}[];notes:string[]};
export const INITIAL_NODES=[
 {id:'WS01',title:'WS01',role:'Helpdesk workstation',ip:'10.10.10.42'},
 {id:'DC01',title:'DC01',role:'Active Directory / KDC',ip:'10.10.10.10'},
 {id:'NGFW',title:'NGFW',role:'Network segmentation',ip:'10.10.10.1'},
 {id:'APP01',title:'APP01',role:'Reports application',ip:'10.20.10.20'},
] as const;
export const AVAILABLE_COMMANDS=[
 'help','whoami','ad groups','ad inspect svc-reports','ad acl svc-reports','network trace app01',
 'simulate normal','attack reset svc-reports','attack login app01','show events','show controls',
 'fix remove-reset-acl','fix rotate-credential','fix sync-application','fix revoke-sessions',
 'audit account on','audit account off','audit logon on','audit logon off','audit traffic on','audit traffic off',
 'verify attack','verify service','verify monitoring',
] as const;
const normalized=(command:string)=>command.trim().replace(/\s+/g,' ').toLowerCase();
export const initialState=():RangeState=>({networkAllowed:true,guestIsolated:true,networkReason:'Network permitted by the enterprise policy.',networkStage:'legacy',networkConfigRevision:0,revision:0,nextId:1,aclReset:true,credentialVersion:1,appCredentialVersion:1,stolenVersion:null,sessionActive:false,audits:{account:true,logon:true,traffic:true},events:[],commands:[],pinned:[],query:'',diagnosis:null,explanation:'',baselineRun:false,attackObserved:false,tests:null});
/** Apply authoritative cross-module configuration. A changed control invalidates every retest. */
export function applyEnterpriseConfig(state:RangeState,config:{helpdeskReset:boolean;wsToApp443:boolean;nativeRevision?:number;nativeReason?:string;nativeStage?:string;guestIsolated?:boolean}):RangeState{
 const guestIsolated=config.guestIsolated??state.guestIsolated;
 const networkConfigRevision=config.nativeRevision??state.networkConfigRevision;
 const networkReason=config.nativeReason??state.networkReason;
 const networkStage=config.nativeStage??state.networkStage;
 if(state.aclReset===config.helpdeskReset&&state.networkAllowed===config.wsToApp443&&state.guestIsolated===guestIsolated&&state.networkConfigRevision===networkConfigRevision&&state.networkReason===networkReason&&state.networkStage===networkStage)return state;
 return {...state,aclReset:config.helpdeskReset,networkAllowed:config.wsToApp443,guestIsolated,networkConfigRevision,networkReason,networkStage,revision:state.revision+1,tests:null};
}
export function executeCommand(state:RangeState,raw:string):RangeState{
 const command=normalized(raw);if(!command)return state;
 let s:RangeState={...state,audits:{...state.audits},commands:[...state.commands],events:[...state.events]};
 const entry:CommandEntry={id:`A${s.nextId++}`,command,output:'',success:true,eventIds:[],nodes:[]};
 const text=(value:string,nodes:NodeId[]=[])=>(entry.output=value,entry.nodes=nodes);
 const record=(e:Omit<SimEvent,'id'|'commandId'>)=>{const id=`E${s.nextId++}`;s.events.push({...e,id,commandId:entry.id});entry.eventIds.push(id);};
 const windowEvent=(kind:EventKind,eventId:string,node:NodeId,actor:string,target:string,outcome:string,message:string,technique:string,source='WS01')=>record({kind,family:'windows',eventId,node,actor,target,outcome,message,technique,source});
 const firewallObservable=()=>s.networkAllowed||s.networkStage==='legacy'||s.networkStage==='ngfw-policy'||s.networkStage==='topology-policy'||s.networkStage==='routing';
 const fwEvent=(kind:EventKind,actor:string,outcome:string,message:string,technique:string)=>record({kind,family:'firewall',eventId:'TRAFFIC',node:'NGFW',actor,target:'APP01',outcome,message,technique,source:'WS01'});
 const appEvent=(kind:EventKind,actor:string,outcome:string,message:string,technique:string)=>record({kind,family:'application',eventId:'APP-AUTH',node:'APP01',actor,target:'reports-api',outcome,message,technique,source:'APP01'});
 const changed=()=>{s.revision++;s.tests=null;};
 switch(command){
 case 'help':text(`Allowed commands:\n${AVAILABLE_COMMANDS.join('\n')}\nNo input is executed by a real shell.`,['WS01']);break;
 case 'whoami':text('CYBERLAB\\lina.helpdesk — memberOf: Helpdesk (not Domain Admins).',['WS01']);break;
 case 'ad groups':text('Helpdesk: lina.helpdesk\nApp-Admins: svc-reports\nDomain Admins: dom.admin\nEffective membership is not the same as resource access.',['DC01']);break;
 case 'ad inspect svc-reports':text('CN=svc-reports,OU=ServiceAccounts,DC=cyberlab,DC=test\nSPN: HTTP/APP01.cyberlab.test\nmemberOf: App-Admins\nUsed by: reports-scheduler on APP01\nCredential material is never displayed.',['DC01','APP01']);break;
 case 'ad acl svc-reports':text(`ResetPassword delegated to Helpdesk: ${s.aclReset?'YES — risky':'NO — restricted'}\nApp-Admins membership: svc-reports\nAllowed administrator: dom.admin`,['DC01']);break;
 case 'network trace app01':
  if(s.audits.traffic&&firewallObservable())fwEvent('verification','lina.helpdesk',s.networkAllowed?'allow':'deny',s.networkAllowed?'WS01 → APP01 TCP/443 reached application through native topology and NGFW.':`WS01 → APP01 TCP/443 blocked at ${s.networkStage}: ${s.networkReason}`,'path-test');
  text(s.networkAllowed?'WS01 → NGFW → APP01 TCP/443 ALLOW. '+s.networkReason+' Reachability does not grant privileges.':'WS01 → APP01 TCP/443 DENY at '+s.networkStage+': '+s.networkReason+' Inspect native 3D topology and ordered NGFW rulebase.',['WS01','NGFW','APP01']);break;
 case 'show controls':text(`Helpdesk reset ACL=${s.aclReset}; secret v${s.credentialVersion}; app credential v${s.appCredentialVersion}; stolen v${s.stolenVersion??'none'}; active session=${s.sessionActive}\nAuditing: account=${s.audits.account}, logon=${s.audits.logon}, traffic=${s.audits.traffic}`,['DC01','APP01','NGFW']);break;
 case 'show events':text(`${s.events.length} simulated records. Select Telemetry to inspect event IDs, causal command and device.`,['DC01','APP01','NGFW']);break;
 case 'simulate normal':
  s.baselineRun=true;
  if(s.audits.account)windowEvent('normal','4724','DC01','dom.admin','temp.contractor','success','Authorized account reset by delegated identity administrator.','legitimate-administration','DC01');
  if(s.audits.logon)windowEvent('normal',s.appCredentialVersion===s.credentialVersion?'4624':'4625','APP01','svc-reports','APP01',s.appCredentialVersion===s.credentialVersion?'success':'failure',s.appCredentialVersion===s.credentialVersion?'Scheduled reporting service authenticates using configured credential.':'Scheduled reporting fails due to stale credential.','approved-service','APP01');
  if(s.audits.traffic)fwEvent('normal','reports-scheduler','allow','Approved HTTPS application traffic.','approved-service');
  text('Baseline generated: identity-administration and scheduled reporting activity. Missing logs reflect disabled audit controls.',['DC01','APP01','NGFW']);break;
 case 'attack reset svc-reports':
  if(s.aclReset){s.stolenVersion=s.credentialVersion;s.attackObserved=true;
   if(s.audits.account)windowEvent('attack','4724','DC01','lina.helpdesk','svc-reports','success','Helpdesk principal successfully reset service-account password.','T1098','WS01');
   text('Simulated password reset accepted by DC01. Attacker controls credential version '+s.stolenVersion+'. This is a fictional, allowlisted operation.',['WS01','DC01']);
  }else{text('DENIED: Helpdesk has no ResetPassword right. A denied attempt does not automatically generate 4724.',['WS01','DC01']);}
  break;
 case 'attack login app01':{
  const hasCredential=s.sessionActive||(s.stolenVersion!==null&&s.stolenVersion===s.credentialVersion);
  if(!s.networkAllowed){
   if(s.audits.traffic&&firewallObservable())fwEvent('attack','svc-reports','deny',`WS01 → APP01:443 blocked at ${s.networkStage}: ${s.networkReason}`,'network-control');
   text('NETWORK DENIED at '+s.networkStage+': '+s.networkReason+' Credential/session validity is independent of this network block.',['WS01','NGFW','APP01']);
   break;
  }
  const allowed=hasCredential;
  if(allowed){s.attackObserved=true;s.sessionActive=true;
   if(s.audits.logon){windowEvent('attack','4624','APP01','svc-reports','APP01','success','Service account authenticated from unexpected helpdesk workstation.','T1078');windowEvent('attack','4672','APP01','svc-reports','APP01','success','Special privileges associated with application administrative logon.','T1078');}
   if(s.audits.traffic)fwEvent('attack','svc-reports','allow','WS01 → APP01:443 authenticated session; unexpected source.','T1078');
   appEvent('attack','svc-reports','admin','Reports API accepted privileged identity from WS01.','T1078');
   text('ATTACK PATH OPEN: compromised service identity receives administrative application access.',['WS01','NGFW','APP01']);
  }else{
   if(s.audits.logon)windowEvent('verification','4625','APP01','svc-reports','APP01','failure','Old or absent credential rejected by application authentication.','access-control');
   text('ACCESS DENIED: no valid attacker credential or session.',['WS01','APP01']);
  }break;}
 case 'fix remove-reset-acl':if(s.aclReset){s.aclReset=false;changed();text('ResetPassword delegation removed from Helpdesk. Normal identity administration remains available.',['DC01']);}else text('ResetPassword delegation already removed.',['DC01']);break;
 case 'fix rotate-credential':s.credentialVersion++;changed();text(`Service account rotated to version ${s.credentialVersion}. Existing application configuration and sessions do not update automatically.`,['DC01','APP01']);break;
 case 'fix sync-application':if(s.appCredentialVersion!==s.credentialVersion){s.appCredentialVersion=s.credentialVersion;changed();text('APP01 scheduler credential updated to current version.',['APP01']);}else text('APP01 already has current credential.',['APP01']);break;
 case 'fix revoke-sessions':if(s.sessionActive){s.sessionActive=false;changed();text('Privileged application sessions invalidated.',['APP01']);}else text('No active attacker session to revoke.',['APP01']);break;
 case 'audit account on':case 'audit account off':case 'audit logon on':case 'audit logon off':case 'audit traffic on':case 'audit traffic off':{
  const [,key,toggle]=command.split(' ') as ['audit',AuditControl,'on'|'off'];const enable=toggle==='on';if(s.audits[key]!==enable){s.audits[key]=enable;changed();}text(`${key} auditing ${enable?'enabled':'disabled'}. Changes affect new synthetic events only.`,key==='traffic'?['NGFW']:key==='account'?['DC01']:['APP01']);break;}
 case 'verify attack':{
  const resetDenied=!s.aclReset;
  const credentialDenied=s.stolenVersion===null||s.stolenVersion!==s.credentialVersion;
  const sessionDenied=!s.sessionActive;
  const blocked=!s.networkAllowed||(resetDenied&&credentialDenied&&sessionDenied);
  const prev=s.tests&&s.tests.revision===s.revision?s.tests:{revision:s.revision,attackBlocked:false,serviceWorks:false,monitoringEnabled:false,details:[]};
  s.tests={...prev,attackBlocked:blocked,details:[...prev.details.filter(d=>!d.startsWith('Attack:')),`Attack: WS01 route ${s.networkAllowed?'allowed':'blocked'}; reset ${resetDenied?'denied':'allowed'}; stolen credential ${credentialDenied?'invalid':'valid'}; session ${sessionDenied?'revoked':'active'}.`]};
  // Replay the two modeled adversary steps against CURRENT configuration. These are
  // synthetic observations from the same ACL, credential, session and audit state.
  if(!resetDenied&&s.audits.account)windowEvent('verification','4724','DC01','lina.helpdesk','svc-reports','success','Replay: delegated helpdesk account reset still allowed.','retest');
  if(s.audits.logon)windowEvent('verification',blocked?'4625':'4624','APP01','svc-reports','APP01',blocked?'failure':'success',blocked?'Replay: old credential and sessions denied.':'Replay: administrative application access remains possible.','retest');
  if(s.audits.traffic&&firewallObservable())fwEvent('verification','svc-reports',s.networkAllowed?'allow':'deny',s.networkAllowed?'Replay: WS01 application path allowed (identity controls evaluated separately).':'Replay: WS01 application route blocked: '+s.networkReason,'retest');
  text(blocked?'PASS — simulated attacker cannot reach privileged application with current controls.':'FAIL — replay confirms an unauthorized path is still possible.',['DC01','NGFW','APP01']);break;}
 case 'verify service':{
  const works=s.appCredentialVersion===s.credentialVersion;
  const prev=s.tests&&s.tests.revision===s.revision?s.tests:{revision:s.revision,attackBlocked:false,serviceWorks:false,monitoringEnabled:false,details:[]};
  s.tests={...prev,serviceWorks:works,details:[...prev.details.filter(d=>!d.startsWith('Service:')),`Service: scheduler ${works?'authenticates':'credential mismatch'} (application v${s.appCredentialVersion}, directory v${s.credentialVersion}).`]};
  if(s.audits.logon)windowEvent('verification',works?'4624':'4625','APP01','svc-reports','APP01',works?'success':'failure',works?'Authorized scheduler authenticated.':'Scheduler failed after credential rotation.','legitimate-retest','APP01');
  text(works?'PASS — approved reporting job remains functional.':'FAIL — application credential is stale; sync before completion.',['APP01']);break;}
 case 'verify monitoring':{
  const coverage=s.audits.account&&s.audits.logon&&s.audits.traffic;
  const prev=s.tests&&s.tests.revision===s.revision?s.tests:{revision:s.revision,attackBlocked:false,serviceWorks:false,monitoringEnabled:false,details:[]};
  s.tests={...prev,monitoringEnabled:coverage,details:[...prev.details.filter(d=>!d.startsWith('Monitoring:')),`Monitoring: account=${s.audits.account}, logon=${s.audits.logon}, traffic=${s.audits.traffic}.`]};
  text(coverage?'PASS — required simulated sources enabled.':'FAIL — telemetry gap. Enable account, logon and traffic auditing.',['DC01','APP01','NGFW']);break;}
 default:entry.success=false;text('Unknown command. Type help for the exact allowlist. Nothing was executed.');
 }
 s.commands.push(entry);return s;
}
export function pinEvent(s:RangeState,id:string):RangeState {if(!s.events.some(e=>e.id===id))return s;return {...s,pinned:s.pinned.includes(id)?s.pinned.filter(x=>x!==id):[...s.pinned,id]};}
export function parseRule(query:string):{rule:Rule|null;error:string}{
 const trimmed=query.trim().toLowerCase();if(!trimmed)return {rule:null,error:'Enter a rule such as event_id=4724 actor=lina.helpdesk target=svc-reports.'};
 const parts=trimmed.split(/\s+/);if(parts.length<2||parts.length>6)return {rule:null,error:'Use 2–6 field=value predicates separated by spaces.'};
 const clauses:Rule['clauses']=[];const seen=new Set<string>();
 for(const p of parts){const match=/^(event_id|actor|target|source|outcome|family)=([a-z0-9._-]+)$/.exec(p);if(!match)return {rule:null,error:`Unsupported predicate: ${p}. Allowed fields: event_id, actor, target, source, outcome, family.`};const field=match[1] as Rule['clauses'][number]['field'];if(seen.has(field))return {rule:null,error:`Duplicate field ${field}.`};seen.add(field);clauses.push({field,value:match[2]});}
 if(!seen.has('event_id')||!(['actor','target'].some(field=>seen.has(field))))return {rule:null,error:'Include event_id plus actor or target to avoid overly broad event-only matching.'};
 return {rule:{clauses},error:''};
}
export function evaluateRule(s:RangeState):MatchSummary{
 const {rule,error}=parseRule(s.query);if(!rule)return {valid:false,error,matched:[],truePositives:[],falsePositives:[]};
 const filtered=s.events.filter(e=>rule.clauses.every(c=>{const value=c.field==='event_id'?e.eventId:e[c.field];return value.toLowerCase()===c.value;}));
 return {valid:true,error:'',matched:filtered.map(e=>e.id),truePositives:filtered.filter(e=>e.kind==='attack').map(e=>e.id),falsePositives:filtered.filter(e=>e.kind==='normal').map(e=>e.id)};
}
export const setRule=(s:RangeState,query:string):RangeState=>({...s,query});
export const setDiagnosis=(s:RangeState,diagnosis:Diagnosis|null):RangeState=>({...s,diagnosis});
export const setExplanation=(s:RangeState,explanation:string):RangeState=>({...s,explanation});
export function gradeRange(s:RangeState):Grade{
 const matched=evaluateRule(s);const pinned=s.events.filter(e=>s.pinned.includes(e.id));
 const evidence=pinned.some(e=>e.kind==='attack'&&e.eventId==='4724')&&pinned.some(e=>e.kind==='attack'&&e.eventId==='4624');
 const isExplained=s.explanation.trim().length>=50;
 const tests=s.tests&&s.tests.revision===s.revision?s.tests:null;
 const requirements=[
  {label:'Reproduce the original identity abuse path',ok:s.attackObserved&&s.events.some(e=>e.kind==='attack'&&e.eventId==='4724')&&s.events.some(e=>e.kind==='attack'&&e.eventId==='4624')},
  {label:'Generate a logged legitimate baseline for false-positive testing',ok:s.baselineRun&&s.events.some(e=>e.kind==='normal'&&e.eventId==='4724')&&s.events.some(e=>e.kind==='normal'&&e.eventId==='4624')},
  {label:'Pin both the suspicious password reset and privileged logon',ok:evidence},
  {label:'Write a valid rule with an attack hit and zero normal false positives',ok:matched.valid&&matched.truePositives.length>0&&matched.falsePositives.length===0},
  {label:'Diagnose excessive service-account reset rights',ok:s.diagnosis==='excessive-reset-rights'&&isExplained},
  {label:'Remove unnecessary reset delegation and rotate compromised credentials',ok:!s.aclReset&&s.credentialVersion>1&&s.stolenVersion!==s.credentialVersion},
  {label:'Preserve guest network isolation in native topology',ok:s.guestIsolated},
  {label:'Invalidate attacker sessions',ok:!s.sessionActive},
  {label:'Prove the attack fails on the current configuration revision',ok:!!tests?.attackBlocked},
  {label:'Prove authorized reporting still works on the current revision',ok:!!tests?.serviceWorks},
  {label:'Verify Windows and firewall telemetry remain enabled',ok:!!tests?.monitoringEnabled},
 ];
 return {complete:requirements.every(r=>r.ok),requirements,notes:tests?.details??[]};
}
export function report(s:RangeState):string{
 const grade=gradeRange(s),matched=evaluateRule(s);return [
  '# CyberLab Unified Cyber Range — Mission UR-001','',
  '> Fictional browser-only training simulation. Logs and attack results are synthetic.','',
  `**Status:** ${grade.complete?'Validated':'Incomplete'} · **Environment revision:** ${s.revision}`,'',
  '## Hypothesis',s.diagnosis??'Not selected','',s.explanation||'Not provided','',
  '## Selected evidence',...s.events.filter(e=>s.pinned.includes(e.id)).map(e=>`- ${e.id}: ${e.eventId} / ${e.actor} → ${e.target} / ${e.outcome} — ${e.message} (caused by ${e.commandId})`),'',
  '## Detection',`Rule: \`${s.query||'not configured'}\``,`Attack matches: ${matched.truePositives.length}; normal false positives: ${matched.falsePositives.length}`,'',
  '## Configuration',`Helpdesk password-reset right: ${s.aclReset}`,`Directory credential version: ${s.credentialVersion}`,`Application credential version: ${s.appCredentialVersion}`,`Attacker session active: ${s.sessionActive}`,`WS01 → APP01 network allowed: ${s.networkAllowed}; guest isolation: ${s.guestIsolated}; native revision ${s.networkConfigRevision}; stage: ${s.networkStage}; reason: ${s.networkReason}`,'',
  '## Independent checks',...grade.requirements.map(r=>`- [${r.ok?'x':' '}] ${r.label}`),...grade.notes.map(n=>`- ${n}`),'',
  '## Command and telemetry trace',...s.commands.map(c=>`- **${c.id}** \`${c.command}\` → ${c.success?'accepted':'rejected'}; emitted ${c.eventIds.length} record(s)`),'',
  'Generated locally in CyberLab; not evidence from a live network.',''
 ].join('\n');
}
/** Persist only allowlisted commands and learner-authored metadata, never secret material.
 * Restore replays the same deterministic transitions, rejecting malformed or oversized data. */
export type RangeDraft={version:1;commands:string[];pins:string[];query:string;diagnosis:Diagnosis|null;explanation:string};
export function serializeRange(s:RangeState):RangeDraft{return {version:1,commands:s.commands.map(c=>c.command).slice(0,500),pins:[...s.pinned],query:s.query.slice(0,300),diagnosis:s.diagnosis,explanation:s.explanation.slice(0,2000)};}
export function restoreRange(input:unknown):RangeState{
 const blank=initialState();if(!input||typeof input!=='object'||Array.isArray(input))return blank;
 const d=input as Partial<RangeDraft>;
 if(d.version!==1||!Array.isArray(d.commands)||d.commands.length>500||!Array.isArray(d.pins)||d.pins.length>500||typeof d.query!=='string'||d.query.length>300||typeof d.explanation!=='string'||d.explanation.length>2000)return blank;
 if(!d.commands.every(c=>typeof c==='string'&&c.length<=50&&(AVAILABLE_COMMANDS as readonly string[]).includes(c)))return blank;
 if(!d.pins.every(id=>typeof id==='string'&&/^E[0-9]{1,6}$/.test(id)))return blank;
 if(d.diagnosis!==null&&d.diagnosis!==undefined&&!(['excessive-reset-rights','firewall-allow','password-policy','dns-error'] as const).includes(d.diagnosis))return blank;
 let result=d.commands.reduce(executeCommand,blank);
 for(const id of d.pins)if(!result.pinned.includes(id))result=pinEvent(result,id);
 return {...result,query:d.query,diagnosis:d.diagnosis??null,explanation:d.explanation};
}
