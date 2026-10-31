const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
let ts;try{ts=require('typescript');}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');}
let n=0;const ok=(x,msg)=>{assert.ok(x,msg);n++};const src=(p)=>fs.readFileSync(p,'utf8');
const d=src('src/adacademy/ADAcademy.tsx'),graph=src('src/adacademy/ADGraphExplorer.tsx'),guide=src('src/experience/HowToUse.tsx');
for(const x of ['saveDrafts','parseSavedDrafts','draftCache','chooseMission','Guided','Independent','YOUR ACTIVE OBJECTIVE','recordActivity'])ok(d.includes(x),`missing AD mission integration ${x}`);
for(const x of ['focusNode','adg-search','visibleEdges','edgeFilter','onInteract','Fit entire graph'])ok(graph.includes(x),`missing graph interaction ${x}`);
for(const x of ['getActivity','guide-observed','ad.command','ad.evidence','ad.retest'])ok(guide.includes(x),`missing measured onboarding ${x}`);
for(const f of ['src/adacademy/ADAcademy.tsx','src/adacademy/ADGraphExplorer.tsx','src/adacademy/drafts.ts','src/adacademy/drafts.test.ts','src/experience/HowToUse.tsx','src/experience/activity.ts','src/experience/activity.test.ts']){const content=src(f),parsed=ts.createSourceFile(f,content,ts.ScriptTarget.Latest,true,f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);ok(parsed.parseDiagnostics.length===0,`syntax ${f}: ${parsed.parseDiagnostics.map(d=>d.messageText).join(',')}`);}
const folder=path.resolve(process.argv[2]||'.v25-verify');const drafts=require(path.join(folder,'adacademy/drafts.js'));const activity=require(path.join(folder,'experience/activity.js'));const ads=require(path.join(folder,'adlab/adEngine.js'));const cli=require(path.join(folder,'adacademy/engine.js'));
const s=ads.AD_SCENARIOS[0];let a=drafts.emptyMission(s);ok(a.revision===0&&a.scenarioId===s.id,'initial case');ok(drafts.parseSavedDrafts('{').active==='acl','invalid storage fallback');ok(drafts.parseSavedDrafts('x'.repeat(180001)).active==='acl','oversized storage fallback');
const result=cli.simulateADCommand('Get-Acl "AD:\\CN=svc-inventory,OU=Services,DC=corp,DC=cyberlab,DC=test"',s,[]);ok(!('error'in result),'valid fixture');
a={...a,baseline:true,pinned:[{id:result.evidenceId,category:result.category,revision:0,output:result.output}],notes:'I found a risky permission that could allow indirect account control.'};
let store={};drafts.saveDrafts({setItem(k,v){store[k]=v;}},s.id,{[s.id]:a});const loaded=drafts.parseSavedDrafts(store[drafts.AD_DRAFT_KEY]);ok(loaded.drafts.acl.notes===a.notes,'notes roundtrip');ok(loaded.drafts.acl.pinned.length===1,'verified evidence persists');
const forged={...a,pinned:[{id:result.evidenceId,category:result.category,revision:0,output:'FAKE'}],disabled:['legit','overacl'],revision:2};const safe=drafts.sanitizeDraft(forged,s);ok(safe.disabled.length===1&&safe.disabled[0]==='overacl','unauthorized edit removed');ok(safe.pinned.length===0,'forged evidence dropped');ok(safe.retest===null,'stale retest dropped');
for(const id of activity.ACTIVITY_IDS)ok(activity.parseActivity(JSON.stringify([id,'bogus'])).includes(id),'valid milestone '+id);
ok(activity.parseActivity('fake').length===0,'corrupted onboarding ignored');
console.log(`v2.5 AD Mission Control: ${n} offline assertions passed.`);
