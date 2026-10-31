/** Browser-free regression for the fictional Secrets Storage Atlas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=process.cwd();const base=process.argv[2]||'.secrets-verify';const e=require(path.resolve(base,'engine.js'));let n=0;
const ok=(result,label)=>{assert.ok(result,label);n++;};
const eq=(a,b,label)=>{assert.deepStrictEqual(a,b,label);n++;};
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');
eq(e.PLATFORMS.length,7,'seven platforms');eq(e.CASES.length,14,'fourteen investigations');
eq(new Set(e.CASES.map(c=>c.id)).size,14,'unique case IDs');eq(new Set(e.CASES.map(c=>c.command)).size,14,'unique inspection commands');
for(const p of e.PLATFORMS){eq(e.CASES.filter(c=>c.platform===p.id).length,2,`two cases: ${p.id}`);ok(p.secure.length>25&&p.watch.length>25,`${p.id} detailed secure/risk guidance`);}
let global=e.createState();eq(e.completedCount(global),0,'starts empty');
for(const c of e.CASES){
 ok(['protected','exposed','conditional'].includes(c.risk),`${c.id}: supported risk`);
 ok(c.reference.startsWith('https://'),`${c.id}: reference`);ok(c.guardrail.length>25,`${c.id}: guardrail`);
 const initial=e.execute(global,c.id,'retest');ok(!initial.entry.success,`${c.id}: retest gated`);
 const wrong=e.execute(global,c.id,`classify ${c.risk}`);ok(!wrong.entry.success,`${c.id}: classify gated`);
 const inspect=e.execute(global,c.id,c.command);ok(inspect.entry.success,`${c.id}: inspect works`);
 const bad=e.execute(inspect.state,c.id,'classify none');ok(!bad.entry.success,`${c.id}: incorrect classification blocked`);
 const identified=e.execute(inspect.state,c.id,`classify ${c.risk}`);ok(identified.entry.success,`${c.id}: correct classification`);
 const badFix=e.execute(identified.state,c.id,'fix skip');ok(!badFix.entry.success,`${c.id}: incorrect fix blocked`);
 const fix=e.execute(identified.state,c.id,`fix ${c.repair}`);ok(fix.entry.success,`${c.id}: remediation`);
 const verified=e.execute(fix.state,c.id,'retest');ok(verified.entry.success,`${c.id}: retest`);
 global=verified.state;ok(e.isComplete(global.cases[c.id]),`${c.id}: completion`);
}
eq(e.completedCount(global),14,'all 14 completed');
const saved=e.savePayload(global);ok(!Object.hasOwn(saved,'completed'),'no trusted saved completion field');
eq(e.completedCount(e.restore(saved)),14,'valid scenario replay');
const forged=e.restore({...saved,commands:{'gh-commit':['retest']},completed:e.CASES.map(c=>c.id)});eq(e.completedCount(forged),0,'forged completion rejected');
const tampered=e.restore({...saved,commands:{'gh-commit':[e.CASES[0].command,'fix rotate-remove',`classify exposed`,'retest']}});eq(e.completedCount(tampered),0,'out-of-order commands rejected');
for(const command of ['ls -l /etc/shadow; cat /etc/shadow','cat /etc/shadow','curl https://example.com','inspect k8s secret-ref | cat','inspect ios keychain && echo hi']){ok(!e.execute(global,'gh-commit',command).entry.success,`unsafe command blocked: ${command}`);}
const errors=e.execute(global,'gh-commit','fix incorrect');const payload=e.savePayload(errors.state);ok(!payload.commands['gh-commit'].includes('fix incorrect'),'replay excludes failed input');
for(const f of ['src/secrets/SecretsAtlas.tsx','src/secrets/secrets.css','src/secrets/engine.test.ts','docs/SECRETS_STORAGE_ATLAS.md'])ok(fs.existsSync(f),`new asset ${f}`);
ok(source('src/experience/routes.ts').includes('secrets:{label:'),'registered lab route');ok(source('src/experience/App.tsx').includes("page==='secrets'"),'render wired');ok(source('src/pentest/PentestAcademy.tsx').includes('Secrets Storage Atlas'),'pentest link');ok(source('src/learning/progress.ts').includes('secretsValidated'),'progress integrated');ok(source('src/experience/Catalog.tsx').includes('Secrets storage cases'),'progress page linked');ok(source('src/experience/Dashboard.tsx').includes("onNavigate('secrets')"),'dashboard linked');ok(require(path.join(root,'package.json')).scripts['verify:all'].includes('verify:secrets'),'quality suite integrated');
console.log(`VERIFY_V27 PASS: ${n} assertions across 14 synthetic cases; progress replay, evidence, boundaries and navigation.`);
