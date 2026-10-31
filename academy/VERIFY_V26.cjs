/** Standalone v2.6 password auditing regression (no npm dependencies). */
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.argv[2]||'.passwords-verify';const e=require(path.resolve(base,'engine.js'));
let count=0;const ok=(condition,label)=>{assert.ok(condition,label);count++;};
(async()=>{
 ok(e.STAGES.length===8,'eight steps');ok(Object.keys(e.HASHES).length===3,'three synthetic fixtures');
 for(const [id,target] of Object.entries(e.HASHES)){ok(/^[a-f\d]{64}$/.test(target),`format ${id}`);}
 ok(await e.sha256('orbit2026')===e.HASHES['demo-analyst'],'real sha256 demo');
 ok(await e.sha256('orbit2026!')===e.HASHES['svc-reports'],'real sha256 service');
 ok(await e.sha256('sun42')===e.HASHES['guest-demo'],'real sha256 mask');
 ok(e.maskKeyspace('?l?l?d?d')===67600,'keyspace');ok(e.maskKeyspace('bad')===null,'invalid mask');
 let s=e.createState();const commands=['cat scope.txt','cat hashes.txt','cat provenance.txt','hashcat -m 1400 --example-hashes','hashcat -b -m 1400','keyspace ?l?l?d?d','hashcat -m 1400 -a 0 hashes.txt shortlist.txt','hashcat -m 1400 -a 0 hashes.txt shortlist.txt -r rules/append-bang.rule','hashcat -m 1400 -a 3 hashes.txt -1 sun ?1?1?1?d?d','john --format=raw-sha256 --wordlist=shortlist.txt hashes.txt','policy inspect','policy set kdf argon2id','policy rotate all','policy test'];
 // Cannot bypass authorization & provenance.
 let early=await e.execute(s,commands[6]);ok(!early.entry.success,'dictionary blocked until other stages');ok(early.state.completed.length===0,'no false progress');
 let blocked=await e.execute(s,'hashcat -m 1400 -a 3 hashes.txt -1 sun ?1?1?1?d?d; echo hacked');ok(!blocked.entry.success,'shell operators rejected');
 for(const [i,command] of commands.entries()){const result=await e.execute(s,command);ok(result.entry.success,`valid command ${i}: ${command}`);ok(result.state.commands.length===i+1,`saved exact recognized command ${i}`);s=result.state;}
 ok(s.completed.length===8,'all steps validated');ok(s.recovered.includes('demo-analyst'),'dictionary recovered synthetic user');ok(s.recovered.includes('svc-reports'),'rule recovered synthetic service');ok(s.recovered.includes('guest-demo'),'bounded mask recovered synthetic guest');ok(s.verified,'policy retest');
 ok(!e.grade(s,'too short').pass,'short report blocked');ok(e.grade(s,'A sufficiently detailed original audit report explaining why an unsalted fast digest is dangerous, which authorized guesses matched, and why credential rotation is separate from storage migration.').pass,'full report validated');
 const persisted=e.savePayload(s,'A plausible written note, not accepted as proof of results.','independent');ok(!('completed' in persisted),'saved material has no trusted claimed completion');ok(!('recovered' in persisted),'saved data avoids recovered passwords');
 const replay=await e.restore(persisted);ok(replay.state.completed.length===8,'replay valid commands');ok(replay.state.verified,'replay valid retest');ok(replay.mode==='independent','restore mode');
 const forged=await e.restore({version:1,commands:['policy test','hashcat -m 1400 -a 0 hashes.txt shortlist.txt'],notes:'spoofed',completed:e.STAGES.map(x=>x.id),verified:true});ok(forged.state.completed.length===0,'forgery cannot restore completion');ok(!forged.state.verified,'forgery cannot restore retest');
 const bad=await e.restore({version:1,commands:['cat scope.txt','cat hashes.txt','cat provenance.txt','hashcat -m 1400 --example-hashes','hashcat -b -m 1400','keyspace ?l?l?d?d','hashcat -m 1400 -a 0 hashes.txt shortlist.txt','hashcat -m 9999 -a 0 hashes.txt shortlist.txt']});ok(bad.state.completed.length===4,'bad hash mode not credited');
 let unprotected=e.createState();for(const c of commands.slice(0,-4))unprotected=(await e.execute(unprotected,c)).state;
 unprotected=(await e.execute(unprotected,'policy inspect')).state;
 const weak=await e.execute(unprotected,'policy test');ok(!weak.entry.success,'retest rejects weak policy');
 let changed=(await e.execute(unprotected,'policy set kdf argon2id')).state;const partial=await e.execute(changed,'policy test');ok(!partial.entry.success,'slow KDF alone insufficient');changed=(await e.execute(changed,'policy rotate all')).state;const fixed=await e.execute(changed,'policy test');ok(fixed.entry.success,'both defenses accepted');
 const root=process.cwd();const routes=fs.readFileSync(path.join(root,'src/experience/routes.ts'),'utf8');ok(routes.includes('passwords:{label:'),'route registered');const app=fs.readFileSync(path.join(root,'src/experience/App.tsx'),'utf8');ok(app.includes("page==='passwords'"),'render wired');const packageJSON=require(path.resolve('package.json'));ok(packageJSON.scripts['verify:all'].includes('verify:passwords'),'included in full suite');
 console.log(`VERIFY_V26 PASS: ${count} assertions; real local SHA-256, bounded masks, policy dependencies, replay and integration.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
