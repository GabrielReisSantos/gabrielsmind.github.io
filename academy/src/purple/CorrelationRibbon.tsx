import {useState} from 'react';
import {Activity,CheckCircle2,ClipboardCheck,EyeOff,RadioTower,ShieldCheck} from 'lucide-react';
import {correlateRun,type CorrelatedRun} from './correlation';
import {type PurpleState} from './engine';

type View='baseline'|'retest'|'compare';
function RunStrip({run,pinned,onPin}:{run:CorrelatedRun;pinned:Set<string>;onPin:(id:string)=>void}){
 return <section className="pt-corr-run" aria-label={`${run.phase} action-to-event correlation`}>
  <header className="pt-corr-run-head"><div><strong>{run.phase==='baseline'?'01 · BEFORE HARDENING':'02 · AFTER HARDENING'}</strong><span>Run {run.runId} · configuration revision {run.revision}</span></div><div className="pt-corr-kpis"><span>{run.visibleEvents} recorded</span><span>{run.detectedEvents} alerted</span></div></header>
  <div className="pt-corr-grid">{run.steps.map((step,index)=><article className="pt-corr-step" key={step.action.id}>
   <div className="pt-corr-step-head"><span className="pt-corr-step-num">{index+1}</span><div><small>RED · {step.action.step.toUpperCase()}</small><code>{step.action.command}</code></div><span className={`pt-corr-status ${step.action.status==='blocked'?'blocked':'observed'}`}>{step.action.status}</span></div>
   <div className="pt-corr-bridge" aria-hidden="true">↓ generates telemetry if audited ↓</div>
   <div className="pt-corr-observations">{step.events.length?step.events.map(event=><div key={event.id} className={`pt-corr-event ${step.alertIds.includes(event.id)?'flagged':''}`}><span className="pt-corr-event-id">{event.eventId}</span><div><strong>{event.host} · {event.actor}</strong><small>{event.detail}</small></div><button type="button" disabled={pinned.has(event.id)} title={`Pin ${event.id} as evidence`} aria-label={`Pin correlated event ${event.id}`} onClick={()=>onPin(event.id)}>{pinned.has(event.id)?<CheckCircle2 size={15}/>:<ClipboardCheck size={15}/>}</button></div>):<div className="pt-corr-noevent"><EyeOff size={18}/><span>No event generated. Check whether this step is normally logged and whether the audit controls were enabled.</span></div>}</div>
   <div className={`pt-corr-detection ${step.alertIds.length?'detected':'silent'}`}>{step.alertIds.length?<><ShieldCheck size={15}/> {step.alertIds.length} event(s) matched current detection</>:<><RadioTower size={15}/> No tuned detection match</>}</div>
  </article>)}</div>
 </section>;
}
export default function CorrelationRibbon({state,onPin}:{state:PurpleState;onPin:(id:string)=>void}){
 const [view,setView]=useState<View>('compare');
 const baseline=correlateRun(state,'baseline');const retest=correlateRun(state,'retest');
 const pinned=new Set(state.evidence.map(e=>e.id));
 return <section className="pt-correlation" aria-label="Attack and Windows event correlation timeline"><div className="pt-corr-intro"><div><span className="pt-overline"><Activity size={15}/> CROSS-LAYER OBSERVABILITY · SAME SCENARIO STATE</span><h3>From action to evidence</h3><p>Trace each simulated Red Team action into the Windows/endpoint events it generated, and see which events your current detection identifies. Missing events are never invented.</p></div><div className="pt-corr-switch" role="group" aria-label="Timeline comparison mode">{(['compare','baseline','retest'] as View[]).map(v=><button key={v} type="button" className={view===v?'active':''} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='compare'?'Compare':v==='baseline'?'Before':'After'}</button>)}</div></div>
 {(!baseline&&!retest)&&<div className="pt-corr-start"><RadioTower size={24}/><p>Start a baseline investigation to populate the visual correlation timeline. Audited activity will appear here as you type commands.</p></div>}
 {(view==='compare'||view==='baseline')&&baseline&&<RunStrip run={baseline} pinned={pinned} onPin={onPin}/>}
 {(view==='compare'||view==='retest')&&retest&&<RunStrip run={retest} pinned={pinned} onPin={onPin}/>}
 {view==='retest'&&!retest&&<p className="pt-corr-note">No retest has been completed yet. Harden the environment, replay the attack, and run the approved-access test.</p>}
 <footer className="pt-corr-foot">Events reflect enabled audits at the moment of each action. The current detection rule is applied to recorded events; a rule change doesn't retroactively create missing logs.</footer></section>;
}
