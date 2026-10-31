/* Deterministic v0.7 release regression suite; run after compiling engines to CommonJS. */
const assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2];if(!root)throw Error('Provide root of compiled engine files');
const {DIFFICULTIES,profileFor,gradeTroubleshoot,stageEvidenceReady,remainingSeconds}=require(path.join(root,'challenge/difficulty.js'));
const {SCENES,sceneIsConsistent,sceneById,project3D,interpPacket,deviceById}=require(path.join(root,'threeD/sceneEngine.js'));
const {CASES,runProbe}=require(path.join(root,'deep/troubleshootEngine.js'));
const {MISSIONS,emptyMissionProgress,isStageComplete}=require(path.join(root,'pentest/deep/missionEngine.js'));
let total=0;const check=(value,label)=>{assert.ok(value,label);total++;};
check(DIFFICULTIES.length===4,'four difficulty profiles');
check(new Set(DIFFICULTIES.map(p=>p.id)).size===4,'all difficulty IDs distinct');
for(const level of DIFFICULTIES){
 check(profileFor(level.id)===level,level.id+' resolves');
 check(level.id==='exam'?level.timeLimitSeconds===900:level.timeLimitSeconds===null,level.id+' timing');
 for(const c of CASES){
  check(c.commands.length>=level.minDiagnostics,`${c.id}/${level.id} sufficient diagnostic commands`);
  const input={mode:level.id,diagnostics:level.minDiagnostics,hypothesisCorrect:true,observedFailure:true,observedSuccess:true,secureRepair:true,hintsUsed:0,wrongSubmissions:0,notes:'Evidence from distinct diagnostics confirms least-privilege traffic restoration and legitimate authorization.',expired:false};
  check(gradeTroubleshoot(input).complete,`${c.id}/${level.id} legitimate repair can pass`);
  check(!gradeTroubleshoot({...input,diagnostics:0}).complete,`${c.id}/${level.id} cannot bypass diagnostics`);
  check(!gradeTroubleshoot({...input,secureRepair:false}).complete,`${c.id}/${level.id} cannot pass unsafe rule`);
  check(!gradeTroubleshoot({...input,observedFailure:false}).complete,`${c.id}/${level.id} must reproduce failure`);
  check(!gradeTroubleshoot({...input,observedSuccess:false}).complete,`${c.id}/${level.id} must verify repaired traffic`);
  check(!gradeTroubleshoot({...input,hypothesisCorrect:false}).complete,`${c.id}/${level.id} correct diagnosis necessary`);
  check(!gradeTroubleshoot({...input,expired:true}).complete,`${c.id}/${level.id} expired attempt cannot pass`);
  if(level.needsNotes)check(!gradeTroubleshoot({...input,notes:'guessed'}).complete,`${c.id}/${level.id} requires technical notes`);
  check(runProbe(c,c.correct).pass,`${c.id} repair is valid`);
 }
}
for(const mission of MISSIONS)for(const stage of mission.stages){
 for(const level of DIFFICULTIES){
  const all=stage.artifacts.map(a=>a.id);
  check(stageEvidenceReady(level.id,stage.requiredEvidence,all,all),`${mission.id}/${stage.id}/${level.id} sufficient evidence passes`);
  check(!stageEvidenceReady(level.id,stage.requiredEvidence,all,[]),`${mission.id}/${stage.id}/${level.id} empty evidence blocked`);
  check(!stageEvidenceReady(level.id,stage.requiredEvidence,all,all.slice(0,1)),`${mission.id}/${stage.id}/${level.id} minimal evidence blocked`);
 }
}
for(const scene of SCENES){
 check(sceneIsConsistent(scene),scene.id+' graph valid');
 const lesson=CASES.find(c=>c.id===scene.caseId);
 check(Boolean(lesson),scene.id+' associated lesson exists');
 check(!runProbe(lesson,lesson.initial).pass,scene.id+' initially broken');
 check(runProbe(lesson,lesson.correct).pass,scene.id+' repair passes');
 check(scene.packetPath.length>=3,scene.id+' meaningful path');
 check(sceneById(scene.id)===scene,scene.id+' lookup');
 for(const id of scene.packetPath)check(Boolean(deviceById(scene,id)),`${scene.id}/${id} is a real device`);
 for(const t of [0,.2,.5,.8,.99]){const p=interpPacket(scene,t);check([p.x,p.y,p.z].every(Number.isFinite),scene.id+' packet animation finite');}
}
check(SCENES.length>=3,'multiple 3D scenes');
for(const aspect of [.56,1,1.77,2.4])for(const yaw of [-1,0,.52,1.5])for(const pitch of [.3,.7,1.2]){
 const p=project3D(3,1.3,-2,yaw,pitch,18,aspect);check(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.depth>0,'projection finite');
}
check(remainingSeconds(null,100,900)===null,'not started');
check(remainingSeconds(1000,1000,900)===900,'initial time');
check(remainingSeconds(1000,1000+4000,900)===896,'time elapsed');
check(remainingSeconds(1000,1000+905000,900)===0,'expired clock clamps');
check(remainingSeconds(1000,100000, null)===null,'not timed');
const valid=gradeTroubleshoot({mode:'intermediate',diagnostics:3,hypothesisCorrect:true,observedFailure:true,observedSuccess:true,secureRepair:true,hintsUsed:1,wrongSubmissions:2,notes:'',expired:false});
check(valid.complete&&valid.score===80,'penalties reflect hints and wrong submissions');
check(emptyMissionProgress().stage===0,'mission progress baseline');
console.log(`PASS: ${total} v0.7 challenge and 3D regression assertions.`);
