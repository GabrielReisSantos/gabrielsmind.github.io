/** Deterministic Red -> telemetry -> detection correlation for the same PurpleState.
 * Pure projection: never fabricates an event when the required audit policy was off.
 */
import {alertsFor,type PurpleState,type ActionRecord,type EventRecord,type Phase} from './engine';

export type CorrelatedStep={action:ActionRecord;events:EventRecord[];alertIds:string[]};
export type CorrelatedRun={phase:Phase;runId:string;revision:number;steps:CorrelatedStep[];visibleEvents:number;detectedEvents:number};
const numberId=(id:string):number=>Number(id.split('-').at(-1))||0;

export function correlateRun(state:PurpleState,phase:Phase):CorrelatedRun|null{
 const attempt=phase==='baseline'?state.baseline:state.retest;
 if(!attempt)return null;
 const actions=state.actions.filter(a=>a.runId===attempt.id && a.step!=='info')
  .sort((a,b)=>numberId(a.id)-numberId(b.id));
 const related=state.events.filter(e=>e.runId===attempt.id);
 const matches=new Set(alertsFor(state).map(e=>e.id));
 let previous=numberId(attempt.id)-1;
 const steps=actions.map(action=>{
  const last=numberId(action.id);
  const events=related.filter(event=>numberId(event.id)>previous&&numberId(event.id)<last);
  previous=last;
  return {action,events,alertIds:events.filter(e=>matches.has(e.id)).map(e=>e.id)};
 });
 return {phase,runId:attempt.id,revision:attempt.revision,steps,
  visibleEvents:steps.reduce((n,step)=>n+step.events.length,0),
  detectedEvents:steps.reduce((n,step)=>n+step.alertIds.length,0)};
}
