import {describe,it,expect} from 'vitest';
import {newState,startRun,runCommand,setControl,setRule,seedLegitimate,alertsFor,pinEvidence,gradePurple,relevantAudits,relevantFixes,scenarioById,SCENARIOS,cloneState} from './engine';
function play(s:ReturnType<typeof newState>){let state=s;for(const cmd of scenarioById(state.scenario).commands){const r=runCommand(state,cmd);expect(r.ok).toBe(true);state=r.state;}return state;}
describe('purple team lab shared attack, logs and defense',()=>{
 it.each(SCENARIOS)('runs %s and rejects unsafe cosmetic fixes',sc=>{
  let s=newState(sc.id);for(const key of relevantAudits[sc.id])s=setControl(s,key,true);
  s=seedLegitimate(s);s=startRun(s,'baseline');s=play(s);
  expect(s.baseline?.impactWorked).toBe(true);
  expect(s.events.some(e=>e.origin==='attack')).toBe(true);
  s=setRule(s,'broad');expect(alertsFor(s).some(e=>e.origin==='legitimate')).toBe(true);
  s=setRule(s,'tuned');expect(alertsFor(s).some(e=>e.origin==='legitimate')).toBe(false);
  for(const key of relevantFixes[sc.id])s=setControl(s,key,true);
  s=startRun(s,'retest');s=play(s);expect(s.retest?.impactWorked).toBe(false);
  // An independently executed, current-revision authorized-access probe is
  // mandatory; a successful attack block alone is not a valid Purple Team fix.
  const businessProbe=runCommand(s,'test legitimate');expect(businessProbe.ok).toBe(true);s=businessProbe.state;
  expect(gradePurple(s).pass).toBe(false);
  for(const e of [s.events.find(e=>e.origin==='attack'&&e.phase==='baseline')!,s.actions.find(e=>e.phase==='retest'&&e.step==='impact')!])s=pinEvidence(s,e.id);
  s={...s,diagnosis:sc.correctDiagnosis,notes:'The observed events and permission relationships show how the original exposure allowed access. We applied the narrow controls and replayed the attempt; the authorized user workflow remains functional.'};
  expect(gradePurple(s).pass).toBe(true);
  expect(gradePurple(setControl(s,relevantFixes[sc.id][0],false)).pass).toBe(false);
 });
 it('logs depend on enabled audit policy and are not generated retroactively',()=>{
  let s=newState('kerberos');s=setControl(s,'kerberos',false);s=startRun(s,'baseline');s=play(s);
  expect(s.events.some(e=>e.eventId==='4769')).toBe(false);
  s=setControl(s,'kerberos',true);expect(s.events.some(e=>e.eventId==='4769')).toBe(false);
  s=startRun(s,'baseline');s=play(s);expect(s.events.some(e=>e.eventId==='4769')).toBe(true);
 });
 it('refuses unknown and out-of-order commands',()=>{
  let s=startRun(newState('gpo'),'baseline');expect(runCommand(s,'rm -rf /').ok).toBe(false);
  expect(runCommand(s,'edit workstation-policy').ok).toBe(false);
  const r=runCommand(s,'enum gpo');expect(r.ok).toBe(true);
  expect(runCommand(r.state,'enum gpo').ok).toBe(false);
 });
 it('keeps evidence records immutable when config changes',()=>{
  let s=startRun(newState('delegation'),'baseline');s=play(s);const id=s.events[0].id;s=pinEvidence(s,id);
  const old=cloneState(s).events.find(e=>e.id===id);s=setControl(s,'restrictReset',true);
  expect(s.events.find(e=>e.id===id)).toEqual(old);
  expect(gradePurple(s).pass).toBe(false);
 });
});
