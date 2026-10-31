/** v2.5.1 regression: recovered AD evidence/retests must reflect an unchanged, validated graph. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(process.argv[2]||'.v25-verify');
const {AD_SCENARIOS}=require(path.join(root,'adlab/adEngine.js'));
const {emptyMission,sanitizeDraft,saveDrafts,parseSavedDrafts,AD_DRAFT_KEY}=require(path.join(root,'adacademy/drafts.js'));
const {CLI_COMMANDS,simulateADCommand}=require(path.join(root,'adacademy/engine.js'));
let count=0;
const check=(name,fn)=>{fn();count++;console.log('  ✓ '+name)};
const acl=AD_SCENARIOS.find(s=>s.id==='acl');assert.ok(acl);
const make=(revision=2)=>({...emptyMission(acl),disabled:['overacl'],revision,retest:{revision,reachable:false,approved:true}});
check('valid retest survives a clean saved permission snapshot',()=>assert.deepEqual(sanitizeDraft(make(),acl).retest,make().retest));
check('invalid non-weak edit cannot be removed while retaining a false retest',()=>{
 const fake={...make(),disabled:['legit','overacl']};const result=sanitizeDraft(fake,acl);
 assert.deepEqual(result.disabled,['overacl']);assert.equal(result.retest,null);
});
check('duplicate permission edit invalidates retest',()=>assert.equal(sanitizeDraft({...make(),disabled:['overacl','overacl']},acl).retest,null));
check('unknown permission edit invalidates retest',()=>assert.equal(sanitizeDraft({...make(),disabled:['unknown','overacl']},acl).retest,null));
check('stale revision invalidates retest',()=>assert.equal(sanitizeDraft({...make(),retest:{revision:1,reachable:false,approved:true}},acl).retest,null));
check('invalid revision cannot validate a retest',()=>assert.equal(sanitizeDraft({...make(),revision:9999},acl)?.retest??null,null));
check('invented retest verdict invalidated',()=>assert.equal(sanitizeDraft({...make(),retest:{revision:2,reachable:true,approved:true}},acl).retest,null));
check('forged evidence is not restored',()=>{
 const result=sanitizeDraft({...make(),pinned:[{id:'acl',category:'permissions',output:'I win',revision:0}]},acl);
 assert.deepEqual(result.pinned,[]);
});
check('real baseline evidence survives sanitization',()=>{
 const fixture=CLI_COMMANDS.find(c=>c.id==='acl');assert.ok(fixture);
 const output=simulateADCommand(fixture.input,acl,[]);assert.ok(!('error' in output));
 const result=sanitizeDraft({...make(),pinned:[{id:output.evidenceId,category:output.category,output:output.output,revision:0}]},acl);
 assert.equal(result.pinned.length,1);
});
check('known clean draft survives save/restore',()=>{
 let saved;saveDrafts({setItem:(key,value)=>{assert.equal(key,AD_DRAFT_KEY);saved=value}},acl.id,{[acl.id]:make()});
 const result=parseSavedDrafts(saved).drafts[acl.id];assert.ok(result);assert.deepEqual(result.retest,make().retest);
});
check('unknown scenario ID cannot be restored',()=>assert.equal(sanitizeDraft({...make(),scenarioId:'forged'},acl),null));
check('AD atlas optional scenario type fix present',()=>{
 const code=fs.readFileSync('src/adacademy/ADAcademy.tsx','utf8');
 assert.ok(code.includes('chooseMission(t.scenario!)'));
});
check('How to Use no longer imports unused activity list',()=>{
 const code=fs.readFileSync('src/experience/HowToUse.tsx','utf8');
 assert.ok(!code.includes('ACTIVITY_IDS'));
});
console.log(`v2.5.1 hotfix regression: ${count} assertions passed.`);
