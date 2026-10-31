// Standalone source-engine tests; requires TypeScript CLI but no npm packages.
const assert=require('node:assert/strict');
const path=require('node:path');
const root=process.argv[2]||'.purple-verify';
const e=require(path.resolve(root,'engine.js'));
let checks=0;const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++;};const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
function play(s){for(const c of e.scenarioById(s.scenario).commands){const r=e.runCommand(s,c);ok(r.ok,`command failed ${s.scenario}:${c}`);s=r.state;}return s;}
for(const scene of e.SCENARIOS){
 let s=e.newState(scene.id);eq(s.scenario,scene.id);eq(s.events.length,0);
 for(const key of e.relevantAudits[scene.id])s=e.setControl(s,key,true);
 s=e.seedLegitimate(s);ok(s.events.some(x=>x.origin==='legitimate'),`legitimate events missing ${scene.id}`);
 s=e.startRun(s,'baseline');s=play(s);ok(s.baseline.complete);ok(s.baseline.impactWorked);
 ok(s.events.some(x=>x.origin==='attack'&&x.phase==='baseline'));ok(s.actions.length>=3);
 const first=s.events.find(x=>x.origin==='attack'&&x.phase==='baseline');ok(!!first);
 const pinnedId=first.id;s=e.pinEvidence(s,pinnedId);ok(s.evidence.some(x=>x.id===pinnedId));
 s=e.setRule(s,'off');eq(e.alertsFor(s).length,0);
 s=e.setRule(s,'broad');ok(e.alertsFor(s).some(x=>x.origin==='legitimate'));
 s=e.setRule(s,'tuned');ok(e.alertsFor(s).length>0);eq(e.alertsFor(s).some(x=>x.origin==='legitimate'),false);
 const bad=e.gradePurple(s);eq(bad.pass,false);
 const prevent=e.setControl(s,e.relevantFixes[scene.id][0],true);
 if(scene.id!=='kerberos'){eq(e.permitted(prevent),false);} // ACL/GPO permission removal stops new modification immediately
 eq(e.gradePurple(prevent).pass,false); // still missing full cleanup and fresh evidence
 for(const key of e.relevantFixes[scene.id])s=e.setControl(s,key,true);
 ok(!e.permitted(s));ok(e.legitimatePasses(s));
 s=e.startRun(s,'retest');s=play(s);ok(s.retest.complete);eq(s.retest.impactWorked,false);eq(s.retest.revision,s.revision);
 const latest=s.actions.findLast(x=>x.phase==='retest'&&x.step==='impact');ok(!!latest);
 s=e.pinEvidence(s,latest.id);s=e.runCommand(s,'test legitimate').state;s={...s,diagnosis:scene.correctDiagnosis,notes:'The original investigation proved the modeled issue and generated auditable events. The revised controls close the unauthorized path while keeping approved administrative access available. The latest replay verifies that impact is blocked.'};
 ok(e.gradePurple(s).pass,`expected complete ${scene.id}: ${JSON.stringify(e.gradePurple(s).gates)}`);
 ok(e.completedReport(s).includes(pinnedId),`report missing ${pinnedId} for ${scene.id}`);ok(e.completedReport(s).includes('All gates passed:** true'),`report did not mark success for ${scene.id}`);
 for(const key of e.relevantFixes[scene.id]){const rollback=e.setControl(s,key,false);eq(e.gradePurple(rollback).pass,false);eq(rollback.retest,null);}
 const missing=e.pinEvidence({...s,evidence:[]},'NONEXISTENT');eq(missing.evidence.length,0);
 const unsafe=e.setControl(s,e.unsafeFixes[scene.id],true);eq(e.legitimatePasses(unsafe),false);eq(e.gradePurple(unsafe).pass,false);
 const noNotes={...s,notes:''};eq(e.gradePurple(noNotes).pass,false);
 const badDiagnosis={...s,diagnosis:'unrelated'};eq(e.gradePurple(badDiagnosis).pass,false);
 const undoDetection=e.setRule(s,'broad');eq(e.gradePurple(undoDetection).pass,false);
 const cloned=e.cloneState(s);eq(cloned,s);ok(cloned!==s);
}
// Audit events are emitted for actions only when the correct prerequisites are enabled.
{
 let s=e.newState('kerberos');s=e.setControl(s,'kerberos',false);s=e.startRun(s,'baseline');s=play(s);
 eq(s.events.some(x=>x.eventId==='4769'),false);s=e.setControl(s,'kerberos',true);
 eq(s.events.some(x=>x.eventId==='4769'),false);s=e.startRun(s,'baseline');s=play(s);ok(s.events.some(x=>x.eventId==='4769'));
}
{
 let s=e.newState('gpo');s=e.setControl(s,'directory',true);s=e.startRun(s,'baseline');s=play(s);eq(s.events.some(x=>x.eventId==='5136'),false);
 s=e.setControl(s,'gpoSacl',true);s=e.startRun(s,'baseline');s=play(s);ok(s.events.some(x=>x.eventId==='5136'));
}
{
 let s=e.newState('delegation');s=e.setControl(s,'account',false);s=e.startRun(s,'baseline');s=play(s);eq(s.events.some(x=>x.eventId==='4724'),false);
 s=e.setControl(s,'account',true);s=e.startRun(s,'baseline');s=play(s);ok(s.events.some(x=>x.eventId==='4724'));
}
{
 let s=e.startRun(e.newState('kerberos'),'baseline');eq(e.runCommand(s,'something dangerous').ok,false);eq(e.runCommand(s,'request tickets').ok,false);
 const help=e.runCommand(s,'help');ok(help.ok);ok(help.message.includes('not a real OS shell'));
 let step=e.runCommand(s,'enum spn');ok(step.ok);s=step.state;eq(e.runCommand(s,'enum spn').ok,false);
 eq(e.startRun(e.newState('gpo'),'retest').attempt,null);
}
for(const sc of e.SCENARIOS){eq(sc.commands.length,3);eq(sc.diagnoses.includes(sc.correctDiagnosis),true);eq(e.relevantAudits[sc.id].length>0,true);eq(e.relevantFixes[sc.id].length,2);}
console.log(`CyberLab Purple Team v1.9: ${checks} deterministic behavior/integrity assertions passed.`);
