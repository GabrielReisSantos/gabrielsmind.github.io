/* CyberLab v1.0 source/design invariants — dependency-free. Not a browser rendering test. */
const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const root=__dirname;
const file=(p)=>fs.readFileSync(path.join(root,p),'utf8');
let n=0;function ok(condition,message){assert.ok(condition,message);n++;}
const app=file('src/App.tsx'),dash=file('src/Dashboard.tsx'),world=file('src/threeD/WorldLab.tsx'),shell=file('src/shell.css'),dashboard=file('src/dashboard.css'),range=file('src/threeD/world.css'),vite=file('vite.config.ts'),pkg=JSON.parse(file('package.json'));
for(const f of ['src/App.tsx','src/Dashboard.tsx','src/shell.css','src/dashboard.css','src/threeD/WorldCanvas.tsx','src/threeD/topologyEngine.ts'])ok(fs.existsSync(path.join(root,f)),`required file ${f}`);
for(const name of ['LEARN','LABS & SIMULATION','INVESTIGATE'])ok(app.includes(`heading:'${name}'`),`${name} group`);
for(const id of ['home','foundation','pentest','certification','world','ngfw','studio','webplay','adlab','troubleshoot','correlation','missions'])ok(app.includes(`'${id}'`),`${id} route preserved`);
ok(app.includes("'home'|Destination"),'dashboard included in routes');ok(app.includes('initialPage'),'deep-link route restoration');ok(app.includes('hashchange'),'hash navigation change handler');ok(app.includes('aria-current'),'selected navigation announced');ok(app.includes('aria-label="Application navigation"'),'navigation landmark');ok(app.includes('shell-skip'),'accessible skip button');ok(app.includes('Escape'),'mobile escape close');
for(const token of ['dash-heading','dash-overview','dash-course-grid','dash-lab-grid','dash-info','dash-footer'])ok(dash.includes(token),`${token} dashboard region`);
for(const token of ['cyberlab-ccna-drills-v4','cyberlab-v8-solved-','cyberlab-ngfw-solved-v2','cyberlab-cert-answers-v3','cyberlab-troubleshoot-v5'])ok(file('src/learning/progress.ts').includes(token),`actual progress key ${token}`);
ok(dash.includes('No account or setup required'),'browser-only value proposition');ok(dash.includes('independent')||dash.includes('Independent'),'clear non-affiliation disclaimer');
for(const token of ['world-console','world-collapsible','world-quick-access','world-stage-heading-v1'])ok(world.includes(token),`${token} range UX`);
ok(world.includes('evaluate(topology,lesson)'),'actual topology simulation retained');ok(world.includes('setTopology(next)'),'mutable topology state retained');ok(world.includes('mode===\'exam\'&&!validated'),'exam withheld status');
for(const token of ['@media(max-width:900px)','@media(max-width:620px)','focus-visible','shell-scrim','shell-sidebar'])ok(shell.includes(token),`responsive/a11y ${token}`);
for(const token of ['@media(max-width:760px)','@media(max-width:520px)','dash-art','dash-course'])ok(dashboard.includes(token),`responsive dashboard ${token}`);
ok(range.includes('.world-collapsible'),'3D editor visual update');ok(vite.includes("base: '/training/'"),'subpath assets ready');ok(/^1\.[2-9]\./.test(pkg.version),'package version compatible with 1.0+ design checks');ok(!app.includes('INTERACTIVE · v0.8'),'no stale header version');
console.log(`PASS: ${n} v1.0 design/source contract assertions. Browser rendering and npm build still require a connected PC.`);
