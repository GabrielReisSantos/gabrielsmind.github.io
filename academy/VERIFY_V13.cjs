const assert=require('node:assert/strict');
const path=require('node:path');
const e=require(path.resolve(process.argv[2]||'.practice-verify','scenarioEngine.js'));
let checks=0;
function ok(value,msg){assert.ok(value,msg);checks++;}
function eq(actual,expected,msg){assert.deepStrictEqual(actual,expected,msg);checks++;}
function pinCurrent(s,state,probeId){state=e.runProbe(s,state,probeId);return e.pinEvidence(state,state.observations.at(-1).id);}
function collect(s,state){for(const p of s.probes)state=pinCurrent(s,state,p.id);return state;}
function textReport(state){for(const f of e.REPORT_FIELDS)state=e.withReportText(state,f,`In the fictional ${f} section, we cite observed evidence, delimit impact and include reproducible before and after testing steps. `);return state;}
const valid=new Set();
for(const s of e.SCENARIOS){
 eq(e.validateScenario(s),[],s.id+' schema');ok(!valid.has(s.id),'unique case ids');valid.add(s.id);
 let state=e.initialPracticeState(s);
 ok(!e.baselineReady(s,state),'baseline not initially ready');
 eq(e.applyRepair(s,state,'fix'),state,'repair cannot bypass evidence');
 eq(e.chooseDiagnosis(s,state,s.correctDiagnosis),state,'diagnosis needs baseline');
 state=collect(s,state);ok(e.baselineReady(s,state),'baseline ready');
 state=e.chooseDiagnosis(s,state,(s.correctDiagnosis+1)%s.diagnoses.length);ok(!e.diagnosisReady(s,state),'wrong diagnosis blocked');
 eq(e.applyRepair(s,state,'fix'),state,'wrong diagnosis cannot repair');
 state=e.chooseDiagnosis(s,state,s.correctDiagnosis);ok(e.diagnosisReady(s,state),'correct diagnosis accepted');
 const cleanState=structuredClone(state);
 let cosmetic=e.applyRepair(s,structuredClone(cleanState),'cosmetic'); cosmetic=collect(s,cosmetic);ok(!e.verificationReady(s,cosmetic),'cosmetic fix cannot pass');
 let unsafe=e.applyRepair(s,structuredClone(cleanState),'unsafe');unsafe=collect(s,unsafe);ok(!e.verificationReady(s,unsafe),'unsafe guard repair cannot pass');
 state=e.applyRepair(s,state,'fix');ok(!e.verificationReady(s,state),'old evidence not sufficient after revision');
 state=collect(s,state);ok(e.verificationReady(s,state),'correct fix with fresh current evidence');
 const report=e.reportChecklist(s,state);ok(!report.complete,'report not complete without cited evidence');
 state=textReport(state);ok(!e.reportChecklist(s,state).complete,'length only not enough');
 const baselineExposure=state.observations.find(o=>o.probeId==='exposure'&&o.revision===0);
 const baselineGuard=state.observations.find(o=>o.probeId==='guard'&&o.revision===0);
 state=e.citeEvidence(state,'beforeEvidence',baselineExposure.id);state=e.citeEvidence(state,'beforeEvidence',baselineGuard.id);
 ok(!e.reportChecklist(s,state).complete,'must cite after evidence');
 for(const p of s.probes){const latest=state.observations.find(o=>o.revision===state.revision&&o.probeId===p.id);state=e.citeEvidence(state,'afterEvidence',latest.id);}
 ok(e.reportChecklist(s,state).complete,'verified report with citations');
 const md=e.exportPracticeReport(s,state);ok(md.includes('All scenario gates passed')&&md.includes(baselineExposure.id),'export references actual evidence');
 const replay=e.replayFrames(s,state);eq(replay.length,1+state.observations.length+state.changes.length,'replay frame coverage');
 eq(replay.at(-1).flags,state.flags,'replay state reconstructs flags');
 const restored=e.restorePracticeState(s,JSON.parse(JSON.stringify(state)));ok(e.reportChecklist(s,restored).complete,'restored record retains validation');
 const tampered=structuredClone(state);tampered.observations[0].outcome=false;ok(!e.baselineReady(s,e.restorePracticeState(s,tampered)),'tampered probe transcript rejected');
 const weird=structuredClone(state);weird.observations[0].output='fake evidence';eq(e.restorePracticeState(s,weird).revision,0,'fabricated output rejected');
 const cross=e.restorePracticeState(s,{...state,scenarioId:'other-case'});eq(cross.revision,0,'cross-case restore rejected');
 state=e.applyRepair(s,state,'cosmetic');ok(!e.verificationReady(s,state),'any subsequent config action invalidates retest');
 ok(!e.reportChecklist(s,state).complete,'stale after refs invalidate report');
 const old=state.observations.find(o=>o.revision===0);eq(e.citeEvidence(state,'afterEvidence',old.id),state,'cannot cite pre-fix observation as after');
}
console.log(`v1.3 OSCP practice: ${checks} behavioral and integrity assertions passed over ${e.SCENARIOS.length} cases.`);
