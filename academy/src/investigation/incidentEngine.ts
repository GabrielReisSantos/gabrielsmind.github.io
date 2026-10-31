/** Incident INC-0042: a shared-topology, deterministic investigative workflow.
 * No real network traffic is generated.  Evidence is immutable at capture time.
 */
import {EXERCISES,diagnostic,evaluate,makeTopology,simulate,type Topology,type Trace} from '../threeD/topologyEngine';
import {sceneById} from '../threeD/sceneEngine';

export const INCIDENT_ID='INC-0042';
export const SCENE_ID='segments';
export const SHARED_TOPOLOGY_KEY='cyberlab-v8-topology-'+SCENE_ID;
export const INCIDENT_KEY='cyberlab-v12-incident-0042';
export const INCIDENT_COMMANDS=['show interfaces','show links','show routes','show policies','show nat','show packet trace'] as const;
export type IncidentCommand=typeof INCIDENT_COMMANDS[number];
export type EvidenceKind='baseline'|'diagnostic'|'retest'|'isolation';
export type Evidence={id:string;kind:EvidenceKind;revision:number;label:string;output:string;code?:string;command?:IncidentCommand;passed?:boolean};
export type ActionLog={revision:number;description:string};
export type CaseState={evidence:Evidence[];actions:ActionLog[];diagnosis:string;analysis:string;impact:string;remediation:string;retest:string;citations:{root:string;success:string;isolation:string};submitted:boolean;startedAt:number};
export type IncidentAssessment={complete:boolean;gates:Record<string,boolean>;findings:string[];score:number;allSafe:boolean};
export const HYPOTHESES=[
 {id:'routing',label:'The firewall cannot route toward the DMZ'},
 {id:'policy-shadow',label:'An earlier broad deny shadows the specific HTTPS permit'},
 {id:'dns',label:'DNS is returning an incorrect application address'},
 {id:'tcp',label:'TCP session expiration is prematurely closing the connection'}
] as const;
export function initialCase():CaseState{return {evidence:[],actions:[],diagnosis:'',analysis:'',impact:'',remediation:'',retest:'',citations:{root:'',success:'',isolation:''},submitted:false,startedAt:Date.now()};}
export function initialTopology():Topology{return makeTopology(sceneById(SCENE_ID));}
export function isTopology(value:unknown):value is Topology{
 if(!value||typeof value!=='object')return false;
 const t=value as Partial<Topology>;
 return t.sceneId===SCENE_ID&&Number.isInteger(t.revision)&&Array.isArray(t.nodes)&&Array.isArray(t.cables)&&Array.isArray(t.rules)&&Array.isArray(t.routes)&&t.nodes.length>=3&&t.cables.length>0;
}
export function readSharedTopology(reader:Pick<Storage,'getItem'>):Topology{
 try{const parsed:unknown=JSON.parse(reader.getItem(SHARED_TOPOLOGY_KEY)??'null');if(isTopology(parsed))return parsed;}catch{/* corrupted or blocked storage */}
 return initialTopology();
}
export function saveSharedTopology(writer:Pick<Storage,'setItem'>,t:Topology){writer.setItem(SHARED_TOPOLOGY_KEY,JSON.stringify(t));}
function isEvidence(value:unknown):value is Evidence{
 if(!value||typeof value!=='object')return false;
 const x=value as Partial<Evidence>;
 return typeof x.id==='string'&&typeof x.label==='string'&&typeof x.output==='string'&&Number.isInteger(x.revision)&&['baseline','diagnostic','retest','isolation'].includes(x.kind??'');
}
export function readCase(reader:Pick<Storage,'getItem'>,key=INCIDENT_KEY):CaseState{
 try{
  const x:unknown=JSON.parse(reader.getItem(key)??'null');if(!x||typeof x!=='object')return initialCase();
  const s=x as Partial<CaseState>;return {...initialCase(),evidence:Array.isArray(s.evidence)?s.evidence.filter(isEvidence).slice(-120):[],actions:Array.isArray(s.actions)?s.actions.filter(a=>a&&Number.isInteger(a.revision)&&typeof a.description==='string').slice(-100):[],diagnosis:typeof s.diagnosis==='string'?s.diagnosis:'',analysis:typeof s.analysis==='string'?s.analysis:'',impact:typeof s.impact==='string'?s.impact:'',remediation:typeof s.remediation==='string'?s.remediation:'',retest:typeof s.retest==='string'?s.retest:'',citations:s.citations&&typeof s.citations==='object'?{root:typeof s.citations.root==='string'?s.citations.root:'',success:typeof s.citations.success==='string'?s.citations.success:'',isolation:typeof s.citations.isolation==='string'?s.citations.isolation:''}:{root:'',success:'',isolation:''},submitted:!!s.submitted,startedAt:typeof s.startedAt==='number'&&s.startedAt>0?s.startedAt:Date.now()};
 }catch{return initialCase();}
}
export function logAction(state:CaseState,revision:number,description:string):CaseState{return {...state,submitted:false,actions:[...state.actions,{revision,description}].slice(-100)};}
export function addEvidence(state:CaseState,item:Omit<Evidence,'id'>):CaseState{
 const nextId=state.evidence.reduce((highest,e)=>Math.max(highest,Number(e.id.slice(3))||0),0)+1;
 const id=`EV-${String(nextId).padStart(3,'0')}`;
 return {...state,submitted:false,evidence:[...state.evidence,{id,...item}].slice(-120)};
}
export function captureDiagnostic(state:CaseState,t:Topology,command:IncidentCommand,trace:Trace|null=null):CaseState{
 return addEvidence(state,{kind:'diagnostic',revision:t.revision,label:`$ ${command}`,command,output:diagnostic(t,command,trace)});
}
export type ProbeSet={positive:Trace;negative:Trace[];secure:boolean;revision:number;waypointOk:boolean};
export function runProbes(t:Topology):ProbeSet{
 const test=evaluate(t,EXERCISES[SCENE_ID]);return {positive:test.positive,negative:test.negative,secure:test.secure,revision:t.revision,waypointOk:test.waypointOk};
}
export function traceText(trace:Trace){return [
  `RESULT ${trace.pass?'DELIVERED':'DROPPED'} · ${trace.code} · ${trace.reason}`,
  `PATH ${trace.path.join(' → ')}`,
  ...trace.events.map((ev,i)=>`${String(i+1).padStart(2,'0')}. ${ev.device} / ${ev.kind}: ${ev.message}`)
 ].join('\n');}
