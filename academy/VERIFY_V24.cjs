const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
let ts;try{ts=require('typescript');}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');}
let n=0;function ok(value,message){assert.ok(value,message);n++}
const src=(x)=>fs.readFileSync(x,'utf8');
const routes=src('src/experience/routes.ts');ok(routes.includes("'guide'"),'guide route exists');
const app=src('src/experience/App.tsx');ok(app.includes("page==='guide'"),'help page rendered');ok(app.includes('HowToUse'),'help component imported');
const graph=src('src/adacademy/ADGraphExplorer.tsx');for(const s of ["'2d'", "'3d'",'orbitCamera','panCamera','zoomCamera','chooseEdge(edge.id)','getPath(scenario,disabled)','role="group"'])ok(graph.includes(s),'AD graph missing '+s);
const ad=src('src/adacademy/ADAcademy.tsx');ok(ad.includes('<ADGraphExplorer'),'Academy graph wired');ok(ad.includes('Your AD mission progress'),'AD progress visible');
const wc=src('src/threeD/WorldCanvas.tsx');for(const x of ['setPointerCapture','onKeyDown={key}','pointers.current.size===2','Pan camera left','Reset camera','cameraReadout'])ok(wc.includes(x),'camera missing '+x);
const pkg=JSON.parse(src('package.json'));ok(/^(?:2|3)\.(?:5|6|7|8|9)\./.test(pkg.version)||pkg.version==='3.0.0','version');ok(pkg.scripts['verify:usability'].includes('VERIFY_V24.cjs'),'verification script');
const files=['src/experience/HowToUse.tsx','src/experience/routes.ts','src/experience/App.tsx','src/adacademy/ADGraphExplorer.tsx','src/adacademy/ADAcademy.tsx','src/threeD/WorldCanvas.tsx','src/threeD/cameraInteraction.ts'];
for(const f of files){const s=ts.createSourceFile(f,src(f),ts.ScriptTarget.Latest,true,f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);ok(s.parseDiagnostics.length===0,'Syntax error '+f);}
const folder=path.resolve(process.argv[2]||'.v24-verify');
const camera=require(path.join(folder,'threeD/cameraInteraction.js'));
const visual=require(path.join(folder,'threeD/visualEngine.js'));
const {getPath,AD_SCENARIOS}=require(path.join(folder,'adlab/adEngine.js'));
const original=visual.copyPreset('isometric');
ok(camera.zoomCamera(original,-200).distance<original.distance,'zoom in changes actual camera');
ok(camera.zoomCamera(original,200).distance>original.distance,'zoom out changes actual camera');
ok(camera.zoomCamera(original,-1e7).distance>=6.8,'close zoom clamped');
ok(camera.zoomCamera(original,1e7).distance<=55,'far zoom clamped');
ok(camera.orbitCamera(original,150,40).yaw!==original.yaw,'orbit changes orientation');
ok(camera.panCamera(original,50,0).targetX!==original.targetX,'pan changes target');
for(const scene of AD_SCENARIOS){const risk=getPath(scene,[]);ok(risk&&risk.length>0,`original path intact ${scene.id}`);const repair=scene.edges.filter(e=>e.weak).map(e=>e.id);ok(getPath(scene,repair)===null,`remediation disconnects path ${scene.id}`);ok(getPath(scene,repair,scene.legitSource,scene.target)!==null,`approved access preserved ${scene.id}`);}
console.log(`v2.4 usability and AD visual checks: ${n} assertions passed.`);
