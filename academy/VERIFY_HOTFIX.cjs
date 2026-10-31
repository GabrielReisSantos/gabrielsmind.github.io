/* Browser-free regression check for the Purple Team test-gate correction and
 * action/telemetry correlation model. Requires globally available TypeScript.
 */
const assert=require('node:assert/strict');
const engine=require('./.purple-ui-verify/engine.js');
const timeline=require('./.purple-ui-verify/correlation.js');
let checks=0;
function check(value,msg){assert.ok(value,msg);checks++;}
for(const scenario of engine.SCENARIOS){
 let s=engine.newState(scenario.id);
 for(const audit of engine.relevantAudits[scenario.id])s=engine.setControl(s,audit,true);
 s=engine.seedLegitimate(s);s=engine.startRun(s,'baseline');
 for(const command of scenario.commands){const result=engine.runCommand(s,command);check(result.ok,`Baseline ${scenario.id}: ${command}`);s=result.state;}
 check(s.baseline?.impactWorked,`Baseline attack reproduced for ${scenario.id}`);
 s=engine.setRule(s,'tuned');
 const before=timeline.correlateRun(s,'baseline');
 check(before?.steps.length===3,`Three correlated baseline steps for ${scenario.id}`);
 check(before?.visibleEvents>0,`Actual events available for ${scenario.id}`);
 check(before.steps.some(step=>step.alertIds.length>0),`A tuned detection matches attack telemetry for ${scenario.id}`);
 for(const fix of engine.relevantFixes[scenario.id])s=engine.setControl(s,fix,true);
 s=engine.startRun(s,'retest');
 for(const command of scenario.commands){const result=engine.runCommand(s,command);check(result.ok,`Retest ${scenario.id}: ${command}`);s=result.state;}
 const after=timeline.correlateRun(s,'retest');
 check(after?.steps.length===3,`Three correlated retest steps for ${scenario.id}`);
 check(!s.retest?.impactWorked,`Abuse blocked after repair: ${scenario.id}`);
 check(!engine.gradePurple(s).pass,`Cannot pass without approved-access check and evidence: ${scenario.id}`);
 const business=engine.runCommand(s,'test legitimate');check(business.ok,`Approved-access command ${scenario.id}`);s=business.state;
 check(!engine.gradePurple(s).pass,`Cannot pass without evidence: ${scenario.id}`);
 for(const record of [s.events.find(e=>e.origin==='attack'&&e.phase==='baseline'),s.actions.find(e=>e.phase==='retest'&&e.step==='impact')]){check(record,`Evidence exists for ${scenario.id}`);s=engine.pinEvidence(s,record.id);}
 s={...s,diagnosis:scenario.correctDiagnosis,notes:'The observed events and permission relationships show how the original exposure allowed access. We applied the narrow controls and replayed the attempt; the authorized user workflow remains functional.'};
 check(engine.gradePurple(s).pass,`Complete workflow passes for ${scenario.id}`);
 check(!engine.gradePurple(engine.setControl(s,engine.relevantFixes[scenario.id][0],false)).pass,`Unsafe regression fails for ${scenario.id}`);
}
console.log(`v1.9.1 hotfix: ${checks} Purple Team and timeline integration assertions passed.`);
