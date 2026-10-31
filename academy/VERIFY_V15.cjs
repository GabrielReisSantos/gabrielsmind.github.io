const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const base=process.argv[2]||'.coding-verify';
const {CODING_LESSONS}=require(`./${base}/lessons.js`);
const {initialApiState,mockApi,parseHttpRequest,validateApiLesson,validateCSharpReference,codingSavedIds}=require(`./${base}/engine.js`);
let checks=0;const yes=(condition,msg)=>{assert.ok(condition,msg);checks++;};
yes(CODING_LESSONS.length===18,'18 coding lessons');
yes(new Set(CODING_LESSONS.map(x=>x.id)).size===18,'unique ids');
for(const lang of ['python','csharp','api'])yes(CODING_LESSONS.filter(x=>x.language===lang).length===6,`${lang} has 6 lessons`);
for(const l of CODING_LESSONS){yes(l.solution.trim().length>0,`${l.id} solution nonempty`);yes(l.hint.trim().length>0,`${l.id} hint nonempty`);}
let state=initialApiState();for(const l of CODING_LESSONS.filter(x=>x.language==='api')){
 const req=parseHttpRequest(l.solution);const out=mockApi(req,state);state=out.state;
 yes(validateApiLesson(l.id,req,out.result),`${l.id} expected request validation`);yes(`${out.result.status} ${out.result.statusText}`===l.expected,`${l.id} response status`);
 yes(!validateApiLesson(l.id,{...req,method:'DELETE'},out.result),`${l.id} wrong method rejected`);
}
yes(state.notes.length===1,'POST creates note');yes(state.assets[1].location==='DMZ','PATCH mutates asset');
for(const l of CODING_LESSONS.filter(x=>x.language==='csharp')){
 yes(validateCSharpReference(l,l.solution),`${l.id} reference accepted`);
 yes(!validateCSharpReference(l,l.solution+'garbage'),`${l.id} altered solution rejected`);
}
for(const l of CODING_LESSONS.filter(x=>x.language==='python')){
 const harness=l.solution+'\n'+l.pythonTests.join('\n');
 const p=spawnSync('python3',['-c',harness],{encoding:'utf8',timeout:3000});
 yes(p.status===0,`${l.id} sample Python syntax and tests execute: ${p.stderr}`);
 yes(p.stdout.trim()===l.expected.trim(),`${l.id} output matches expected: ${p.stdout}`);
}
for(const raw of ['GET /api/private HTTP/1.1','POST /api/notes HTTP/1.1\nContent-Type: application/json\n\n{bad']){const req=parseHttpRequest(raw);const out=mockApi(req,initialApiState());yes(out.result.status>=400,'API rejects invalid input');}
yes(codingSavedIds(['py-01','bad','py-01'],CODING_LESSONS.map(l=>l.id)).length===1,'invalid saved ids dropped');
console.log(`PASS ${checks} Coding Foundations behavioral/source assertions`);
