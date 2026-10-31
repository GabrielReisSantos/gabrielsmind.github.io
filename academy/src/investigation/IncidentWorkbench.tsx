import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,BookOpen,CheckCircle2,ChevronRight,ClipboardList,Download,FileSearch,Network,RotateCcw,Shield,Terminal,TriangleAlert} from 'lucide-react';
import NetworkMap2D from '../threeD/NetworkMap2D';
import WorldCanvas from '../threeD/WorldCanvas';
import {sceneById} from '../threeD/sceneEngine';
import {diagnostic,editCable,editPort,editRule,editRoute,moveRule,renderScene,type Topology,type Trace} from '../threeD/topologyEngine';
import {ExamGate,useChallengeClock,useDifficulty} from '../challenge/DifficultyProvider';
import {storeLocation} from '../learning/progress';
import {INCIDENT_ID,INCIDENT_COMMANDS,SCENE_ID,SHARED_TOPOLOGY_KEY,INCIDENT_KEY,HYPOTHESES,assessIncident,captureBaseline,captureDiagnostic,captureRetest,initialCase,initialTopology,logAction,readCase,readSharedTopology,reportMarkdown,runProbes,saveSharedTopology,type CaseState,type IncidentCommand} from './incidentEngine';
import './incident.css';

const sceneBase=sceneById(SCENE_ID);
const alertMessages=[
 {level:'notice',source:'DNS',text:'Analyst workstation resolved app.internal.example to 10.40.10.20 (expected)'},
 {level:'notice',source:'CHANGE',text:'Firewall maintenance: security-rule order updated during scheduled window'},
 {level:'noise',source:'SYSTEM',text:'Unrelated scheduled signature update completed successfully'},
 {level:'notice',source:'ROUTE',text:'Firewall retains route 10.40.10.0/24 toward WEB-DMZ'}
];
type Tab='topology'|'timeline'|'configuration'|'report';
function downloadReport(value:string){const blob=new Blob([value],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='INC-0042-technical-report.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
export default function IncidentWorkbench({onOpenRange}:{onOpenRange?:()=>void}){
 const {mode,profile}=useDifficulty();
 const [topology,setTopology]=useState<Topology>(()=>readSharedTopology(localStorage));
 const [caseState,setCaseState]=useState<CaseState>(()=>readCase(localStorage,INCIDENT_KEY+'-'+mode));
 const clock=useChallengeClock('incident-'+INCIDENT_ID);
 const [tab,setTab]=useState<Tab>('topology');
 const [mapMode,setMapMode]=useState<'2d'|'3d'>('2d');
 const [selected,setSelected]=useState('fw');
 const [selectedCable,setSelectedCable]=useState<string|null>(null);
 const [lastTrace,setLastTrace]=useState<Trace|null>(null);
 const [playing,setPlaying]=useState(false);
 const [activeEvidence,setActiveEvidence]=useState<string|null>(null);
 const [error,setError]=useState('');
 const [reviewed,setReviewed]=useState(false);
 const [hint,setHint]=useState(false);
 const assessment=useMemo(()=>assessIncident(caseState,topology),[caseState,topology]);
 const scene=useMemo(()=>renderScene(sceneBase,topology),[topology]);
 const latest=caseState.evidence.at(-1);
 const latestBaseline=caseState.evidence.find(e=>e.kind==='baseline'&&e.passed===false);
 const alreadyRestored=!latestBaseline&&runProbes(topology).positive.pass;
 const latestRetest=[...caseState.evidence].reverse().find(e=>e.kind==='retest');
 useEffect(()=>{try{saveSharedTopology(localStorage,topology);}catch{/* storage unavailable */}},[topology]);
 useEffect(()=>{try{localStorage.setItem(INCIDENT_KEY+'-'+mode,JSON.stringify(caseState));window.dispatchEvent(new Event('cyberlab:progress'));}catch{/* storage unavailable */}},[caseState]);
 useEffect(()=>{setCaseState(s=>{const baseline=s.evidence.find(e=>e.kind==='baseline'&&e.passed===false);return baseline&&topology.revision>baseline.revision&&!s.actions.some(a=>a.revision===topology.revision)?logAction(s,topology.revision,'Topology changed via shared Cyber Range'):s;});},[topology.revision]);
 useEffect(()=>{const sync=(e:StorageEvent)=>{if(e.key===SHARED_TOPOLOGY_KEY){const next=readSharedTopology(localStorage);setTopology(next);setLastTrace(null);setPlaying(false);}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 function change(mutator:()=>Topology,description:string){try{
  const next=mutator();if(next===topology)return;
  setTopology(next);setCaseState(s=>logAction(s,next.revision,description));setLastTrace(null);setPlaying(false);setError('');
 }catch(e){setError(e instanceof Error?e.message:String(e));}}
 function capture(command:IncidentCommand){const output=diagnostic(topology,command,lastTrace);setCaseState(s=>captureDiagnostic(s,topology,command,lastTrace));setActiveEvidence(null);setTab('timeline');setError('');return output;}
 function captureProbe(baseline:boolean){const test=runProbes(topology);setLastTrace(test.positive);setPlaying(false);if(baseline)setCaseState(s=>captureBaseline(s,topology,test));else setCaseState(s=>captureRetest(s,topology,test));setTab('timeline');setActiveEvidence(null);setReviewed(false);requestAnimationFrame(()=>setPlaying(true));}
 function updateReport(field:'diagnosis'|'analysis'|'impact'|'remediation'|'retest',value:string){setCaseState(s=>({...s,[field]:value,submitted:false}));}
 function setCitation(key:'root'|'success'|'isolation',value:string){setCaseState(s=>({...s,citations:{...s.citations,[key]:value},submitted:false}));}
 function resetCase(){if(!window.confirm('Reset INC-0042? This removes the saved incident evidence and restores the original segmented-enterprise topology.'))return;setTopology(initialTopology());setCaseState(initialCase());setLastTrace(null);setPlaying(false);setError('');setTab('topology');setSelected('fw');}
 function openRange(){storeLocation('world',SCENE_ID);onOpenRange?.();}
 const evidence=activeEvidence?caseState.evidence.find(e=>e.id===activeEvidence):latest;
 const showHints=profile.hints==='inline'||(profile.hints==='limited'&&hint);
 return <main className="incident-root">
  <header className="incident-hero"><div><span className="incident-overline"><span className="dash-signal"/> FEATURED INVESTIGATION · SHARED PACKET ENGINE</span><h1>{INCIDENT_ID} <em>Application outage</em></h1><p>After a scheduled firewall change, an analyst reports that the internal DMZ application stopped responding. Work from evidence, distinguish unrelated events, repair only what is necessary, and prove that segmentation still holds.</p></div><div className="incident-hero-aside"><b>{mode.toUpperCase()}</b><span>NGFW · CHANGE INVESTIGATION</span><span>Topology revision {topology.revision}</span><small>Synthetic, isolated browser simulation</small></div></header>
  <section className="incident-taskbar"><div><Shield size={20}/><span><strong>Mission objective</strong><small>Restore TRUST → DMZ HTTPS, preserve denied GUEST → DMZ and TRUST → database traffic.</small></span></div><div className="incident-task-actions"><button onClick={openRange}><Network size={16}/> Open shared 3D Range</button><button onClick={resetCase}><RotateCcw size={15}/> Reset case</button></div></section>
  {alreadyRestored&&<div className="incident-caution" role="status"><TriangleAlert size={17}/> The shared Segmented Enterprise topology is already allowing the requested HTTPS flow. Choose <strong>Reset case</strong> to reproduce the original failure. Resetting this scene also updates the 3D Range.</div>}
  <ExamGate clock={clock}><div className="incident-gates" aria-label="Case validation gates">{[
   ['Baseline',assessment.gates.failedBaseline],['Investigate',assessment.gates.policyEvidence&&assessment.gates.crossSourceDiagnostics],['Diagnose',assessment.gates.correctDiagnosis],['Repair',assessment.gates.changedConfig&&assessment.gates.narrowPolicy],['Verify',assessment.gates.positiveRetest&&assessment.gates.isolationProof],['Report',assessment.gates.technicalReport&&assessment.gates.evidenceCitations]
  ].map(([label,passed],i)=><div className={passed&&(mode!=='exam'||caseState.submitted)?'complete':''} key={String(label)}><span>{passed&&(mode!=='exam'||caseState.submitted)?<CheckCircle2 size={15}/>:String(i+1).padStart(2,'0')}</span><b>{String(label)}</b></div>)}</div>
  <div className="incident-body"><section className="incident-workspace">
    <nav className="incident-tabs" aria-label="Investigation workbench tabs">{[
      ['topology','Network'],['timeline','Evidence & timeline'],['configuration','Repair'],['report','Report']
     ].map(([id,label])=><button key={id} type="button" className={tab===id?'active':''} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>
    {tab==='topology'&&<div className="incident-pane"><div className="incident-pane-head"><div><span className="incident-kicker">LIVE SHARED TOPOLOGY</span><h2>Where does the flow stop?</h2><p>Change a cable or interface here and the forwarding trace changes. The 3D Range reads the same saved topology.</p></div><div className="incident-toggle"><button className={mapMode==='2d'?'active':''} onClick={()=>setMapMode('2d')}>2D</button><button className={mapMode==='3d'?'active':''} onClick={()=>setMapMode('3d')}>3D</button></div></div>
      {mapMode==='2d'?<NetworkMap2D scene={scene} selected={selected} onSelect={setSelected} selectedLink={selectedCable} onSelectLink={setSelectedCable} trace={lastTrace}/>:<WorldCanvas scene={scene} selected={selected} onSelect={setSelected} selectedLink={selectedCable} onSelectLink={setSelectedCable} playing={playing} trace={lastTrace} onUnavailable={()=>setMapMode('2d')}/>}
      <div className="incident-nodeinfo"><b>Selected: {topology.nodes.find(n=>n.id===selected)?.label??'None'}</b><small>{topology.nodes.find(n=>n.id===selected)?.zone} · {topology.nodes.find(n=>n.id===selected)?.ip}</small><button onClick={()=>setTab('configuration')}>Edit topology <ChevronRight size={14}/></button></div>
      <div className="incident-executions"><button className="incident-primary" onClick={()=>captureProbe(!latestBaseline)}><Activity size={17}/> {!latestBaseline?'Capture failed baseline':'Run post-change + isolation probes'}</button><span>{lastTrace?`${lastTrace.pass?'Delivered':'Dropped'} · ${lastTrace.path.join(' → ')}`:'Run a synthetic probe to reveal the forwarding path.'}</span></div>
    </div>}
    {tab==='timeline'&&<div className="incident-pane"><div className="incident-pane-head"><div><span className="incident-kicker">EVIDENCE WORKBENCH</span><h2>Correlate the observations</h2><p>Background events are included; only the simulation-derived trace and commands can prove the packet decision.</p></div></div>
      <div className="incident-command-list">{INCIDENT_COMMANDS.map(command=><button key={command} onClick={()=>capture(command)}><Terminal size={14}/>{command}</button>)}</div>
      <div className="incident-feed"><h3>Event timeline</h3>{alertMessages.map((event,i)=><div className="incident-event" key={i}><span className={`incident-level ${event.level}`}>{event.source}</span><p>{event.text}</p></div>)}{lastTrace?.events.map((event,i)=><div className="incident-event" key={`trace-${i}`}><span className={`incident-level ${event.kind==='drop'?'failure':'notice'}`}>{event.kind.toUpperCase()}</span><p>{event.device}: {event.message}</p></div>)}</div>
      <div className="incident-evidence"><div className="incident-evidence-head"><h3>Captured evidence ({caseState.evidence.length})</h3><span>Immutable at capture time</span></div>{caseState.evidence.length===0?<p>No evidence pinned. Start with a failed baseline, then collect diagnostics.</p>:<div className="incident-evidence-layout"><div className="incident-evidence-list">{caseState.evidence.map(item=><button key={item.id} className={evidence?.id===item.id?'active':''} onClick={()=>setActiveEvidence(item.id)}><b>{item.id}</b><span>{item.label}</span><small>rev {item.revision}</small></button>)}</div><pre className="incident-terminal" aria-label="Selected evidence output">{evidence?.output??''}</pre></div>}</div>
    </div>}
    {tab==='configuration'&&<div className="incident-pane"><div className="incident-pane-head"><div><span className="incident-kicker">CONFIGURATION & REMEDIATION</span><h2>Change the cause, not the symptom</h2><p>Every edit updates the real network graph and invalidates the previous retest. You must prove the result with a fresh packet replay.</p></div></div>
      <div className="incident-policy-list"><h3>Ordered firewall security policy</h3>{topology.rules.map((rule,i)=><div className="incident-policy" key={rule.id}><span className="incident-policy-number">{i+1}</span><div><strong>{rule.id}</strong><small>{rule.sourceZone} → {rule.destinationZone} · TCP/{rule.port||'ANY'}</small><span>{rule.description}</span></div><div className="incident-policy-buttons"><b className={rule.action==='deny'?'denied':'allowed'}>{rule.action.toUpperCase()}</b><button disabled={i===0} onClick={()=>change(()=>moveRule(topology,rule.id,-1),`Moved ${rule.id} earlier in the ordered security rulebase`)}>↑</button><button disabled={i===topology.rules.length-1} onClick={()=>change(()=>moveRule(topology,rule.id,1),`Moved ${rule.id} later in the ordered security rulebase`)}>↓</button><button onClick={()=>change(()=>editRule(topology,rule.id,{action:rule.action==='allow'?'deny':'allow'}),`Changed ${rule.id} action to ${rule.action==='allow'?'deny':'allow'}`)}>Toggle</button></div></div>)}</div>
      <details className="incident-advanced"><summary>Additional physical/network troubleshooting controls</summary><div className="incident-controls"><h3>Physical links</h3>{topology.cables.map(c=><label key={c.id}><input type="checkbox" checked={c.up} onChange={e=>change(()=>editCable(topology,c.id,e.target.checked),`${c.id} ${e.target.checked?'enabled':'disabled'}`)}/><span>{c.from} → {c.to} ({c.id})</span></label>)}<h3>Interfaces</h3>{topology.nodes.flatMap(n=>n.interfaces.filter(p=>topology.cables.some(c=>(c.from===n.id&&c.fromPort===p.id)||(c.to===n.id&&c.toPort===p.id))).map(p=><label key={`${n.id}-${p.id}`}><input type="checkbox" checked={p.adminUp} onChange={e=>change(()=>editPort(topology,n.id,p.id,{adminUp:e.target.checked}),`${n.id}/${p.id} admin state ${e.target.checked?'up':'down'}`)}/><span>{n.id}/{p.id}: {p.mode} {p.ipCidr}</span></label>))}<h3>Routes</h3>{topology.routes.map(r=><label key={r.id}>{r.router} · {r.cidr}<select value={r.via} onChange={e=>change(()=>editRoute(topology,r.id,{via:e.target.value}),`Changed ${r.id} next hop to ${e.target.value}`)}>{topology.nodes.filter(n=>n.id!==r.router).map(n=><option key={n.id} value={n.id}>{n.label}</option>)}</select></label>)}</div></details>
      <div className="incident-executions"><button className="incident-primary" onClick={()=>captureProbe(!latestBaseline)}><Activity size={17}/> {!latestBaseline?'Capture baseline before fixing':'Retest HTTPS and prohibited flows'}</button><span>{latestRetest&&latestRetest.revision!==topology.revision?'The last retest is stale. Re-run probes.':'Verification requires a current-revision test after the repair.'}</span></div>
    </div>}
    {tab==='report'&&<div className="incident-pane"><div className="incident-pane-head"><div><span className="incident-kicker">EVIDENCE-BASED REPORT</span><h2>Write a defensible finding</h2><p>Capture what the evidence supports. The offline rubric verifies structure and consistency; it cannot judge the technical accuracy of unrestricted prose.</p></div></div>
      <div className="incident-report-form"><label>Root cause hypothesis<select value={caseState.diagnosis} onChange={e=>updateReport('diagnosis',e.target.value)}><option value="">Select based on evidence</option>{HYPOTHESES.map(h=><option value={h.id} key={h.id}>{h.label}</option>)}</select></label>
       <div className="incident-citations"><strong>Reference the actual captured evidence</strong>{([['root','Policy output before repair','diagnostic'],['success','Successful HTTPS retest','retest'],['isolation','Blocked isolation probe','isolation']] as const).map(([key,label,kind])=><label key={key}>{label}<select value={caseState.citations[key]} onChange={e=>setCitation(key,e.target.value)}><option value="">Choose pinned evidence</option>{caseState.evidence.filter(e=>e.kind===kind&&(kind!=='diagnostic'||e.command==='show policies')&&(kind==='diagnostic'||e.revision===topology.revision)&&(kind==='diagnostic'||(key==='success'?e.passed===true:e.passed===false))).map(e=><option key={e.id} value={e.id}>{e.id} · {e.label} (rev {e.revision})</option>)}</select></label>)}</div>
       <label>Technical analysis<textarea value={caseState.analysis} onChange={e=>updateReport('analysis',e.target.value)} placeholder="Reference an evidence ID and explain what the first-match policy or packet trace demonstrates." rows={4}/></label>
       <label>Security impact<textarea value={caseState.impact} onChange={e=>updateReport('impact',e.target.value)} placeholder="Which approved business flow is blocked? What is not demonstrated?" rows={3}/></label>
       <label>Remediation<textarea value={caseState.remediation} onChange={e=>updateReport('remediation',e.target.value)} placeholder="Describe the exact least-privilege configuration change, including order." rows={3}/></label>
       <label>Retest summary<textarea value={caseState.retest} onChange={e=>updateReport('retest',e.target.value)} placeholder="Cite the positive retest and both blocked negative probes." rows={3}/></label>
       <div className="incident-report-actions"><button onClick={()=>downloadReport(reportMarkdown(caseState,topology))}><Download size={16}/> Export Markdown evidence report</button><button className="incident-primary" onClick={()=>{setCaseState(s=>({...s,submitted:true}));setReviewed(true);if(assessment.complete){try{localStorage.setItem('cyberlab-v12-incident-solved-'+mode,JSON.stringify([INCIDENT_ID]));window.dispatchEvent(new Event('cyberlab:progress'));}catch{/* storage unavailable */}}}}><ClipboardList size={16}/> Submit validation</button></div>
      </div>
      {reviewed&&<div className={`incident-assessment ${assessment.complete?'success':'needs-work'}`} role="status"><strong>{assessment.complete?'Investigation completed and evidence validated':'Validation still has unmet gates'}</strong><span>{assessment.score}/100 deterministic checklist completion; not an official certification score</span>{assessment.findings.map(f=><p key={f}>• {f}</p>)}</div>}
    </div>}
  </section>
  <aside className="incident-inspector"><div className="incident-side-head"><FileSearch size={18}/><div><strong>Investigation checklist</strong><small>Evidence-gated · revision-aware</small></div></div>
   <div className="incident-side-score"><b>{mode==='exam'&&!caseState.submitted?'—':`${assessment.score}%`}</b><span>Workflow checks passed</span><div className="incident-meter"><i style={{width:`${mode==='exam'&&!caseState.submitted?0:assessment.score}%`}}/></div></div>
   {Object.entries(assessment.gates).map(([name,passed])=><div className={`incident-check ${passed&&(mode!=='exam'||caseState.submitted)?'passed':''}`}  key={name}><span>{passed&&(mode!=='exam'||caseState.submitted)?<CheckCircle2 size={16}/>:<span className="incident-empty"/>}</span><small>{({failedBaseline:'Failed baseline',policyEvidence:'Original policy output',crossSourceDiagnostics:'Two diagnostics',correctDiagnosis:'Supported root cause',changedConfig:'Recorded change',narrowPolicy:'Narrow policy repair',positiveRetest:'Successful fresh retest',isolationProof:'Isolation preserved',technicalReport:'Complete report sections',evidenceCitations:'Cited evidence IDs'} as Record<string,string>)[name]}</small></div>)}
   <div className="incident-side-actions"><button onClick={()=>setTab('timeline')}><Terminal size={15}/> Inspect evidence <ArrowRight size={14}/></button><button onClick={()=>setTab('report')}><BookOpen size={15}/> Write report <ArrowRight size={14}/></button></div>
   {profile.hints==='inline'&&<div className="incident-hint">Suggested first checks: reproduce the outage, inspect the current policy order, then compare routing and policy evidence.</div>}{profile.hints==='limited'&&<div><button className="incident-hint-button" onClick={()=>setHint(true)} disabled={hint}>{hint?'Hint revealed':'Show optional hint'}</button>{showHints&&<div className="incident-hint">First-match policy ordering can prevent a later, more specific allow rule from ever being evaluated.</div>}</div>}
   {error&&<div className="incident-error" role="alert"><TriangleAlert size={16}/>{error}</div>}
   <p className="incident-disclaimer">No live network probes, shell commands, exploitation, or external calls. Existing Packet Studio and NGFW teaching engines remain separate; this incident and the 3D Range share the actual v0.8 topology model.</p>
  </aside></div></ExamGate>
  </main>;
}
