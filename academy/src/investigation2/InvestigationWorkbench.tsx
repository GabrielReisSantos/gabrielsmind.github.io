import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {Activity,AlertTriangle,ArrowRight,BookOpen,CheckCircle2,Clipboard,Download,FileSearch,History,RotateCcw,ShieldCheck,Terminal, Wrench} from 'lucide-react';
import {DifficultyNotice,ExamGate,useChallengeClock,useDifficulty} from '../challenge/DifficultyProvider';
import {CASE_ID,CASE_TITLE,COMMANDS,CONTROLS,DIAGNOSES,IMPACTS,REPAIRS,SCOPE,available,change,cite,evidence,execute,exportReport,grade,journal,pin,restore,setClaims,setDiagnosis,startCase,submit,triageReady,type CaseState,type CommandId,type RootCause,type Impact,type Control} from './engine';
import './investigation2.css';
const key=(mode:string)=>`cyberlab-v14-${CASE_ID}-${mode}`;
function read(mode:string):CaseState{try{return restore(JSON.parse(localStorage.getItem(key(mode))??'null') as unknown);}catch{return startCase();}}
function saveFile(name:string,text:string,mime:string){const url=URL.createObjectURL(new Blob([text],{type:mime}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),800);}
const stages=['Recon & triage','Correlate evidence','Root-cause hypothesis','Remediate','Retest controls','Evidence-backed report'];
const verifyCommands:CommandId[]=['test normal','test attack-path','test segmentation'];
export default function InvestigationWorkbench({onBack}:{onBack?:()=>void}){
 const {mode,profile}=useDifficulty();
 const [state,setState]=useState<CaseState>(()=>read(mode));
 const [command,setCommand]=useState('help');
 const [error,setError]=useState('');
 const [tab,setTab]=useState<'terminal'|'report'|'replay'>('terminal');
 const [hints,setHints]=useState(false);
 const [selectedOutput,setSelectedOutput]=useState<string>('');
 const clock=useChallengeClock('v14-'+CASE_ID);
 useEffect(()=>{try{localStorage.setItem(key(mode),JSON.stringify(state));window.dispatchEvent(new Event('cyberlab:progress'));}catch{/* local storage unavailable */}},[state,mode]);
 const results=grade(state),logged=evidence(state);
 const current=logged.find(x=>x.id===selectedOutput)??logged.at(-1);
 const showResults=mode!=='exam'||state.submitted;
 const gates=[results.checks.triage,results.checks.triage,results.checks.diagnosis,results.checks.diagnosis&&state.revision>0,results.checks.retest,results.pass];
 const completed=gates.findIndex(v=>!v);
 const pinned=logged.filter(x=>x.pinned);
 const timeline=useMemo(()=>journal(state),[state]);
 function dispatch(cmd:string){const result=execute(state,cmd);if(result.error){setError(result.error);return;}setError('');setState(result.state);const last=evidence(result.state).at(-1);setSelectedOutput(last?.id??'');}
 function run(e:FormEvent){e.preventDefault();dispatch(command);}
 function reset(){if(!window.confirm('Reset this synthetic investigation, including evidence, configuration and report?'))return;setState(startCase());setCommand('help');setError('');setSelectedOutput('');setTab('terminal');}
 function update<K extends keyof CaseState['claims']>(field:K,value:CaseState['claims'][K]){setState(p=>setClaims(p,{[field]:value}));}
 const before=pinned.filter(x=>x.revision===0&&['show web access','show firewall logs','show processes','show forensic timeline','show integrity'].includes(x.command));
 const after=pinned.filter(x=>x.revision===state.revision&&state.revision>0&&verifyCommands.includes(x.command));
 return <main className="inv2" aria-label="Investigation Engine 2.0">
  <header className="inv2-hero">
   <div><div className="inv2-eyebrow"><Activity size={15}/> INVESTIGATION ENGINE 2.0 · {CASE_ID}</div><h1>{CASE_TITLE}</h1><p>A server starts making unusual outbound connections. Follow evidence across the web application, host and firewall. Establish cause, demonstrate the limits of your conclusion, then contain the weakness without breaking approved services.</p><div className="inv2-hero-tags"><span>OSCP-oriented methodology</span><span>Synthetic evidence</span><span>Browser-only</span></div></div>
   <div className="inv2-hero-side"><button onClick={()=>saveFile(`${CASE_ID.toLowerCase()}-report.md`,exportReport(state),'text/markdown;charset=utf-8')}><Download size={16}/> Export report</button>{onBack&&<button onClick={onBack}><BookOpen size={16}/> OSCP course</button>}<button onClick={reset}><RotateCcw size={16}/> Reset case</button></div>
  </header>
  <DifficultyNotice/>
  <ExamGate clock={clock}>
   <div className="inv2-grid">
    <aside className="inv2-side">
     <section className="inv2-card"><div className="inv2-section-title"><ShieldCheck size={17}/> Rules of engagement</div><p>{SCOPE}</p><p className="inv2-soft">Every command is a bounded fixture lookup. No JavaScript payload, operating-system command, exploit, or request is executed.</p></section>
     <section className="inv2-card"><div className="inv2-section-title"><Clipboard size={17}/> Investigation stages</div><ol className="inv2-stages">{stages.map((stage,i)=><li key={stage} className={showResults&&gates[i]?'done':!showResults?'hidden':i===completed?'active':''}><span>{showResults&&gates[i]?<CheckCircle2 size={15}/>:String(i+1).padStart(2,'0')}</span>{stage}</li>)}</ol>{showResults&&<div className="inv2-score"><strong>{results.score}/{results.total}</strong><span>Structural gates, not verified competence</span></div>}</section>
     {profile.hints!=='none'&&<section className="inv2-card"><button className="inv2-hint-toggle" onClick={()=>setHints(v=>!v)}>{hints?'Hide learning guidance':'Show learning guidance'}</button>{hints&&<p>Start with a normal HTTP response. Correlate the upload event with a host process and firewall destination. Historical observations remain after configuration changes; current retests do not.</p>}</section>}
    </aside>
    <section className="inv2-main">
     <nav className="inv2-tabs" aria-label="Investigation workbench views"><button aria-current={tab==='terminal'?'page':undefined} onClick={()=>setTab('terminal')}><Terminal size={17}/> Terminal & repair</button><button aria-current={tab==='report'?'page':undefined} onClick={()=>setTab('report')}><FileSearch size={17}/> Evidence report</button><button aria-current={tab==='replay'?'page':undefined} onClick={()=>setTab('replay')}><History size={17}/> Replay timeline</button></nav>
     {tab==='terminal'&&<>
      <section className="inv2-card inv2-terminal-card"><div className="inv2-section-title"><Terminal size={17}/> Simulated investigation terminal <small>revision {state.revision}</small></div>
       <div className="inv2-tool-grid">{COMMANDS.filter(c=>c.category!=='guide'&&c.category!=='scope').map(c=><button key={c.id} disabled={!available(state,c.id)} title={c.description} onClick={()=>{setCommand(c.id);dispatch(c.id);}}><code>{c.id}</code><span>{c.description}</span></button>)}</div>
       <form className="inv2-command" onSubmit={run}><label htmlFor="inv2-command">analyst@cyberlab:~$</label><input id="inv2-command" value={command} onChange={e=>setCommand(e.target.value)} spellCheck={false} autoComplete="off"/><button type="submit">Run fixture <ArrowRight size={15}/></button></form>
       {error&&<div className="inv2-error" role="alert">{error}</div>}
       <div className="inv2-terminal"><header><span><i/><i/><i/></span><strong>Evidence console</strong><small>{current?`${current.id} · revision ${current.revision}`:'No observations yet'}</small></header>{current?<><pre>{current.output}</pre><div className="inv2-terminal-footer"><button disabled={current.pinned} onClick={()=>setState(s=>pin(s,current.id))}>{current.pinned?'Pinned to evidence register':'Pin observation as evidence'}</button><label>View observation <select aria-label="Select observation" value={current.id} onChange={e=>setSelectedOutput(e.target.value)}>{logged.map(o=><option key={o.id} value={o.id}>{o.id} · {o.command}</option>)}</select></label></div></>:<p>Start with <code>help</code> or choose a diagnostic. New commands unlock after supporting evidence is pinned.</p>}</div>
      </section>
      <section className="inv2-card"><div className="inv2-section-title"><FileSearch size={17}/> Root-cause hypothesis</div><p>Pin web-access, process, integrity, firewall, and correlated-timeline evidence from the original revision. Then select the hypothesis that matches all sources.</p><fieldset disabled={!triageReady(state)} className="inv2-options"><legend>Primary cause</legend>{DIAGNOSES.map(d=><label key={d.id}><input type="radio" name="inv2-diagnosis" checked={state.diagnosis===d.id} onChange={()=>setState(s=>setDiagnosis(s,d.id))}/>{d.label}</label>)}</fieldset>{showResults&&state.diagnosis&&<p className={results.checks.diagnosis?'inv2-good':'inv2-soft'}>{results.checks.diagnosis?'Hypothesis is supported. Configuration repair unlocked.':'This hypothesis does not fit the available observations.'}</p>}</section>
      <section className="inv2-card"><div className="inv2-section-title"><Wrench size={17}/> Scoped remediation</div><p>Apply an authorized modeled change. Actions update the current system; historic log entries stay intact. You can reach the secure configuration through different valid egress-control strategies.</p><div className="inv2-actions">{REPAIRS.map(r=><button key={r.id} disabled={state.diagnosis!=='upload-egress'||!triageReady(state)} onClick={()=>{setState(s=>change(s,r.id));setError('');}}><strong>{r.label}</strong><span>{r.description}</span></button>)}</div><div className="inv2-retest"><strong>Retest after revision {state.revision}</strong><p>Run and pin all three checks: approved services, abuse path, and DB segmentation.</p><div>{verifyCommands.map(cmd=><button key={cmd} onClick={()=>{setTab('terminal');setCommand(cmd);dispatch(cmd);}}><Terminal size={14}/>{cmd}</button>)}</div>{showResults&&<p className={results.checks.retest?'inv2-good':'inv2-soft'}>{results.checks.retest?'Current revision satisfies business and security invariants.':'Not yet verified: ensure approved services work, compromise path is closed, and fresh evidence is pinned.'}</p>}</div></section>
     </>}
     {tab==='report'&&<section className="inv2-card inv2-report"><div className="inv2-section-title"><FileSearch size={17}/> Technical investigation report</div><p>Structured claims are checked against the fictional scenario. Narrative text is saved and exported, but cannot be semantically graded offline.</p>
      <div className="inv2-fields"><label>Root cause<select value={state.claims.root} onChange={e=>update('root',e.target.value as RootCause|'' )}><option value="">Select a finding</option>{DIAGNOSES.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
       <label>Demonstrated impact<select value={state.claims.impact} onChange={e=>update('impact',e.target.value as Impact|'')}><option value="">Select observed scope</option>{IMPACTS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
       <label>Required controls<select value={state.claims.control} onChange={e=>update('control',e.target.value as Control|'')}><option value="">Select remediation strategy</option>{CONTROLS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label></div>
      <div className="inv2-citations"><fieldset><legend>Historical evidence (before)</legend>{before.length===0?<p>Pin baseline observations from revision 0.</p>:before.map(x=><label key={x.id}><input type="checkbox" checked={state.claims.before.includes(x.id)} onChange={()=>setState(s=>cite(s,'before',x.id))}/>{x.id} · {x.command}</label>)}</fieldset><fieldset><legend>Current verification (after)</legend>{after.length===0?<p>Run and pin all three retests at the current revision.</p>:after.map(x=><label key={x.id}><input type="checkbox" checked={state.claims.after.includes(x.id)} onChange={()=>setState(s=>cite(s,'after',x.id))}/>{x.id} · {x.command}</label>)}</fieldset></div>
      <label>Executive summary<textarea rows={4} value={state.claims.summary} onChange={e=>update('summary',e.target.value)} placeholder="Describe the incident and bounded impact using actual evidence references."/></label>
      <label>Technical finding & evidence correlation<textarea rows={6} value={state.claims.technical} onChange={e=>update('technical',e.target.value)} placeholder="Explain the web access, process chain, outbound logs, changes, and independent controls."/></label>
      <label>Uncertainty and scope limitations<textarea rows={3} value={state.claims.limitations} onChange={e=>update('limitations',e.target.value)} placeholder="What was not observed or proved by the synthetic evidence?"/></label>
      <label>Analyst scratch notes<textarea rows={3} value={state.notes} onChange={e=>setState(s=>({...s,notes:e.target.value.slice(0,12000)}))}/></label>
      <div className="inv2-report-actions"><button onClick={()=>setState(s=>submit(s))}><Clipboard size={15}/> Submit assessment</button><button onClick={()=>saveFile(`${CASE_ID.toLowerCase()}-report.md`,exportReport(state),'text/markdown;charset=utf-8')}><Download size={15}/> Export Markdown</button></div>
      {showResults&&<div className="inv2-feedback" role="status"><h3>{results.pass?'All modeled criteria satisfied':'Further work required'}</h3><p>Structural assessment: {results.score} of {results.total} gates. This is self-assessment, not an independently verified certification.</p><ul>{Object.entries(results.checks).map(([k,v])=><li key={k}>{v?'✓':'○'} {k}</li>)}</ul></div>}
      {mode==='exam'&&!state.submitted&&<p className="inv2-soft">Exam results remain hidden until final submission.</p>}
     </section>}
     {tab==='replay'&&<section className="inv2-card"><div className="inv2-section-title"><History size={17}/> Deterministic investigation replay</div><p>Historical outputs remain historical. Configuration revisions affect only subsequent current-state probes and tests.</p><ol className="inv2-history">{timeline.map(e=><li key={e.sequence}><small>{String(e.sequence).padStart(2,'0')} · revision {e.revision}</small><strong>{e.title}</strong><pre>{e.detail}</pre></li>)}</ol>{timeline.length===0&&<p>No events recorded yet.</p>}<button onClick={()=>saveFile(`${CASE_ID.toLowerCase()}-transcript.json`,JSON.stringify(state,null,2),'application/json')}>Export replay record <Download size={15}/></button></section>}
     <footer className="inv2-footer"><AlertTriangle size={15}/> All hosts and outputs are fictional, no external connections occur, and browser data is not tamper-resistant. Structured checks do not evaluate the truth of arbitrary prose.</footer>
    </section>
   </div>
  </ExamGate>
 </main>;
}