export function captureBaseline(state:CaseState,t:Topology,probe:ProbeSet):CaseState{
 return addEvidence(state,{kind:'baseline',revision:t.revision,label:'Reported outage — approved HTTPS',code:probe.positive.code,passed:probe.positive.pass,output:traceText(probe.positive)});
}
export function captureRetest(state:CaseState,t:Topology,probe:ProbeSet):CaseState{
 let next=addEvidence(state,{kind:'retest',revision:t.revision,label:'Post-change HTTPS retest',code:probe.positive.code,passed:probe.positive.pass,output:traceText(probe.positive)});
 for(let i=0;i<probe.negative.length;i++)next=addEvidence(next,{kind:'isolation',revision:t.revision,label:`Isolation check ${i+1}`,code:probe.negative[i].code,passed:probe.negative[i].pass,output:traceText(probe.negative[i])});
 return next;
}
export function policyIsNarrow(t:Topology):boolean{
 const ids=t.rules.map(r=>r.id),allow=t.rules.find(r=>r.id==='specific-https'),deny=t.rules.find(r=>r.id==='broad-deny');
 return !!allow&&!!deny&&allow.enabled&&deny.enabled&&allow.action==='allow'&&deny.action==='deny'&&ids.indexOf('specific-https')<ids.indexOf('broad-deny')&&allow.sourceZone==='TRUST'&&allow.destinationZone==='DMZ'&&allow.port===443;
}
export function assessIncident(state:CaseState,t:Topology):IncidentAssessment{
 const outcome=runProbes(t);
 const base=state.evidence.find(x=>x.kind==='baseline'&&x.passed===false);
 const policy=state.evidence.find(x=>x.kind==='diagnostic'&&x.command==='show policies'&&base&&x.revision===base.revision);
 const commands=new Set(state.evidence.filter(x=>x.kind==='diagnostic').map(x=>x.command));
 const retest=[...state.evidence].reverse().find(x=>x.kind==='retest'&&x.revision===t.revision&&x.passed===true);
 const isolation=state.evidence.filter(x=>x.kind==='isolation'&&x.revision===t.revision&&x.passed===false);
 const byId=(id:string)=>state.evidence.find(x=>x.id===id);
 const root=byId(state.citations.root),success=byId(state.citations.success),negative=byId(state.citations.isolation);
 const gates:Record<string,boolean>={
  failedBaseline:!!base,
  policyEvidence:!!policy,
  crossSourceDiagnostics:commands.size>=2,
  correctDiagnosis:state.diagnosis==='policy-shadow',
  changedConfig:!!base&&t.revision>base.revision&&state.actions.some(a=>a.revision>base.revision),
  narrowPolicy:policyIsNarrow(t),
  positiveRetest:!!retest&&outcome.positive.pass,
  isolationProof:isolation.length>=EXERCISES[SCENE_ID].negative.length&&outcome.negative.every(x=>!x.pass)&&outcome.waypointOk,
  evidenceCitations:!!root&&root.kind==='diagnostic'&&root.command==='show policies'&&!!base&&root.revision===base.revision&&!!success&&success.kind==='retest'&&success.passed===true&&success.revision===t.revision&&!!negative&&negative.kind==='isolation'&&negative.passed===false&&negative.revision===t.revision,
  technicalReport:state.analysis.trim().length>=35&&state.impact.trim().length>=20&&state.remediation.trim().length>=25&&state.retest.trim().length>=20&&!!root&&state.analysis.includes(root.id)&&!!success&&!!negative&&state.retest.includes(success.id)&&state.retest.includes(negative.id),
 };
 const names:Record<string,string>={failedBaseline:'Capture the original failed application flow.',policyEvidence:'Pin the security-policy table before making changes.',crossSourceDiagnostics:'Collect outputs from at least two distinct diagnostic commands.',correctDiagnosis:'Identify the evidence-supported root cause.',changedConfig:'Record a configuration change after the baseline.',narrowPolicy:'Move the narrow HTTPS permit above the deny; retain deny-by-default.',positiveRetest:'Pin a successful retest from the current topology revision.',isolationProof:'Prove both prohibited flows are blocked and the approved gateway was traversed.',evidenceCitations:'Cite captured pre-change policy, current successful retest, and current isolation proof.',technicalReport:'Explain the impact and repair, and cite your selected evidence IDs in the technical analysis and retest text.'};
 const findings=Object.entries(gates).filter(([,ok])=>!ok).map(([key])=>names[key]);
 return {complete:findings.length===0,gates,findings,score:Math.round(Object.values(gates).filter(Boolean).length/Object.keys(gates).length*100),allSafe:outcome.secure&&policyIsNarrow(t)};
}
function escapeFence(input:string){return input.replaceAll('```','` ` `');}
export function reportMarkdown(state:CaseState,t:Topology):string{
 const assessment=assessIncident(state,t),lines=[
  `# ${INCIDENT_ID} — Application outage after a firewall maintenance window`,
  '',`**Scenario:** Synthetic NGFW policy-shadowing exercise`,
  `**Outcome:** ${assessment.complete?'Validated training result':'Incomplete investigation'}`,
  `**Topology revision:** ${t.revision}`,`**Score:** ${assessment.score}/100 (deterministic evidence gates, not a professional writing grade)`,
  '', '## Scope and limitations',
  'All devices, packets, addresses, commands, events and observations in this report are simulated in the browser. No production system was tested.',
  '', '## Reported symptoms',
  'An authorized analyst cannot reach an HTTPS service in the DMZ following a firewall maintenance change.',
  '', '## Root cause hypothesis',state.diagnosis||'Not recorded',
  '', '## Selected evidence references',
  `- Root cause: ${state.citations.root||'Not selected'}`,
  `- Successful retest: ${state.citations.success||'Not selected'}`,
  `- Isolation proof: ${state.citations.isolation||'Not selected'}`,
  '', '## Technical analysis',state.analysis||'Not provided',
  '', '## Business and security impact',state.impact||'Not provided',
  '', '## Remediation',state.remediation||'Not provided',
  '', '## Verification and retest',state.retest||'Not provided',
  '', '## Evidence index',
  ...state.evidence.map(e=>`- **${e.id}** (${e.kind}, topology revision ${e.revision}): ${e.label}${e.code?` — ${e.code}`:''}`),
  '', '## Evidence excerpts',
  ...state.evidence.flatMap(e=>[`### ${e.id}: ${e.label}`,'```text',escapeFence(e.output),'```','']),
  '## Changes',...state.actions.map(a=>`- Revision ${a.revision}: ${a.description}`),
  '', '## Unmet checks',...(assessment.findings.length?assessment.findings.map(f=>`- ${f}`):['- None'])
 ];return lines.join('\n');
}
/** Checks that the shared model remains coherent after user edits (including other workbenches). */
export function deterministicOutcome(t:Topology){const sample=EXERCISES[SCENE_ID].positive;return {trace:simulate(t,sample),evaluation:evaluate(t,EXERCISES[SCENE_ID])};}
