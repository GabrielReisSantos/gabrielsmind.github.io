/** CyberLab Purple Team v1.9: deterministic, fictional AD laboratory.
 * No real commands, authentication, network traffic, or attack payloads run.
 */
export type ScenarioId='kerberos'|'delegation'|'gpo';
export type Phase='baseline'|'retest';
export type Step='recon'|'attack'|'impact';
export type Rule='off'|'broad'|'tuned';
export type AuditKey='kerberos'|'account'|'directory'|'gpoSacl'|'logon'|'endpoint';
export type FixKey='managedService'|'rotateService'|'restrictReset'|'rotateBackup'|'restrictGpo'|'revertGpo';
export type UnsafeKey='disableApplication'|'disableAccountResets'|'disableGpo';
export type ControlState=Record<AuditKey|FixKey|UnsafeKey,boolean>;
export type EventRecord={id:string;runId:string;phase:Phase;time:string;host:string;channel:string;eventId:string;actor:string;target:string;detail:string;fields:Record<string,string>;origin:'attack'|'legitimate';revision:number};
export type ActionRecord={id:string;runId:string;phase:Phase;command:string;step:Step|'info';output:string;status:'ok'|'blocked'|'info'|'error';revision:number};
export type Attempt={id:string;phase:Phase;next:number;triggerWorked:boolean;impactWorked:boolean;complete:boolean;revision:number};
export type Evidence={id:string;kind:'event'|'command';phase:Phase;revision:number};
export type PurpleState={scenario:ScenarioId;revision:number;controls:ControlState;rule:Rule;attempt:Attempt|null;baseline:Attempt|null;retest:Attempt|null;events:EventRecord[];actions:ActionRecord[];evidence:Evidence[];nextId:number;notes:string;diagnosis:string;history:string[]};
export type Scenario={id:ScenarioId;title:string;subtitle:string;objective:string;commands:[string,string,string];instructions:[string,string,string];diagnoses:[string,string,string];correctDiagnosis:string;weakness:string;repair:string;telemetry:string;legitimate:string;attackPath:[string,string,string,string];tags:string[]};
export const SCENARIOS:Scenario[]=[
 {id:'kerberos',title:'Service ticket → application access',subtitle:'Kerberos exposure / service-account hygiene',objective:'Investigate a service-ticket request pattern, demonstrate a modeled credential-exposure risk, detect suspicious activity, and keep normal service access working.',commands:['enum spn','request tickets','login app01'],instructions:['Discover service principal names and ticket properties','Simulate repeated TGS requests and a bounded offline weak-password finding','Test whether the compromised account can access APP01'],diagnoses:['DNS failed to locate the KDC','Legacy service-account credential and encryption exposure','Firewall policy blocked HTTPS'],correctDiagnosis:'Legacy service-account credential and encryption exposure',weakness:'A legacy service identity uses a weak secret and permits RC4 service tickets. A ticket request itself is normal Kerberos behavior; the risk depends on credential strength, encryption, and request context.',repair:'Move the service to a strong managed credential, rotate the exposed secret, and stop legacy RC4 where compatibility permits.',telemetry:'4769 is generated on the domain controller when Kerberos service ticket auditing is enabled. Offline password guessing generates no Windows event by itself.',legitimate:'APP01 remains available using an approved managed identity.',attackPath:['WS-RED','DC01 / KDC','svc-reporting','APP01'],tags:['MITRE ATT&CK T1558.003','Windows 4769','Kerberos']},
 {id:'delegation',title:'Helpdesk delegation → service access',subtitle:'Excessive directory permissions / account reset',objective:'Inspect delegation, simulate an unauthorized service-account password reset, investigate its events, and preserve the authorized Helpdesk workflow.',commands:['enum acl','reset svc-backup','login app01'],instructions:['Discover delegated control of the service identity','Attempt to reset the service identity password using an overly broad right','Check access to APP01 using the affected identity'],diagnoses:['A routing loop prevents RDP','Excessive password-reset delegation on a service account','The server certificate is expired'],correctDiagnosis:'Excessive password-reset delegation on a service account',weakness:'The temporary Helpdesk identity has an inappropriate reset right over a service account. Reset attempts require auditing to be visible; changing the password does not automatically prove domain compromise.',repair:'Remove the excessive account-reset delegation and rotate the affected credential while preserving the approved administrators’ ability to reset ordinary user accounts.',telemetry:'4724 represents an attempt to reset an account password when Account Management auditing is enabled. APP01 logons appear under logon auditing.',legitimate:'An authorized Helpdesk operator can still reset a standard user password.',attackPath:['helpdesk-temp','DC01 / ACL','svc-backup','APP01'],tags:['MITRE ATT&CK T1098','Windows 4724','Delegation']},
 {id:'gpo',title:'GPO write access → workstation policy',subtitle:'Directory object permissions / configuration drift',objective:'Inspect a delegated GPO, simulate an unauthorized edit, trace evidence to endpoint configuration, and restore a safe approved policy.',commands:['enum gpo','edit workstation-policy','apply policy'],instructions:['Inspect the GPO editor rights and target workstations','Attempt a change to the baseline GPO using a non-approved editor','Simulate workstation policy refresh and assess impact'],diagnoses:['An incorrect A record points to an old server','Excessive write permission on a linked GPO','The domain controller has no route to the gateway'],correctDiagnosis:'Excessive write permission on a linked GPO',weakness:'A non-approved contractor can edit a linked workstation GPO. An AD modification event depends on Directory Service Changes auditing and a matching object SACL.',repair:'Restrict GPO editing to change administrators and revert unauthorized policy changes. Preserve approved change deployment.',telemetry:'5136 may describe an audited AD-side GPO object modification when both the audit subcategory and object SACL are configured. Files within SYSVOL need separate monitoring. CyberLab LAB-GPO-APPLY is synthetic endpoint telemetry, not a Windows event ID.',legitimate:'Approved administrators can still deploy the intended workstation baseline.',attackPath:['contractor','DC01 / GPO','Workstation-Baseline','WS-07'],tags:['MITRE ATT&CK T1484.001','Windows 5136','GPO']},
];
export const scenarioById=(id:ScenarioId)=>SCENARIOS.find(x=>x.id===id)!;
const defaultControls=():ControlState=>({kerberos:true,account:true,directory:false,gpoSacl:false,logon:true,endpoint:true,disableApplication:false,disableAccountResets:false,disableGpo:false,managedService:false,rotateService:false,restrictReset:false,rotateBackup:false,restrictGpo:false,revertGpo:false});
export const auditKeys:AuditKey[]=['kerberos','account','directory','gpoSacl','logon','endpoint'];
export const fixKeys:FixKey[]=['managedService','rotateService','restrictReset','rotateBackup','restrictGpo','revertGpo'];
export const controlLabels:Record<keyof ControlState,string>={kerberos:'Audit Kerberos Service Ticket Operations',account:'Audit User Account Management',directory:'Audit Directory Service Changes',gpoSacl:'GPO object SACL for write events',logon:'Audit logon success and failures',endpoint:'Synthetic endpoint configuration telemetry',managedService:'Use strong managed service credentials',rotateService:'Rotate the exposed service secret',restrictReset:'Restrict service-account reset rights',rotateBackup:'Rotate the affected backup-service secret',restrictGpo:'Restrict GPO edit permissions',revertGpo:'Roll back unauthorized policy changes',disableApplication:'Unsafe shortcut: disable APP01 for everyone',disableAccountResets:'Unsafe shortcut: block all account resets',disableGpo:'Unsafe shortcut: stop all workstation GPO processing'};
export const unsafeFixes:Record<ScenarioId,UnsafeKey>={kerberos:'disableApplication',delegation:'disableAccountResets',gpo:'disableGpo'};
export const relevantFixes:Record<ScenarioId,FixKey[]>={kerberos:['managedService','rotateService'],delegation:['restrictReset','rotateBackup'],gpo:['restrictGpo','revertGpo']};
export const relevantAudits:Record<ScenarioId,AuditKey[]>={kerberos:['kerberos','logon'],delegation:['account','logon'],gpo:['directory','gpoSacl','endpoint']};
export function newState(scenario:ScenarioId='kerberos'):PurpleState{return {scenario,revision:0,controls:defaultControls(),rule:'off',attempt:null,baseline:null,retest:null,events:[],actions:[],evidence:[],nextId:1,notes:'',diagnosis:'',history:[]};}
export const permitted=(state:PurpleState):boolean=>{
 const c=state.controls;
 if(state.scenario==='kerberos')return !c.disableApplication && !c.managedService && !c.rotateService;
 if(state.scenario==='delegation')return !c.disableAccountResets && !c.restrictReset;
 return !c.disableGpo && !c.restrictGpo;
};
export function legitimatePasses(state:PurpleState):boolean{return !state.controls[unsafeFixes[state.scenario]];} // independently modeled approved business access
export function setControl(state:PurpleState,key:keyof ControlState,value:boolean):PurpleState{
 if(state.controls[key]===value)return state;
 return {...state,revision:state.revision+1,controls:{...state.controls,[key]:value},retest:null,history:[...state.history,`Config revision ${state.revision+1}: ${controlLabels[key]} ${value?'enabled':'disabled'}`]};
}
export function setRule(state:PurpleState,rule:Rule):PurpleState{return {...state,rule};}
export const cloneState=(s:PurpleState):PurpleState=>JSON.parse(JSON.stringify(s)) as PurpleState;
const stamp=(n:number)=>`09:${String(Math.floor((n-1)/60)).padStart(2,'0')}:${String((n-1)%60).padStart(2,'0')}`;
function makeEvent(s:PurpleState,attempt:Attempt,opts:Omit<EventRecord,'id'|'runId'|'phase'|'revision'|'time'>):EventRecord{return {...opts,id:`EV-${s.nextId}`,runId:attempt.id,phase:attempt.phase,revision:attempt.revision,time:stamp(s.nextId)};}
function allowedEvent(s:PurpleState,kind:'kerberos'|'account'|'directory'|'logon'|'endpoint'):boolean{
 return kind==='directory'?s.controls.directory&&s.controls.gpoSacl:s.controls[kind];
}
export function seedLegitimate(s:PurpleState):PurpleState{
 const a=s.attempt??{id:'business',phase:'baseline' as Phase,next:0,triggerWorked:false,impactWorked:false,complete:false,revision:s.revision};
 const rows:Omit<EventRecord,'id'|'runId'|'phase'|'revision'|'time'>[]=[];
 if(s.scenario==='kerberos'&&allowedEvent(s,'kerberos'))rows.push({host:'DC01',channel:'Security',eventId:'4769',actor:'alice',target:'HTTP/APP01',detail:'Normal AES service ticket for approved application',fields:{encryption:'AES256',client:'WS-07',service:'svc-reporting',result:'success'},origin:'legitimate'});
 if(s.scenario==='delegation'&&allowedEvent(s,'account'))rows.push({host:'DC01',channel:'Security',eventId:'4724',actor:'helpdesk-admin',target:'user-alice',detail:'Approved password reset of ordinary user account',fields:{outcome:'success',role:'approved'},origin:'legitimate'});
 if(s.scenario==='gpo'&&allowedEvent(s,'directory'))rows.push({host:'DC01',channel:'Security',eventId:'5136',actor:'change-admin',target:'Workstation-Baseline',detail:'Approved GPO metadata change',fields:{objectClass:'groupPolicyContainer',change:'approved',role:'approved'},origin:'legitimate'});
 const added=rows.map((r,i)=>({...makeEvent({...s,nextId:s.nextId+i},a,r),runId:'business',phase:'baseline' as Phase}));
 return {...s,nextId:s.nextId+added.length,events:[...s.events,...added],history:[...s.history,`Generated ${added.length} authorized reference event(s) under the current audit configuration.`]};
}
export function startRun(s:PurpleState,phase:Phase):PurpleState{
 if(phase==='retest'&&!s.baseline?.complete)return s;
 const a:Attempt={id:`RUN-${s.nextId}`,phase,next:0,triggerWorked:false,impactWorked:false,complete:false,revision:s.revision};
 return {...s,attempt:a,events:s.events,history:[...s.history,`${phase} run ${a.id} started at revision ${s.revision}`]};
}
const ACTIONS:Record<ScenarioId,Record<string,Step>>={kerberos:{'enum spn':'recon','request tickets':'attack','login app01':'impact'},delegation:{'enum acl':'recon','reset svc-backup':'attack','login app01':'impact'},gpo:{'enum gpo':'recon','edit workstation-policy':'attack','apply policy':'impact'}};
export function helpText(s:PurpleState){return `CYBERLAB SIMULATOR — not a real OS shell\nhelp | show controls | show evidence | show events | test legitimate\n${scenarioById(s.scenario).commands.join(' | ')}\nEnter actions in order. Attack telemetry depends on auditing; offline steps may leave no Windows events.`;}
export function runCommand(s:PurpleState,command:string):{state:PurpleState;message:string;ok:boolean}{
 const cmd=command.trim().toLowerCase().replace(/\s+/g,' ');
 if(!cmd)return {state:s,message:'Enter a simulation command.',ok:false};
 if(cmd==='help')return {state:s,message:helpText(s),ok:true};
 if(cmd==='show controls')return {state:s,message:Object.entries(s.controls).map(([k,v])=>`${k}=${v?'enabled':'disabled'}`).join('\n'),ok:true};
 if(cmd==='test legitimate'){
  const pass=legitimatePasses(s);const a=s.attempt??{id:'business',phase:'baseline' as Phase,next:0,triggerWorked:false,impactWorked:false,complete:false,revision:s.revision};
  const eventKind=s.scenario==='kerberos'?'logon':s.scenario==='delegation'?'account':'endpoint';
  const event=allowedEvent(s,eventKind)?makeEvent(s,a,{host:s.scenario==='kerberos'?'APP01':s.scenario==='delegation'?'DC01':'WS-07',channel:s.scenario==='gpo'?'CyberLab Endpoint':'Security',eventId:s.scenario==='kerberos'?(pass?'4624':'4625'):s.scenario==='delegation'?'4724':'LAB-GPO-APPLY',actor:s.scenario==='kerberos'?'approved-operator':s.scenario==='delegation'?'helpdesk-admin':'change-admin',target:s.scenario==='gpo'?'Workstation-Baseline':s.scenario==='delegation'?'user-alice':'APP01',detail:pass?'Approved business workflow succeeded':'Approved business workflow blocked by unsafe global mitigation',fields:{outcome:pass?'success':'blocked',role:'approved'},origin:'legitimate'}):null;
  const action:ActionRecord={id:`CMD-${s.nextId+(event?1:0)}`,runId:a.id,phase:a.phase,command:cmd,step:'info',output:pass?'PASS: approved business access still works.':'FAIL: approved business workflow has been disrupted.',status:pass?'ok':'blocked',revision:s.revision};
  return {state:{...s,events:event?[...s.events,event]:s.events,actions:[...s.actions,action],nextId:s.nextId+(event?2:1)},message:action.output,ok:true};
 }
 if(cmd==='show evidence')return {state:s,message:s.evidence.map(e=>`${e.id} ${e.kind} (${e.phase})`).join('\n')||'No pinned evidence.',ok:true};
 if(cmd==='show events')return {state:s,message:s.events.slice(-12).map(e=>`${e.time} ${e.host} ${e.eventId}: ${e.detail}`).join('\n')||'No observable events.',ok:true};
 const stage=ACTIONS[s.scenario][cmd];
 if(!stage)return {state:s,message:'Unsupported synthetic command. Type help. No host or network command was executed.',ok:false};
 const run=s.attempt;if(!run)return {state:s,message:'Start a baseline or retest run before acting.',ok:false};
 const expected=(['recon','attack','impact'] as const)[run.next];
 if(!expected||expected!==stage)return {state:s,message:`Sequence mismatch. Expected step ${run.next+1}: ${scenarioById(s.scenario).commands[run.next]??'run complete'}`,ok:false};
 const exposed=permitted(s);
 let trigger=run.triggerWorked, impact=run.impactWorked;
 let output='';const emitted:Omit<EventRecord,'id'|'runId'|'phase'|'revision'|'time'>[]=[];
 if(stage==='recon'){
  output=s.scenario==='kerberos'?'LDAP observation: svc-reporting has SPN HTTP/APP01. Encryption support and credential hygiene must be evaluated.':s.scenario==='delegation'?'Directory ACL: helpdesk-temp has a modeled ResetPassword right on svc-backup. Approved Helpdesk controls apply to user accounts.':'GPO Workstation-Baseline is linked to Workstations OU. Contractor has edit rights; change-admin is the approved editor.';
 } else if(stage==='attack'){
  trigger=exposed;
  if(s.scenario==='kerberos'){
   output=exposed?'4 modeled RC4 TGS requests for HTTP/APP01; simulated offline credential weakness permits further access. The offline step is not Windows logged.':'Service tickets remain obtainable for legitimate access, but the modeled strong rotated credential does not yield reusable credentials.';
   if(allowedEvent(s,'kerberos'))for(let i=0;i<(exposed?4:1);i++)emitted.push({host:'DC01',channel:'Security',eventId:'4769',actor:'student-red',target:'HTTP/APP01',detail:`TGS issued: ${exposed?'RC4 (legacy service configuration)':'AES256'}; request ${i+1}`,fields:{encryption:exposed?'RC4':'AES256',client:'WS-RED',service:'svc-reporting',result:'success',sequence:String(i+1)},origin:'attack'});
  } else if(s.scenario==='delegation'){
   output=exposed?'ResetPassword request accepted for svc-backup; a simulated temporary credential is available.':'ResetPassword attempt denied by directory authorization. No service credential was reset.';
   if(exposed&&allowedEvent(s,'account'))emitted.push({host:'DC01',channel:'Security',eventId:'4724',actor:'helpdesk-temp',target:'svc-backup',detail:`Password reset request accepted`,fields:{outcome:exposed?'success':'failure',role:'unapproved'},origin:'attack'});
  } else {
   output=exposed?'GPO editor accepted the modeled unauthorized change to Workstation-Baseline.':'GPO editor denied the unapproved contractor. No unauthorized configuration was committed.';
   if(exposed&&allowedEvent(s,'directory'))emitted.push({host:'DC01',channel:'Security',eventId:'5136',actor:'contractor',target:'Workstation-Baseline',detail:`Directory GPO modification attempt: ${exposed?'committed':'denied'}`,fields:{objectClass:'groupPolicyContainer',change:exposed?'unauthorized':'denied',role:'unapproved'},origin:'attack'});
  }
 } else {
  impact=trigger&&exposed;
  if(s.scenario==='gpo'){
   output=impact?'WS-07 applied an unauthorized workstation setting during synthetic policy refresh.':'WS-07 kept the approved workstation baseline. Unauthorized edit did not take effect.';
   if(allowedEvent(s,'endpoint'))emitted.push({host:'WS-07',channel:'CyberLab Endpoint',eventId:'LAB-GPO-APPLY',actor:'SYSTEM',target:'Workstation-Baseline',detail:impact?'Unauthorized GPO-derived config drift':'Approved GPO baseline retained',fields:{result:impact?'drift':'compliant'},origin:'attack'});
  }else {
   output=impact?'Synthetic APP01 access succeeded using the affected service identity.':'APP01 rejected the unauthorized session. Approved users remain unaffected.';
   if(allowedEvent(s,'logon'))emitted.push({host:'APP01',channel:'Security',eventId:impact?'4624':'4625',actor:s.scenario==='kerberos'?'svc-reporting':'svc-backup',target:'APP01',detail:impact?'Unapproved service-identity network logon succeeded':'Unapproved service-identity logon failed',fields:{logonType:'3',client:'WS-RED',outcome:impact?'success':'failure'},origin:'attack'});
  }
 }
 const firstId=s.nextId;const events=emitted.map((e,i)=>makeEvent({...s,nextId:firstId+i},run,e));
 const action:ActionRecord={id:`CMD-${firstId+events.length}`,runId:run.id,phase:run.phase,command:cmd,step:stage,output,status:stage!=='recon'&&!exposed?'blocked':'ok',revision:run.revision};
 const next=run.next+1;const nextRun:Attempt={...run,next,triggerWorked:trigger,impactWorked:impact,complete:next===3};
 return {state:{...s,events:[...s.events,...events],actions:[...s.actions,action],attempt:nextRun,baseline:nextRun.complete&&nextRun.phase==='baseline'?nextRun:s.baseline,retest:nextRun.complete&&nextRun.phase==='retest'?nextRun:s.retest,nextId:firstId+events.length+1,history:[...s.history,`${run.phase}: ${cmd} → ${action.status} (${events.length} event(s))`]},message:output,ok:true};
}
export function pinEvidence(s:PurpleState,id:string):PurpleState{
 const ev=s.events.find(e=>e.id===id),command=s.actions.find(a=>a.id===id);
 if(!ev&&!command)return s;
 const entry:Evidence={id,kind:ev?'event':'command',phase:(ev??command)!.phase,revision:(ev??command)!.revision};
 return {...s,evidence:s.evidence.some(e=>e.id===id)?s.evidence:[...s.evidence,entry]};
}
export function isAttackSignal(e:EventRecord,scenario:ScenarioId):boolean{
 if(scenario==='kerberos')return e.eventId==='4769'&&e.fields.encryption==='RC4'&&e.fields.client==='WS-RED'&&e.actor==='student-red';
 if(scenario==='delegation')return e.eventId==='4724'&&e.actor==='helpdesk-temp'&&e.target==='svc-backup';
 return e.eventId==='5136'&&e.actor==='contractor'&&e.fields.change==='unauthorized';
}
export function alertsFor(s:PurpleState):EventRecord[]{
 if(s.rule==='off')return [];
 if(s.rule==='broad')return s.events.filter(e=>e.eventId===(s.scenario==='kerberos'?'4769':s.scenario==='delegation'?'4724':'5136'));
 if(s.scenario==='kerberos'){
  const candidates=s.events.filter(e=>isAttackSignal(e,'kerberos'));
  return candidates.filter(e=>candidates.filter(a=>a.runId===e.runId).length>=3);
 }
 return s.events.filter(e=>isAttackSignal(e,s.scenario));
}
export type GradeGate={name:string;pass:boolean;explanation:string};
export function gradePurple(s:PurpleState):{pass:boolean;gates:GradeGate[]}{
 const alerts=alertsFor(s),b=s.baseline,r=s.retest;
 const pinnedEvents=s.evidence.filter(e=>e.kind==='event');
 const logs=s.events.filter(e=>e.phase==='baseline'&&e.origin==='attack');
 const baselineEvidence=pinnedEvents.some(e=>logs.some(x=>x.id===e.id));
 const retestEvidence=s.evidence.some(e=>e.phase==='retest'&&(
    s.events.some(ev=>ev.id===e.id)||s.actions.some(a=>a.id===e.id)));
 const tunedAlert=alerts.some(e=>e.origin==='attack'&&e.phase==='baseline'&&e.runId===b?.id);
 const noNoise=alerts.every(e=>e.origin!=='legitimate');
 const controls=relevantAudits[s.scenario].every(k=>s.controls[k]);
 const hardening=relevantFixes[s.scenario].every(k=>s.controls[k]);
 const legitimateTest=s.actions.some(a=>a.command==='test legitimate'&&a.status==='ok'&&a.revision===s.revision&&a.phase==='retest');
 const gates:GradeGate[]=[
  {name:'Baseline attack reproduced',pass:!!b?.complete&&b.impactWorked,explanation:'Run all three adversary steps before changing the vulnerable configuration.'},
  {name:'Original attack logs preserved',pass:baselineEvidence,explanation:'Pin an actual baseline Windows/endpoint event from the attack. Audit coverage must exist when the action occurs.'},
  {name:'Detection fires without false positives',pass:s.rule==='tuned'&&tunedAlert&&noNoise,explanation:'Use a tuned signal that alerts on the suspicious behavior but not on normal business activity.'},
  {name:'Correct diagnosis',pass:s.diagnosis===scenarioById(s.scenario).correctDiagnosis,explanation:'Tie the root cause to the observed identity or delegation condition.'},
  {name:'Least-privilege hardening complete',pass:hardening,explanation:'Apply both required controls; a cosmetic change or a single mitigation is insufficient.'},
  {name:'Independent legitimate access test',pass:legitimateTest&&legitimatePasses(s),explanation:'Type test legitimate after hardening to prove the approved business workflow remains available.'},
  {name:'Audit coverage maintained',pass:controls,explanation:'Keep the required audit subcategories and SACL enabled for this scenario.'},
  {name:'Fresh attack replay blocked',pass:!!r?.complete&&r.revision===s.revision&&!r.impactWorked&&legitimatePasses(s),explanation:'Replay all three stages on the latest revision; authorized business activity must still work.'},
  {name:'Before/after evidence pinned',pass:baselineEvidence&&retestEvidence,explanation:'Pin one original attack event and a fresh retest event or terminal outcome.'},
  {name:'Technical report drafted',pass:s.notes.trim().length>=90&&s.evidence.length>=2,explanation:'Explain the attack, relevant events, root cause, selected controls, and verification in your own words.'},
 ];
 return {pass:gates.every(g=>g.pass),gates};
}
export function completedReport(s:PurpleState):string{
 const d=scenarioById(s.scenario),grade=gradePurple(s),getEvidence=(id:string)=>s.events.find(e=>e.id===id)??s.actions.find(a=>a.id===id);
 return `# CyberLab Purple Team investigation — ${d.title}\n\n> Synthetic educational environment. No real domain or attack execution.\n\n## Case\n${d.objective}\n\n## Baseline and impact\n- Reproduced: ${!!s.baseline?.impactWorked}\n- Baseline run: ${s.baseline?.id??'not run'}\n- Relevant audit coverage: ${relevantAudits[s.scenario].map(k=>`${k}=${s.controls[k]}`).join(', ')}\n\n## Diagnosis\n${s.diagnosis||'Not selected'}\n\n## Detection engineering\n- Rule: ${s.rule}\n- Alerts: ${alertsFor(s).length}\n- Normal activity remains available: ${legitimatePasses(s)}
- Current-revision approved access test: ${s.actions.some(a=>a.command==='test legitimate'&&a.status==='ok'&&a.revision===s.revision)}\n\n## Remediation and retest\n- Controls: ${relevantFixes[s.scenario].map(k=>`${controlLabels[k]}=${s.controls[k]}`).join('; ')}\n- Revision: ${s.revision}\n- Retest: ${s.retest?.id??'not run'}; blocked=${s.retest?.complete&&!s.retest.impactWorked}\n\n## Evidence\n${s.evidence.map(ref=>{const r=getEvidence(ref.id);if(!r)return '';return `### ${ref.id} (${ref.phase})\n\n\`\`\`text\n${'output' in r?r.output:`${r.time} ${r.host} Event ${r.eventId} ${r.detail}\n${JSON.stringify(r.fields,null,2)}`}\n\`\`\``;}).join('\n\n')}\n\n## Analyst reasoning\n${s.notes||'Not documented'}\n\n## Validation\n${grade.gates.map(g=>`- ${g.pass?'PASS':'NOT MET'}: ${g.name}`).join('\n')}\n\n**All gates passed:** ${grade.pass}\n`;
}
