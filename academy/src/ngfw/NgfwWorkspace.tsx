import NativeEnterprisePanel from '../enterprise/NativeEnterprisePanel';
import EnterpriseLink from '../enterprise/EnterpriseLink';
import {useMemo,useState} from 'react';
import {
  Activity,ArrowDown,ArrowRight,ArrowUp,CheckCircle2,ChevronRight,
  CircleAlert,CircleCheck,Eye,FlaskConical,HelpCircle,
  Lock,Network,Play,RotateCcw,Route,Server,Settings2,Shield,ShieldAlert,ShieldCheck,
  ShieldX,Terminal,Wifi
} from 'lucide-react';
import {
 CASES,REPLY,TRAFFIC,evaluate,freshConfig,isResolved,scenarioConfig,
 type AppId,type Evaluation,type LabConfig,type SecurityRule,type Session,type Traffic,type Zone
} from './engine';
type Pane='policy'|'nat'|'inspection'|'sessions'|'logs';
type StreamEntry={id:number;time:string;text:string;verdict:string};
const stamp=()=>new Date().toLocaleTimeString([], {hour12:false});
function StepIcon({state}:{state:'pass'|'drop'|'info'}){
 return state==='pass'?<CircleCheck size={16}/>:state==='drop'?<CircleAlert size={16}/>:<Activity size={16}/>;
}
function FlowMap({result,chosen,onChoose}:{result:Evaluation|null;chosen:number;onChoose:(id:number)=>void}){
 const phases=['Ingress','Session setup / fastpath','Application identification','Content inspection','Forwarding / egress'] as const;
 return <section className="ng-card ng-flow"><div className="ng-card-heading"><div><span className="ng-overline">PACKET PROCESSING</span><h3>NGFW decision flow</h3></div><span className="ng-mini-pill">PA-inspired · simplified model</span></div>
  {!result?<div className="ng-empty"><Activity size={28}/><strong>No trace yet</strong><span>Run a simulated flow to inspect each decision point.</span></div>:<>
   <div className="ng-phases">{phases.map(phase=>{const points=result.steps.map((s,i)=>({...s,i})).filter(s=>s.phase===phase);return <div className={`ng-phase ng-phase-${phase.startsWith('Ingress')?'ingress':phase.startsWith('Session')?'session':phase.startsWith('Application')?'appid':phase.startsWith('Content')?'content':'egress'}`} key={phase}>
    <div className="ng-phase-head"><span className="ng-phase-rail"/><strong>{phase}</strong><small>{points.length} STAGES</small></div>
    <div className="ng-phase-items">{points.length?points.map(point=><button key={point.i} className={`ng-step ng-step-${point.state} ${chosen===point.i?'is-selected':''}`} onClick={()=>onChoose(point.i)} aria-pressed={chosen===point.i}>
       <StepIcon state={point.state}/><span><strong>{point.title}</strong><small>{point.state==='drop'?'DROP':point.state==='pass'?'PASS':'CHECK'}</small></span><ChevronRight size={14}/>
     </button>):<span className="ng-not-visited">Not reached</span>}</div>
   </div>})}</div>
   <div className="ng-stage-detail"><div className="ng-stage-detail-head"><strong>Decision inspection</strong><span>STEP {Math.min(chosen+1,result.steps.length)} / {result.steps.length}</span></div><h4>{result.steps[Math.min(chosen,result.steps.length-1)].title}</h4><p>{result.steps[Math.min(chosen,result.steps.length-1)].detail}</p><code>{result.steps[Math.min(chosen,result.steps.length-1)].evidence}</code></div>
  </>}
 </section>;
}
function NetworkView({result}:{result:Evaluation|null}){
 const allowed=result?.verdict==='allow';const stopped=result?.verdict==='deny';
 return <section className="ng-card ng-topology"><div className="ng-card-heading"><div><span className="ng-overline">NETWORK TOPOLOGY</span><h3>Traffic path</h3></div><span className="ng-mini-pill ng-green-label">ISOLATED SIMULATION</span></div>
  <div className="ng-network-board">
   <div className="ng-net-line ng-net-line-left"/><div className="ng-net-line ng-net-line-right"/>
   <div className="ng-net-device"><span className="ng-dev-icon"><Terminal size={20}/></span><strong>Source</strong><code>{result?result.original.split(':')[0]:'10.10.10.15'}</code><small>Trust / Untrust</small></div>
   <div className={`ng-net-device ng-firewall-dev ${stopped?'ng-blocked':allowed?'ng-permitted':''}`}><span className="ng-dev-icon"><Shield size={22}/></span><strong>NGFW</strong><code>Policy · NAT · App-ID</code><small>{stopped?'TRAFFIC BLOCKED':allowed?'PACKET ACCEPTED':'AWAITING PACKET'}</small></div>
   <div className={`ng-net-device ${stopped?'ng-muted':''}`}><span className="ng-dev-icon"><Server size={20}/></span><strong>Destination</strong><code>{result?result.translated.split(' → ')[1]?.split(':')[0]:'10.20.20.10'}</code><small>Final egress</small></div>
  </div>
  {result&&<div className="ng-translation"><span>ORIGINAL <code>{result.original}</code></span><ArrowRight size={14}/><span>TRANSLATED <code>{result.translated}</code></span></div>}
 </section>;
}
const zoneOptions:['any',Zone,Zone,Zone]=['any','trust','untrust','dmz'];
const appOptions:['any',AppId,AppId,AppId,AppId]=['any','ssl','ssh','dns','web-browsing'];
function PolicyPane({config,onChange}:{config:LabConfig;onChange:(c:LabConfig)=>void}){
 const patch=(id:string,values:Partial<SecurityRule>)=>onChange({...config,security:config.security.map(r=>r.id===id?{...r,...values}:r)});
 const move=(index:number,offset:number)=>{const next=[...config.security];const to=index+offset;if(to<0||to>=next.length)return;[next[index],next[to]]=[next[to],next[index]];onChange({...config,security:next});};
 return <><p className="ng-tool-help">Ordered first-match policy. Security rules use the <b>pre-NAT destination address</b> and <b>post-NAT destination zone</b>.</p>
  <div className="ng-rule-list">{config.security.map((r,i)=><div className={`ng-rule ${!r.enabled?'ng-disabled':''}`} key={r.id}><div className="ng-rule-top"><span className="ng-index">{String(i+1).padStart(2,'0')}</span><strong>{r.name}</strong><span className={`ng-tag ng-tag-${r.action}`}>{r.action.toUpperCase()}</span></div>
    <div className="ng-rule-details"><span>{r.from} → {r.to}</span><span>App: {r.app}</span><span>Service: {r.service}</span><span>Destination: {r.destination}</span></div>
    <div className="ng-rule-edit"><label>TO ZONE<select value={r.to} onChange={e=>patch(r.id,{to:e.target.value as Zone|'any'})}>{zoneOptions.map(z=><option key={z}>{z}</option>)}</select></label>
    <label>APP-ID<select value={r.app} onChange={e=>patch(r.id,{app:e.target.value as AppId|'any'})}>{appOptions.map(a=><option key={a}>{a}</option>)}</select></label>
    <label className="ng-check"><input type="checkbox" checked={r.enabled} onChange={e=>patch(r.id,{enabled:e.target.checked})}/> Enabled</label>
    <div className="ng-move"><button title="Move rule up" onClick={()=>move(i,-1)} disabled={i===0}><ArrowUp size={15}/></button><button title="Move rule down" onClick={()=>move(i,1)} disabled={i===config.security.length-1}><ArrowDown size={15}/></button></div></div>
   </div>)}
   <div className="ng-defaults">LAST · <b>intrazone-default</b> allows · <b>interzone-default</b> denies</div>
  </div></>;
}
function NatPane({config,onChange}:{config:LabConfig;onChange:(c:LabConfig)=>void}){
 return <><p className="ng-tool-help">NAT selection uses the original packet and matching zone. Destination NAT changes the forwarding zone before security policy evaluation.</p>
  {config.nat.map(r=><div className="ng-nat" key={r.id}><div className="ng-nat-head"><span className="ng-tag ng-tag-nat">{r.type.toUpperCase()}</span><strong>{r.name}</strong><label className="ng-switch"><input type="checkbox" checked={r.enabled} onChange={e=>onChange({...config,nat:config.nat.map(n=>n.id===r.id?{...n,enabled:e.target.checked}:n)})}/><span>{r.enabled?'ON':'OFF'}</span></label></div>
    <div className="ng-nat-flow"><code>{r.original}</code><ArrowRight size={17}/><code>{r.translated}</code></div><small>Ingress: {r.from} · {r.port===null?'Any service':`TCP/${r.port}`}</small>
   </div>)}
  <div className="ng-setting-row"><div><strong>Route to DMZ subnet</strong><small>10.20.20.0/24 → dmz · Required after DNAT</small></div><label className="ng-switch"><input type="checkbox" checked={config.dmzRoute} onChange={e=>onChange({...config,dmzRoute:e.target.checked})}/><span>{config.dmzRoute?'ON':'OFF'}</span></label></div>
  </>;
}
function InspectPane({config,onChange}:{config:LabConfig;onChange:(c:LabConfig)=>void}){
 return <><p className="ng-tool-help">These switches are <strong>educational abstractions</strong>. Real TLS decryption requires trust, certificate handling, exclusions, and decryption policy. Threat inspection requires appropriate security profiles.</p>
  <div className="ng-setting-row"><div><strong><Eye size={15}/> TLS decryption</strong><small>Make the synthetic payload visible to inspection</small></div><label className="ng-switch"><input type="checkbox" checked={config.decrypt} onChange={e=>onChange({...config,decrypt:e.target.checked})}/><span>{config.decrypt?'ON':'OFF'}</span></label></div>
  <div className="ng-setting-row"><div><strong><ShieldAlert size={15}/> Threat Prevention</strong><small>Enable processing of the LAB-TEST-001 signature</small></div><label className="ng-switch"><input type="checkbox" checked={config.threatPrevention} onChange={e=>onChange({...config,threatPrevention:e.target.checked})}/><span>{config.threatPrevention?'ON':'OFF'}</span></label></div>
  <div className="ng-inline-tip"><ShieldCheck size={16}/> An allow rule also needs an attached security profile. This is represented by a rule's fixed <code>profile</code> flag in v0.2.</div>
  <div className="ng-inspection-mini"><strong>Inspection pipeline</strong><span>TLS visibility → App-ID → Security profile → Content action</span><span>Educational model, not an operational detection engine</span></div></>;
}
function SessionsPane({sessions,onReset}:{sessions:Session[];onReset:()=>void}){
 return <><div className="ng-pane-row"><p className="ng-tool-help">Stateful sessions are held in browser memory. Policy changes reset them in this lab to make the outcome deterministic.</p><button className="ng-quiet-btn" onClick={onReset}><RotateCcw size={14}/> Clear</button></div>
 {sessions.length? sessions.map(s=><div className="ng-session" key={s.id}><div><strong>SESSION #{s.id}</strong><span>{s.application} · {s.packets} packet(s)</span></div><code>{s.original.src}:{s.original.sport} → {s.original.dst}:{s.original.dport}</code><small>Translated: {s.translated.src} → {s.translated.dst}</small><small>Rule: {s.rule}</small></div>):<div className="ng-nodata"><Network size={24}/> No sessions installed. Send allowed traffic to create one.</div>}
 </>;
}
function LogsPane({logs}:{logs:StreamEntry[]}){
 return <><p className="ng-tool-help">Synthetic traffic log stream. Not real PAN-OS logs, Sysmon events, or SIEM telemetry.</p>{logs.length?logs.map(e=><div className="ng-log" key={e.id}><div><span className={`ng-log-dot ng-log-${e.verdict}`}/><code>{e.time}</code><span className={`ng-tag ng-tag-${e.verdict}`}>{e.verdict.toUpperCase()}</span></div><p>{e.text}</p></div>):<div className="ng-nodata">No events. Run a simulation.</div>}</>;
}
export default function NgfwWorkspace({troubleshoot=false}:{troubleshoot?:boolean}){
 const [caseId,setCaseId]=useState<string>('dnat');
 const [trafficId,setTrafficId]=useState<string>(troubleshoot?'inbound':'outbound');
 const [config,setConfig]=useState<LabConfig>(()=>troubleshoot?scenarioConfig('dnat'):freshConfig());
 const [sessions,setSessions]=useState<Session[]>([]);
 const [trace,setTrace]=useState<Evaluation|null>(()=>troubleshoot?evaluate(TRAFFIC[1],scenarioConfig('dnat'),[]):null);
 const [stepIndex,setStepIndex]=useState(0);
 const [pane,setPane]=useState<Pane>('policy');
 const [logs,setLogs]=useState<StreamEntry[]>([]);
 const [missionFeedback,setMissionFeedback]=useState<'success'|'fail'|null>(null);
 const [showHint,setShowHint]=useState(false);
 const [completed,setCompleted]=useState<string[]>(()=>{try{const data=JSON.parse(localStorage.getItem('cyberlab-ngfw-solved-v2')??'[]') as unknown;return Array.isArray(data)?data.filter((x):x is string=>typeof x==='string'):[];}catch{return [];}});
 const currentCase=CASES.find(c=>c.id===caseId)!;
 const selectedTraffic=useMemo(()=>TRAFFIC.find(t=>t.id===trafficId)??TRAFFIC[0],[trafficId]);
 const selectCase=(id:string)=>{
  const problem=CASES.find(c=>c.id===id)??CASES[0];const next=scenarioConfig(problem.id);
  setCaseId(problem.id);setConfig(next);setTrafficId(problem.traffic);setSessions([]);
  const baseline=evaluate(TRAFFIC.find(t=>t.id===problem.traffic)!,next,[]);
  setTrace(baseline);setStepIndex(Math.max(0,baseline.steps.findIndex(s=>s.state==='drop')));
  setMissionFeedback(null);setShowHint(false);setLogs([]);setPane('policy');
 };
 const changeConfig=(c:LabConfig)=>{setConfig(c);setSessions([]);setTrace(null);setMissionFeedback(null);};
 const run=(p:Traffic)=>{
  const e=evaluate(p,config,sessions);setTrace(e);
  const failed=e.steps.findIndex(s=>s.state==='drop');setStepIndex(failed>=0?failed:e.steps.length-1);
  if(e.session){setSessions(previous=>{
   if(e.sessionHit)return previous.map(s=>s.id===e.session!.id?e.session!:s);
   return [...previous,e.session!];
  });}
  setLogs(old=>[{id:Date.now(),time:stamp(),verdict:e.verdict,text:`${p.label}: ${e.reason}${e.matchedNat?` · NAT ${e.matchedNat}`:''}`} ,...old].slice(0,50));
  setMissionFeedback(null);
 };
 const checkFix=()=>{
  const problemTraffic=TRAFFIC.find(t=>t.id===currentCase.traffic)!;
  // Always re-evaluate using a fresh session table, avoiding stale successful results.
  const proof=evaluate(problemTraffic,config,[]);
  setTrace(proof);setStepIndex(Math.max(0,proof.steps.findIndex(s=>s.state==='drop')));
  const passed=isResolved(caseId,config,proof);setMissionFeedback(passed?'success':'fail');
  if(passed&&!completed.includes(caseId)){
   const next=[...completed,caseId];setCompleted(next);localStorage.setItem('cyberlab-ngfw-solved-v2',JSON.stringify(next));
  }
 };
 const reset=()=>{
  const next=troubleshoot?scenarioConfig(caseId):freshConfig();setConfig(next);setSessions([]);setLogs([]);
  setTrace(troubleshoot?evaluate(selectedTraffic,next,[]):null);setStepIndex(0);setMissionFeedback(null);
 };
 const panels:{key:Pane;label:string;icon:typeof Shield}[]=[
  {key:'policy',label:'Security',icon:Shield},{key:'nat',label:'NAT & routes',icon:Route},
  {key:'inspection',label:'Inspection',icon:Eye},{key:'sessions',label:'Sessions',icon:Activity},
  {key:'logs',label:'Logs',icon:Terminal}];
 return <div className="ng-workspace"><EnterpriseLink focus="firewall" origin="NGFW Simulator"/><NativeEnterprisePanel mode="firewall"/>
  <header className="ng-hero"><div><div className="ng-eyebrow"><span/> {troubleshoot?'INCIDENT RESPONSE · HANDS-ON PRACTICE':'NETWORK SECURITY · INTERACTIVE MODULE'}</div><h1>{troubleshoot?'NGFW Troubleshooting':'Inside the Next-Gen Firewall'}</h1><p>{troubleshoot?'Identify the faulty stage, inspect evidence, change the configuration, and prove your fix with a fresh test.':'Follow a packet through ingress, session lookup, NAT, zone-based policy, App-ID, content inspection, and egress.'}</p></div><div className="ng-hero-badges"><span><FlaskConical size={15}/> BROWSER SIMULATION</span><span><Lock size={15}/> NO LIVE TRAFFIC</span></div></header>
  <div className="ng-columns"><div className="ng-main-col">
   {troubleshoot&&<section className="ng-card ng-mission"><div className="ng-card-heading"><div><span className="ng-overline">DIAGNOSTIC MISSIONS · {completed.length}/{CASES.length} SOLVED</span><h3>Choose an incident</h3></div><span className="ng-mini-pill">CAUSE → EVIDENCE → FIX</span></div>
      <select className="ng-case-select" value={caseId} onChange={e=>selectCase(e.target.value)}>{CASES.map(c=><option value={c.id} key={c.id}>{completed.includes(c.id)?'✓ ':''}{c.name}</option>)}</select>
      <div className="ng-mission-info"><span className="ng-tag ng-tag-nat">{currentCase.level}</span><strong>{currentCase.goal}</strong><p>{currentCase.symptom}</p></div>
      <div className="ng-mission-actions"><button className="ng-quiet-btn" onClick={()=>setShowHint(v=>!v)}><HelpCircle size={15}/>{showHint?'Hide hint':'Need a hint?'}</button><button className="ng-primary" onClick={checkFix}><CheckCircle2 size={16}/> Verify fix</button></div>
      {showHint&&<div className="ng-hint"><HelpCircle size={15}/>{currentCase.hint}</div>}
      {missionFeedback&&<div className={`ng-result ng-result-${missionFeedback==='success'?'allow':'deny'}`}><strong>{missionFeedback==='success'?'Incident resolved. Fix verified on a fresh session.':'Not resolved yet.'}</strong><span>{missionFeedback==='success'?'The expected causal result was observed.':'Use the trace to find the failing stage, then retest.'}</span></div>}
    </section>}
   <NetworkView result={trace}/>
   <section className="ng-card ng-generator"><div className="ng-card-heading"><div><span className="ng-overline">PACKET GENERATOR</span><h3>Simulate an application flow</h3></div><span className="ng-mini-pill">SYNTHETIC DATA ONLY</span></div>
    <div className="ng-generator-line"><label>TRAFFIC SCENARIO<select value={trafficId} onChange={e=>{setTrafficId(e.target.value);setTrace(null);setMissionFeedback(null);}}>{TRAFFIC.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></label><button className="ng-primary" onClick={()=>run(selectedTraffic)}><Play size={16} fill="currentColor"/> Send packet</button></div>
    <p className="ng-traffic-summary">{selectedTraffic.summary} · <code>{selectedTraffic.proto.toUpperCase()} / {selectedTraffic.dport}</code> · App-ID: <code>{selectedTraffic.app}</code></p>
    <div className="ng-generator-buttons"><button onClick={()=>run(REPLY)}><ArrowRight size={14}/> Simulate return ACK</button><button onClick={()=>{setSessions([]);setTrace(null);}}><RotateCcw size={14}/> Clear session table</button><button onClick={reset}><Settings2 size={14}/> Reset lab</button></div>
    {trace&&<div className={`ng-decision ng-decision-${trace.verdict}`}><div>{trace.verdict==='allow'?<ShieldCheck size={22}/>:<ShieldX size={22}/>}<strong>{trace.verdict==='allow'?'TRAFFIC ALLOWED':'TRAFFIC DENIED'}</strong><span>{trace.sessionHit?'SESSION HIT':'NEW SESSION PATH'}</span></div><p>{trace.reason}</p><small>{trace.zones?`${trace.zones.from.toUpperCase()} → ${trace.zones.to.toUpperCase()}`:'Before zone-policy evaluation'} · {trace.matchedRule??'No explicit policy match'} · {trace.matchedNat??'No NAT'}</small></div>}
   </section>
   <FlowMap result={trace} chosen={stepIndex} onChoose={setStepIndex}/>
   <div className="ng-accuracy"><CircleAlert size={17}/><p><strong>Accuracy boundary:</strong> inspired by the packet-flow diagram you supplied and documented PAN-OS concepts, not a literal reproduction of PAN-OS internals. Application signatures, TLS decryption, TCP state, NAT, and threat inspection are modeled selectively, not implemented as real dataplane functions.</p></div>
  </div><aside className="ng-tools"><div className="ng-tools-head"><div><Settings2 size={18}/><strong>Firewall workbench</strong></div><span className="ng-ready"><i/> READY</span></div>
   <div className="ng-tools-tabs">{panels.map(t=><button key={t.key} onClick={()=>setPane(t.key)} className={pane===t.key?'active':''} title={t.label}><t.icon size={15}/><span>{t.label}</span></button>)}</div>
   <div className="ng-tools-body"><div className="ng-pane-label">{panels.find(x=>x.key===pane)?.label.toUpperCase()} CONFIGURATION</div>
    {pane==='policy'&&<PolicyPane config={config} onChange={changeConfig}/>}
    {pane==='nat'&&<NatPane config={config} onChange={changeConfig}/>}
    {pane==='inspection'&&<InspectPane config={config} onChange={changeConfig}/>}
    {pane==='sessions'&&<SessionsPane sessions={sessions} onReset={()=>{setSessions([]);setTrace(null);}}/>}
    {pane==='logs'&&<LogsPane logs={logs}/>}
   </div><div className="ng-tools-foot"><Wifi size={15}/><p>All traffic, logs, NAT, and sessions are simulated locally. No firewall or endpoint is contacted.</p></div>
  </aside></div>
 </div>;
}
