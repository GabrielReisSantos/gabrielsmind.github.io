import {describe,it,expect} from 'vitest';
import {CASES} from '../deep/troubleshootEngine';
import {buildTimeline,checkCorrelatedInvestigation,pivotalEvents} from './correlationEngine';
describe('correlated diagnostics share the existing probe model',()=>{
 for(const c of CASES){it(`${c.id}: logs match failure and repair`,()=>{
  const bad=buildTimeline(c,c.initial);
  const good=buildTimeline(c,c.correct,1);
  expect(bad.result.pass).toBe(false);expect(good.result.pass).toBe(true);
  expect(bad.events.some(e=>e.status==='fail')).toBe(true);
  expect(new Set(bad.events.map(e=>e.flowId)).size).toBe(1);
  expect(pivotalEvents(bad.events,good.events).length).toBeGreaterThan(0);
  const pinned=bad.events.filter(e=>e.status==='fail');
  const okay=checkCorrelatedInvestigation(c,c.correct,c.correctHypothesis,true,true,['TRAFFIC','SESSION'],pinned);
  expect(okay.complete).toBe(true);
  expect(checkCorrelatedInvestigation(c,c.correct,c.correctHypothesis,true,true,['TRAFFIC'],pinned).complete).toBe(false);
  expect(checkCorrelatedInvestigation(c,c.initial,c.correctHypothesis,true,true,['TRAFFIC','SESSION'],pinned).complete).toBe(false);
  expect(checkCorrelatedInvestigation(c,c.correct,c.correctHypothesis,true,true,['TRAFFIC','SESSION'],[]).complete).toBe(false);
 });}
});
