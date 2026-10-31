const assert=require('node:assert/strict');
const path=require('node:path');
const dir=process.argv[2]||'.v14-verify';
const x=require(path.resolve(dir,'engine.js'));
let checks=0;
function ok(statement,label){assert.ok(statement,label);checks++;}
function eq(a,b,label){assert.deepEqual(a,b,label);checks++;}
function run(s,cmd,pin=true){const r=x.execute(s,cmd);eq(r.error,undefined,'fixture allowed '+cmd);s=r.state;const ob=x.evidence(s).at(-1);return pin?x.pin(s,ob.id):s;}
function triage(s){for(const cmd of ['curl -I http://10.10.10.20','show web access','show firewall logs','show processes','show integrity'])s=run(s,cmd);s=run(s,'show forensic timeline');return s;}
function retest(s){for(const cmd of ['test normal','test attack-path','test segmentation'])s=run(s,cmd);return s;}
function report(s){const es=x.evidence(s);for(const e of es){if(e.pinned&&e.revision===0&&['show web access','show firewall logs','show processes'].includes(e.command))s=x.cite(s,'before',e.id);if(e.pinned&&e.revision===s.revision&&['test normal','test attack-path','test segmentation'].includes(e.command))s=x.cite(s,'after',e.id);}return x.setClaims(s,{root:'upload-egress',impact:'controlled-outbound',control:'artifact-upload-egress',summary:'Synthetic web server shows a correlated upload, web process execution and suspicious outbound connection. The evidence does not establish DB compromise.',technical:'The access log records a PHP upload request and retrieval, the process snapshot shows a php-fpm initiated outbound command, and the firewall records an unapproved destination. Controls are fixed and retested.',limitations:'Only the modeled log and host snapshots are available. The synthetic DB connection is explicitly denied, so theft cannot be claimed.'});}
{
 let s=x.startCase();eq(s.revision,0,'start rev');ok(!x.triageReady(s),'not triaged initially');ok(!x.available(s,'show forensic timeline'),'timeline locked');
 const r=x.execute(s,'bash -c "id"');ok(!!r.error,'unknown shell refused');eq(r.state,s,'unknown shell no mutation');
 const lock=x.execute(s,'show forensic timeline');ok(!!lock.error,'timeline gate blocks');
 s=triage(s);ok(x.triageReady(s),'triage ready');ok(x.available(s,'show forensic timeline'),'timeline unlocked');
 eq(x.setDiagnosis(s,'dns').diagnosis,'dns','wrong diagnosis recorded');eq(x.change(x.setDiagnosis(s,'dns'),'quarantine-artifact').revision,0,'wrong diagnosis blocks remediation');
 s=x.setDiagnosis(s,'upload-egress');ok(x.grade(s).checks.diagnosis,'diagnosis supported');
 s=x.change(s,'quarantine-artifact');eq(s.revision,1,'revision on repair');
 s=x.change(s,'validate-uploads');s=x.change(s,'allowlist-egress');eq(s.revision,3,'three repairs applied');
 ok(x.safe(s.config),'strong remediation meets invariants');ok(!x.grade(s).checks.retest,'no stale retest');
 s=retest(s);ok(x.grade(s).checks.retest,'fresh retest passes');ok(!x.grade(s).pass,'report required');
 const saved=JSON.parse(JSON.stringify(s));const restored=x.restore(saved);eq(restored.revision,s.revision,'valid transcript restored');eq(restored.events.length,s.events.length,'same event count');ok(x.grade(restored).checks.retest,'retest survives safe restore');
 s=report(s);ok(x.grade(s).pass,'complete report passes');ok(x.exportReport(s).includes('HISTORICAL'),'report includes historical evidence');
 const tampered=JSON.parse(JSON.stringify(s));tampered.events.find(e=>e.type==='command').evidence.output='fake scan success';eq(x.restore(tampered).events.length,0,'tampered output rejected');
 const tamperedConfig=JSON.parse(JSON.stringify(s));tamperedConfig.config.egress='any';eq(x.restore(tamperedConfig).events.length,0,'tampered current state rejected');
 s=x.change(s,'suppress-log');ok(!x.grade(s).pass,'stale retest after change fails');ok(!x.grade(s).checks.retest,'retest revision invalidation');
}
for(const egress of ['allowlist-egress','egress-proxy']){
 let s=triage(x.startCase());s=x.setDiagnosis(s,'upload-egress');s=x.change(s,'quarantine-artifact');s=x.change(s,'validate-uploads');s=x.change(s,egress);ok(x.safe(s.config),'alternative egress strategy works '+egress);s=retest(s);s=report(s);ok(x.grade(s).pass,'alternative strategy report passes '+egress);
}
for(const unsafe of ['disable-uploads','block-all-egress','suppress-log','reset-dns']){
 let s=triage(x.startCase());s=x.setDiagnosis(s,'upload-egress');s=x.change(s,'quarantine-artifact');s=x.change(s,'validate-uploads');s=x.change(s,'allowlist-egress');s=x.change(s,unsafe);s=retest(s);if(unsafe==='reset-dns'){ok(x.safe(s.config),'no-op DNS cannot change existing safe state');}else{ok(!x.grade(s).checks.retest,`unsafe ${unsafe} rejected`);}
}
{
 const s=run(x.startCase(),'show web access',false);eq(x.triageReady(s),false,'unpinned not enough');
 const d=x.execute(s,'; rm -rf /');ok(!!d.error,'dangerous arbitrary command never executes');
 let a=triage(x.startCase());a=x.setDiagnosis(a,'upload-egress');a=x.change(a,'quarantine-artifact');a=x.change(a,'validate-uploads');a=x.change(a,'allowlist-egress');a=retest(a);a=report(a);
 let fake=JSON.parse(JSON.stringify(a));fake.claims.impact='database-exfil';ok(!x.grade(x.restore(fake)).pass,'incorrect impact claim rejected');
 fake=JSON.parse(JSON.stringify(a));fake.claims.after=[];ok(!x.grade(x.restore(fake)).pass,'missing fresh citations rejected');
 fake=JSON.parse(JSON.stringify(a));fake.claims.technical='tiny';ok(!x.grade(x.restore(fake)).pass,'non-substantive technical note rejected');
}
console.log(`v1.4 investigation engine: ${checks} assertions passed`);
