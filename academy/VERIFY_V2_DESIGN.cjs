/* v2.x source-design invariants. Not a substitute for rendered/browser inspection. */
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,p),'utf8');let total=0;
function gate(ok,label){assert.ok(ok,label);total++;}
const app=read('src/experience/App.tsx'),dashboard=read('src/experience/Dashboard.tsx'),catalog=read('src/experience/Catalog.tsx'),routes=read('src/experience/routes.ts'),css=read('src/experience/experience.css'),world=read('src/threeD/WorldLab.tsx'),vconfig=read('vite.config.ts');
for(const f of ['src/App.tsx','src/experience/App.tsx','src/experience/Dashboard.tsx','src/experience/Catalog.tsx','src/experience/routes.ts','src/experience/experience.css','src/threeD/WorldCanvas.tsx','src/threeD/topologyEngine.ts'])gate(fs.existsSync(path.join(__dirname,f)),`file: ${f}`);
for(const group of ['home','learn','labs','investigate','certifications','progress'])gate(app.includes(`id:'${group}'`),`six-group navigation: ${group}`);
for(const id of ['foundation','pentest','adlab','certification','world','ngfw','studio','webplay','purple','incident','investigation2','practice','troubleshoot','correlation','missions'])gate(routes.includes(`${id}:`),`route ${id}`);
for(const attr of ['aria-label="Application navigation"','aria-current','aria-label="Open navigation"','shell-skip','Escape','hashchange','Suspense','lazy('])gate(app.includes(attr),`app accessibility/deep-link ${attr}`);
for(const section of ['ux-hero','ux-stats','ux-path-grid','ux-feature-grid','ux-disclaimer','Resume','Start learning','readSnapshot','ProgressBackup'])gate(dashboard.includes(section),`dashboard ${section}`);
for(const section of ['routesFor(section)','ux-catalog-grid','ux-progress-grid','role="progressbar"','My Progress','Activity'])gate(catalog.includes(section)||dashboard.includes(section)||app.includes(section),`catalog ${section}`);
for(const section of [':root','--ux-surface','@media(max-width:760px)','@media(max-width:500px)','focus-visible','prefers-reduced-motion','ux-path-card','pt-journey','cert-modebar'])gate(css.includes(section)||read('src/shell.css').includes(section),`style ${section}`);
for(const source of ['src/purple/PurpleLab.tsx','src/certification/CertificationCenter.tsx'])gate(fs.existsSync(path.join(__dirname,source)),`existing interface preserved ${source}`);
for(const name of ['pt-red','pt-defense','pt-telemetry','pt-report'])gate(read('src/purple/PurpleLab.tsx').includes(name),`purple stage ${name}`);
for(const state of ["mode==='learn'","mode==='mock'","mode==='review'",'cert-modebar','saveAttempt'])gate(read('src/certification/CertificationCenter.tsx').includes(state),`certification workflow ${state}`);
for(const name of ['world-console','world-collapsible','world-quick-access','world-stage-heading-v1','evaluate(topology,lesson)','setTopology(next)'])gate(world.includes(name),`preserved 3D interaction ${name}`);
gate(vconfig.includes("base: '/training/'"),'GitHub pages base preserved');gate(/^(?:2|3)\.(?:0|1|2|3|4|5|6|7|8|9)\./.test(JSON.parse(read('package.json')).version),'version bumped');
console.log(`CyberLab v2.x design: ${total} source-invariant assertions passed (no actual rendering test).`);
