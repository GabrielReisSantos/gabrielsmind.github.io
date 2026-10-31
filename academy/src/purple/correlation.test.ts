import {describe,expect,it} from 'vitest';
import {correlateRun} from './correlation';
import {newState,startRun,runCommand,setControl,setRule,relevantAudits,relevantFixes,scenarioById,SCENARIOS} from './engine';

describe('visual Purple Team event correlation',()=>{
 it.each(SCENARIOS)('maps real synthetic events to the actions that produced them: %s',scenario=>{
  let state=newState(scenario.id);
  for(const audit of relevantAudits[scenario.id])state=setControl(state,audit,true);
  state=setRule(state,'tuned');state=startRun(state,'baseline');
  for(const command of scenarioById(scenario.id).commands){const result=runCommand(state,command);expect(result.ok).toBe(true);state=result.state;}
  const before=correlateRun(state,'baseline');expect(before?.steps).toHaveLength(3);
  expect(before?.steps.flatMap(step=>step.events).length).toBeGreaterThan(0);
  expect(before?.steps.some(step=>step.alertIds.length>0)).toBe(true);
  for(const fix of relevantFixes[scenario.id])state=setControl(state,fix,true);
  state=startRun(state,'retest');
  for(const command of scenario.commands){const result=runCommand(state,command);expect(result.ok).toBe(true);state=result.state;}
  const after=correlateRun(state,'retest');expect(after?.steps).toHaveLength(3);
  expect(after?.steps.every(step=>step.events.every(ev=>ev.runId===after.runId))).toBe(true);
  expect(before?.runId).not.toEqual(after?.runId);
 });
 it('shows no fabricated logs when auditing was disabled at execution time',()=>{
  let state=newState('kerberos');state=setControl(state,'kerberos',false);state=setControl(state,'logon',false);
  state=startRun(state,'baseline');
  for(const command of scenarioById('kerberos').commands)state=runCommand(state,command).state;
  const baseline=correlateRun(state,'baseline');expect(baseline?.visibleEvents).toBe(0);
  state=setControl(state,'kerberos',true);
  expect(correlateRun(state,'baseline')?.visibleEvents).toBe(0);
 });
});
