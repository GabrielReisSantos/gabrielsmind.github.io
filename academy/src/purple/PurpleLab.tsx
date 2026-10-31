import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,BookOpen,CheckCircle2,ClipboardCheck,Download,Eye,FileText,KeyRound,Lock,Play,RotateCcw,Search,Shield,ShieldAlert,Terminal,Workflow} from 'lucide-react';
import {useChallengeClock,useDifficulty,ExamGate} from '../challenge/DifficultyProvider';
import {SCENARIOS,scenarioById,newState,setControl,setRule,seedLegitimate,startRun,runCommand,pinEvidence,alertsFor,gradePurple,completedReport,controlLabels,relevantAudits,relevantFixes,unsafeFixes,type PurpleState,type ScenarioId,type EventRecord,type Rule} from './engine';
import CorrelationRibbon from './CorrelationRibbon';
import './purple.css';
const STORAGE='cyberlab-v19-purple-progress';
const COMPLETE='cyberlab-v19-purple-completed';
function restore(scenario:ScenarioId):PurpleState{
 try{const s=JSON.parse(localStorage.getItem(`${STORAGE}-${scenario}`)??'null') as Partial<PurpleState> | null;
  if(s&&s.scenario===scenario&&typeof s.revision==='number'&&s.revision>=0&&s.revision<100000&&Array.isArray(s.events)&&s.events.length<1000&&Array.isArray(s.actions)&&s.actions.length<1000&&Array.isArray(s.evidence)&&s.evidence.length<1000&&s.controls&&typeof s.nextId==='number'&&s.nextId<10000)return s as PurpleState;
 }catch{/* corrupt or inaccessible local data */}
 return newState(scenario);
}
function saveFile(text:string,name:string){const blob=new Blob([text],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),500);}
function Topology({s}:{s:PurpleState}){
 const d=scenarioById(s.scenario),risk=s.retest?.complete?s.retest.impactWorked:s.baseline?.complete?s.baseline.impactWorked:undefined;
 return <div className="pt-topology" role="img" aria-label={`${d.attackPath.join(' to ')} modeled identity and service access path`}>
  <svg viewBox="0 0 780 145" width="100%" xmlns="http://www.w3.org/2000/svg">
   <defs><marker id="pt-arrowhead" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L8 4.5 L0 9 Z" fill="#8db3ca"/></marker></defs>
   {d.attackPath.map((node,i)=><g key={node}>
    {i<3&&<path d={`M${i*195+156} 70 L${(i+1)*195+20} 70`} stroke={risk===false?'#5ecda0':risk===true?'#e9a06e':'#89a6bd'} strokeWidth="2.5" strokeDasharray={risk===undefined?'6 6':undefined} markerEnd="url(#pt-arrowhead)"/>}
    <rect x={i*195+7} y="35" width="149" height="70" rx="10" fill={i===3?'#253449':i===1?'#203a45':'#1a3342'} stroke={risk===false?'#5dc69c':i===3?'#e1a771':'#478b97'} strokeWidth="1.6"/>
    <text x={i*195+81} y="64" fontSize="15" fill="#eef6ff" textAnchor="middle" fontWeight="700">{node}</text>
    <text x={i*195+81} y="86" fontSize="10" fill="#aec3d5" textAnchor="middle">{['START','DOMAIN / CONTROL','IDENTITY / POLICY','TARGET'][i]}</text>
   </g>)}
   <text x="390" y="129" fontSize="12" textAnchor="middle" fill={risk===true?'#f6b586':risk===false?'#91e8ba':'#9eb9cb'}>{risk===true?'Synthetic attack path demonstrated':risk===false?'Latest replay blocks unauthorized impact':'Path is a hypothesis until investigated'}</text>
  </svg>
 </div>;
}
function Timeline({events,onPin,pinnedIds}:{events:EventRecord[];onPin:(id:string)=>void;pinnedIds:Set<string>}){
 const [filter,setFilter]=useState<'all'|'attack'|'legitimate'>('all');
 const visible=events.filter(e=>filter==='all'||e.origin===filter).slice(-28).reverse();
 return <section className="pt-panel pt-logs" id="pt-telemetry"><header className="pt-panel-head"><div><span className="pt-overline">BLUE TEAM · OBSERVABILITY</span><h3><Activity size={19}/> Windows & endpoint events</h3></div><select aria-label="Filter telemetry" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="all">All events</option><option value="attack">Attack activity</option><option value="legitimate">Business activity</option></select></header>
  <p className="pt-micro">Event IDs are modeled from Windows auditing. Missing logs might indicate missing auditing, not missing activity. LAB-GPO-APPLY is fictional endpoint telemetry.</p>
  <div className="pt-log-scroll">{visible.length?visible.map(e=><article key={e.id} className={`pt-event ${e.origin==='attack'?'pt-event-risk':''}`}><div className="pt-event-meta"><span className="pt-code">{e.eventId}</span><strong>{e.host}</strong><span>{e.time} · {e.channel}</span><button type="button" disabled={pinnedIds.has(e.id)} onClick={()=>onPin(e.id)} aria-label={`Pin event ${e.id}`}>{pinnedIds.has(e.id)?<CheckCircle2 size={15}/>:<ClipboardCheck size={15}/>} {pinnedIds.has(e.id)?'Pinned':'Pin'}</button></div><p>{e.detail}</p><details><summary>View event fields · {e.id}</summary><pre>{JSON.stringify({actor:e.actor,target:e.target,...e.fields},null,2)}</pre></details></article>):<div className="pt-empty"><Eye size={21}/><strong>No events in this filter</strong><span>Enable relevant audit policy, generate normal traffic and run simulated actions.</span></div>}</div>
 </section>;
}
export default function PurpleLab(){
 const {mode}=useDifficulty(),clock=useChallengeClock('purple-v19');
 const [scenarioId,setScenarioId]=useState<ScenarioId>('kerberos');
 const [s,setS]=useState<PurpleState>(()=>restore('kerberos'));
 const [command,setCommand]=useState('');const [lastOutput,setLastOutput]=useState('Type help to see available simulated commands.');
 const [submitted,setSubmitted]=useState(false);const [solved,setSolved]=useState<string[]>(()=>{try{const a=JSON.parse(localStorage.getItem(COMPLETE)??'[]') as unknown;return Array.isArray(a)?a.filter((x):x is string=>typeof x==='string'):[];}catch{return [];}});
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{try{localStorage.setItem(`${STORAGE}-${s.scenario}`,JSON.stringify(s));window.dispatchEvent(new Event('cyberlab:progress'));}catch{/* capacity / privacy mode */}},[s]);
 const d=scenarioById(s.scenario);const alerts=useMemo(()=>alertsFor(s),[s]);const grade=useMemo(()=>gradePurple(s),[s]);
 const pinnedIds=new Set(s.evidence.map(e=>e.id));
 const submittedSuccess=submitted&&grade.pass;
 function changeScenario(id:ScenarioId){setScenarioId(id);setS(restore(id));setLastOutput('New scenario selected. Type help for simulator commands.');setCommand('');setSubmitted(false);}
 function update(next:PurpleState){setS(next);setSubmitted(false);}
 function execute(){const raw=command.trim();if(!raw)return;const result=runCommand(s,raw);if(result.ok&&result.state!==s)update(result.state);setLastOutput(result.message);setCommand('');}
 function reset(){if(!window.confirm('Reset this fictional scenario? This clears its local actions, evidence and report.'))return;setS(newState(s.scenario));setSubmitted(false);setLastOutput('Scenario reset. Audit policies and controls returned to the default lab state.');}
 function submit(){setSubmitted(true);if(grade.pass){const updated=[...new Set([...solved,s.scenario])];setSolved(updated);try{localStorage.setItem(COMPLETE,JSON.stringify(updated));window.dispatchEvent(new Event('cyberlab:progress'));}catch{/* storage disabled */}}}
 const actions=s.actions.slice(-9).reverse();
 return <main className="pt-root"><section className="pt-hero"><div><span className="pt-overline"><Shield size={15}/> CYBERLAB · PURPLE TEAM RANGE · V2.0</span><h1>Attack. Observe. <em>Harden. Replay.</em></h1><p>Act against a fictional Active Directory environment, investigate the resulting telemetry, write a detection, close the weakness, and prove legitimate activity still succeeds.</p><div className="pt-chips"><span>Red + Blue in one workspace</span><span>Realistic audit conditions</span><span>3 fictional AD scenarios</span><span>No real network execution</span></div></div><div className="pt-progress"><span>VALIDATED SCENARIOS</span><strong>{solved.length}<small> / 3</small></strong><div className="pt-progress-track"><span style={{width:`${Math.min(100,solved.length/3*100)}%`}}/></div><small>Independent browser-local practice</small></div></section>
  <div className="pt-scenarios" aria-label="Purple Team scenarios">{SCENARIOS.map((sc,i)=><button key={sc.id} className={scenarioId===sc.id?'active':''} onClick={()=>changeScenario(sc.id)}><span className="pt-case-id">CASE 0{i+1}</span><strong>{sc.title}</strong><small>{sc.subtitle}</small>{solved.includes(sc.id)&&<CheckCircle2 size={16} color="#86e9bd"/>}</button>)}</div>
  <section className="pt-mission"><div><span className="pt-overline">MISSION BRIEF · {mode.toUpperCase()} DIFFICULTY</span><h2>{d.title}</h2><p>{d.objective}</p><div className="pt-tags">{d.tags.map(t=><span key={t}>{t}</span>)}</div></div><button className="pt-outline" onClick={reset}><RotateCcw size={17}/> Reset case</button></section>
  <nav className="pt-journey" aria-label="Investigation workflow"><div className="pt-journey-title"><span className="pt-overline">INVESTIGATION WORKFLOW</span><strong>Follow the evidence from action to repair</strong></div><div className="pt-journey-stages">{[
   {id:'pt-red',label:'Attack',hint:'Simulate and observe',complete:Boolean(s.baseline?.complete),count:`${s.actions.length} actions`},
   {id:'pt-telemetry',label:'Telemetry',hint:'Find supporting evidence',complete:s.events.length>0,count:`${s.events.length} events`},
   {id:'pt-defense',label:'Harden',hint:'Fix the root cause',complete:Boolean(s.retest?.complete&&!s.retest.impactWorked),count:`Revision ${s.revision}`},
   {id:'pt-report',label:'Verify',hint:'Test and submit report',complete:grade.pass,count:`${s.evidence.length} pinned`},
  ].map((step,i)=><button key={step.id} type="button" className={`pt-journey-stage ${step.complete?'complete':''}`} onClick={()=>document.getElementById(step.id)?.scrollIntoView({behavior:'smooth',block:'start'})}><span className="pt-journey-index">{step.complete?<CheckCircle2 size={15}/>:String(i+1).padStart(2,'0')}</span><span className="pt-journey-label"><strong>{step.label}</strong><small>{step.hint}</small><em>{step.count}</em></span><ArrowRight size={15}/></button>)}</div></nav>
  <Topology s={s}/>
  <CorrelationRibbon state={s} onPin={id=>update(pinEvidence(s,id))}/>
  <ExamGate clock={clock}><>
  <div className="pt-two"><section className="pt-panel" id="pt-red"><header className="pt-panel-head"><div><span className="pt-overline">RED TEAM · SYNTHETIC ACTIONS</span><h3><Terminal size={19}/> Investigation terminal</h3></div><span className="pt-muted">{s.attempt?`${s.attempt.phase} · ${s.attempt.next}/3`:'No active run'}</span></header>
   <p className="pt-micro">This command language is CyberLab-specific, not PowerShell. It never runs an attack tool or contacts a domain controller.</p>
   <div className="pt-run-actions"><button className="pt-mainbtn" onClick={()=>{update(startRun(s,'baseline'));setLastOutput('Baseline started. Type the first investigation command.');}}><Play size={15}/> {s.baseline?'Repeat baseline':'Start baseline'}</button><button className="pt-outline" disabled={!s.baseline?.complete} onClick={()=>{update(startRun(s,'retest'));setLastOutput('Retest started. Re-run the three stages after hardening.');}}><RotateCcw size={15}/> Start repair retest</button></div>
   <ol className="pt-steps">{d.commands.map((cmd,i)=><li key={cmd} className={s.attempt?.next===i?'current':''}><span>{i+1}</span><div><code>{mode==='beginner'||mode==='intermediate'||expanded?cmd:`Step ${i+1} · independent`}</code><small>{d.instructions[i]}</small></div></li>)}</ol>
   <div className="pt-console"><div className="pt-console-title"><span className="pt-console-led"/> simulated shell <span>corp.cyberlab.test</span></div><div aria-live="polite" className="pt-command-output"><pre>{lastOutput}</pre></div><form onSubmit={e=>{e.preventDefault();execute();}}><label htmlFor="pt-command">Command</label><div className="pt-inputrow"><input id="pt-command" value={command} spellCheck={false} autoComplete="off" onChange={e=>setCommand(e.target.value)} placeholder="Type help or a scenario action"/><button type="submit"><ArrowRight size={18}/><span className="pt-sr">Execute simulated command</span></button></div></form></div>
   {mode!=='exam'&&<button className="pt-link" onClick={()=>setExpanded(v=>!v)}><BookOpen size={16}/> {expanded?'Hide':'Show'} command reference</button>}
   {expanded&&mode!=='exam'&&<div className="pt-callout"><p>Available scenario commands:</p>{d.commands.map(c=><code key={c}>{c}</code>)}<p>Support: <code>help</code>, <code>show events</code>, <code>show controls</code>, <code>show evidence</code>, <code>test legitimate</code>.</p></div>}
   <h4 className="pt-subhead"><Search size={16}/> Recent red-team actions</h4><div className="pt-actions-list">{actions.length?actions.map(a=><div key={a.id}><span><code>{a.command}</code> <small>{a.phase} · {a.status}</small></span><button onClick={()=>update(pinEvidence(s,a.id))} disabled={pinnedIds.has(a.id)}>{pinnedIds.has(a.id)?'Pinned':'Pin output'}</button></div>):<p className="pt-muted">No actions yet. Start a baseline and type the first command.</p>}</div>
  </section><Timeline events={s.events} pinnedIds={pinnedIds} onPin={id=>update(pinEvidence(s,id))}/></div>
  <div className="pt-two"><section className="pt-panel" id="pt-detection"><header className="pt-panel-head"><div><span className="pt-overline">BLUE TEAM · DETECTION ENGINEERING</span><h3><ShieldAlert size={19}/> Detect and tune</h3></div><span className="pt-count">{alerts.length} alert(s)</span></header>
   <p>Run ordinary activity and the attack. Compare broad and tuned rules; a detection must identify the suspicious behavior without automatically flagging approved operations.</p>
   <button className="pt-outline" onClick={()=>update(seedLegitimate(s))}><Activity size={16}/> Generate approved business activity</button>
   <label className="pt-label" htmlFor="pt-rule">Detection logic</label><select id="pt-rule" value={s.rule} onChange={e=>update(setRule(s,e.target.value as Rule))}><option value="off">Disabled — no alerts</option><option value="broad">Broad — event ID only (noisy)</option><option value="tuned">Tuned — correlate actor, target and context</option></select>
   <div className="pt-detection-results"><strong>{alerts.length} simulated match(es)</strong><span>{alerts.some(e=>e.origin==='legitimate')?'False-positive risk: approved activity triggered this rule.':alerts.length?'Matches exclude the modeled legitimate reference events.':'No matching events yet. Check the audit controls and attack timeline.'}</span></div>
   <details className="pt-details"><summary>What the detection can and cannot prove</summary><p>Event IDs are evidence of actions or requests, not proof of compromise. The lab knows its synthetic ground truth; a real SOC requires baselining, normalization, and independent context. TGS requests and normal password resets can generate the same broad event types.</p></details>
  </section><section className="pt-panel" id="pt-defense"><header className="pt-panel-head"><div><span className="pt-overline">DEFENSE · HARDENING</span><h3><Lock size={19}/> Policy and permissions</h3></div><span className="pt-count">Revision {s.revision}</span></header>
   <p>Change only controls justified by your evidence. Configuration edits invalidate the previous retest; earlier events remain historical evidence. Test approved access independently using <code>test legitimate</code>.</p>
   <h4 className="pt-subhead"><Eye size={16}/> Telemetry prerequisites</h4>{relevantAudits[s.scenario].map(key=><label className="pt-toggle" key={key}><input type="checkbox" checked={s.controls[key]} onChange={e=>update(setControl(s,key,e.target.checked))}/><span>{controlLabels[key]}</span></label>)}
   <h4 className="pt-subhead"><Shield size={16}/> Security controls</h4>{relevantFixes[s.scenario].map(key=><label className="pt-toggle" key={key}><input type="checkbox" checked={s.controls[key]} onChange={e=>update(setControl(s,key,e.target.checked))}/><span>{controlLabels[key]}</span></label>)}
   <h4 className="pt-subhead"><ShieldAlert size={16}/> Unsafe shortcut (try and observe)</h4><label className="pt-toggle pt-unsafe"><input type="checkbox" checked={s.controls[unsafeFixes[s.scenario]]} onChange={e=>update(setControl(s,unsafeFixes[s.scenario],e.target.checked))}/><span>{controlLabels[unsafeFixes[s.scenario]]}</span></label>
   <div className="pt-callout"><strong>Safety validation</strong><p>{d.legitimate}</p><p><CheckCircle2 size={15}/> An approved-access probe must succeed in the current configuration; broad shutdowns will fail the grader. The grader checks the unauthorized path and audit visibility too.</p></div>
  </section></div>
  <section className="pt-panel pt-report" id="pt-report"><header className="pt-panel-head"><div><span className="pt-overline">PURPLE TEAM · PROOF & REPORT</span><h3><FileText size={20}/> Explain the attack, evidence and fix</h3></div><button className="pt-outline" onClick={()=>saveFile(completedReport(s),`cyberlab-purple-${s.scenario}.md`)}><Download size={16}/> Export evidence report</button></header>
   <div className="pt-report-grid"><div><label className="pt-label" htmlFor="pt-diagnosis">Primary root cause</label><select id="pt-diagnosis" value={s.diagnosis} onChange={e=>update({...s,diagnosis:e.target.value})}><option value="">Select after investigation</option>{d.diagnoses.map(x=><option value={x} key={x}>{x}</option>)}</select><div className="pt-education"><strong>Why this matters</strong><p>{d.weakness}</p><p><strong>Defensive principle:</strong> {d.repair}</p><p><strong>Expected telemetry:</strong> {d.telemetry}</p></div></div><div><label className="pt-label" htmlFor="pt-notes">Your technical assessment</label><textarea id="pt-notes" rows={8} placeholder="Describe what you observed, event IDs and relevant fields, why the condition was exploitable, and how you verified the change without breaking authorized work." value={s.notes} onChange={e=>update({...s,notes:e.target.value})}/><p className="pt-micro">Technical writing is self-reviewed. The local rubric checks references and state, not semantic truth.</p></div></div>
   <div className="pt-evidence-summary"><strong>Pinned evidence ({s.evidence.length})</strong><div>{s.evidence.length?s.evidence.map(e=><span key={e.id}>{e.id} · {e.phase}</span>):<span>No evidence pinned yet. Pin a baseline event and post-remediation result.</span>}</div></div>
   <div className="pt-submit"><button className="pt-mainbtn" onClick={submit}><ClipboardCheck size={17}/> Submit technical investigation</button><span>{submittedSuccess?'Scenario passed: observed, tuned, hardened and safely replayed.':submitted?'Unmet requirements remain. Review the gates below.':'Complete the baseline, detection, remediation, retest, and evidence report.'}</span></div>
   {(mode!=='exam'||submitted)&&<div className="pt-grade" aria-live="polite"><h4><Workflow size={17}/> Validation criteria</h4>{grade.gates.map(g=><div key={g.name} className={g.pass?'passed':'pending'}><span>{g.pass?<CheckCircle2 size={17}/>:<ShieldAlert size={17}/>}</span><div><strong>{g.name}</strong><small>{g.explanation}</small></div></div>)}</div>}
  </section></></ExamGate>
  <p className="pt-footer"><KeyRound size={15}/> CyberLab uses a fully fictional environment. Windows event availability depends on audit settings and host roles. No credential attacks, remote code or live network traffic are executed.</p>
 </main>;
}
