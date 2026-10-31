/* Offline public-launch acceptance checks: source contracts + compiled pure progress engine. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const file=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
let gates=0;const check=(value,what)=>{assert.ok(value,what);gates++;};
const out=path.join(__dirname,'.v11-verify');
fs.mkdirSync(out,{recursive:true});
const args=['--target','ES2022','--module','commonjs','--moduleResolution','node','--resolveJsonModule','--esModuleInterop','--strict','--skipLibCheck','--outDir',out,'src/learning/progress.ts'];
const compile=cp.spawnSync('tsc',args,{cwd:__dirname,encoding:'utf8'});
if(compile.status!==0)throw Error(`Offline progress compilation failed: ${compile.stderr}\n${compile.stdout}`);
fs.writeFileSync(path.join(out,'package.json'),JSON.stringify({type:'commonjs'}));
const {readLearningProgress,readSavedLocation,EXERCISE_TOTALS}=require(path.join(out,'learning/progress.js'));
const {NETWORK_QUESTIONS}=require(path.join(out,'foundations/knowledge.js'));
const {QUESTIONS}=require(path.join(out,'certification/blueprints.js'));
const reader=(values)=>({getItem:(key)=>values[key]??null});
const [q1,q2]=NETWORK_QUESTIONS,[c1,c2]=QUESTIONS;
const values={
 'cyberlab-ccna-answers-v4':JSON.stringify({[q1.id]:q1.correct,[q2.id]:-1}),
 'cyberlab-cert-answers-v3':JSON.stringify({[c1.id]:{choice:c1.correct,correct:true},[c2.id]:{choice:-1,correct:false}}),
 'cyberlab-v8-solved-advanced':'["campus"]',
 'cyberlab-oscp-v4-progress':JSON.stringify({checks:{'report-writing-for-penetration-testers-1':[0]},solved:['information-gathering-1']})
};
const p=readLearningProgress(reader(values),'advanced');
for(const [key,n] of [['ccnaCorrect',1],['ccnaReviewed',2],['certCorrect',1],['certAttempted',2],['topologyValidated',1],['oscpReviewed',0],['oscpValidated',1]])check(p[key]===n,`Honest progress ${key}`);
check(p.ccnaTotal===NETWORK_QUESTIONS.length,'CCNA denominator from question source');
check(p.certTotal===QUESTIONS.length,'Certification denominator from question source');
check(readLearningProgress(reader({'cyberlab-cert-answers-v3':'oops'})).certAttempted===0,'Malformed browser storage is safe');
check(readSavedLocation(reader({'cyberlab-v11-last-activity':JSON.stringify({page:'world',at:10,detail:'campus'})}))?.detail==='campus','Resume supports topology detail');
check(readSavedLocation(reader({'cyberlab-v11-last-activity':JSON.stringify({page:'admin',at:10})}))===null,'Unknown activity route is rejected');
const app=file('src/App.tsx'),dash=file('src/Dashboard.tsx'),world=file('src/threeD/WorldLab.tsx'),map=file('src/threeD/NetworkMap2D.tsx'),backup=file('src/learning/ProgressBackup.tsx');
for(const token of ['storeLocation(target)','hashchange','savedDetail','LearningGuide','mapMode','NetworkMap2D','aria-pressed','onUnavailable','Run forwarding'])check([app,dash,world,map,backup,file('src/pentest/PentestAcademy.tsx'),file('src/foundations/FoundationsHub.tsx')].some(v=>v.includes(token)),`V1.1 feature ${token}`);
for(const token of ['export','import','cyberlab-local-backup','Confirm import'])check(backup.toLowerCase().includes(token.toLowerCase()),`Local ownership ${token}`);
for(const token of ['getByRole','2D accessible map','training','Resume'])check(file('tests/browser/launch.spec.ts').includes(token),`Browser acceptance ${token}`);
check(file('vite.config.ts').includes("base: '/training/'"),'correct production subpath');
check(/^1\.[3-9]\./.test(JSON.parse(file('package.json')).version),'compatible release metadata');
check(EXERCISE_TOTALS.world===4&&EXERCISE_TOTALS.troubleshoot===8,'Known validated scenario denominators');
console.log(`PASS: ${gates} v1.1 offline behavioral and release contracts (not a browser build).`);
