#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(process.argv[2]||'.enterprise-verify');
const e=require(path.join(root,'enterprise/engine.js'));
const r=require(path.join(root,'unified/engine.js'));
let n=0;const ok=(value,msg)=>{assert.ok(value,msg);n++};
let c=e.initialEnterprise();let s=r.applyEnterpriseConfig(r.initialState(),c);
ok(c.revision===0&&c.helpdeskReset&&c.wsToApp443,'default shared state');
ok(s.aclReset&&s.networkAllowed,'unified projection default');
// Cross module NGFW deny blocks the real attack transition and creates traffic deny without app login
c=e.changeEnterprise(c,'wsToApp443',false,'NGFW Simulator');
s=r.applyEnterpriseConfig(s,c);
ok(!s.networkAllowed&&s.revision===1,'NGFW update changes mission state and revision');
s=r.executeCommand(s,'attack reset svc-reports');s=r.executeCommand(s,'attack login app01');
ok(s.events.some(v=>v.eventId==='4724'&&v.kind==='attack'),'reset still allowed on AD');
ok(s.events.some(v=>v.eventId==='TRAFFIC'&&v.outcome==='deny'),'NGFW deny recorded');
ok(!s.events.some(v=>v.eventId==='4624'&&v.kind==='attack'),'NGFW deny prevents new application logon');
ok(!s.sessionActive,'NGFW deny prevents new session');
ok(s.commands.at(-1).output.includes('NETWORK DENIED'),'clear denial diagnostic');
const blockedEvents=s.events.length;
s=r.executeCommand(s,'network trace app01');
ok(s.events.length===blockedEvents+1&&s.events.at(-1).outcome==='deny','path trace follows firewall policy');
const oldRev=s.revision;
c=e.changeEnterprise(c,'wsToApp443',true,'3D Network Range');s=r.applyEnterpriseConfig(s,c);
ok(s.networkAllowed&&s.revision===oldRev+1,'3D toggling the same NGFW control restores reachability');
s=r.executeCommand(s,'attack login app01');
ok(s.events.some(v=>v.eventId==='4624'&&v.kind==='attack'),'stolen credential works only when network also reaches APP01');
ok(s.sessionActive,'application session correctly created after path restored');
// AD Academy edits must affect Unified Range without erasing previously generated evidence.
const eventCount=s.events.length;
c=e.changeEnterprise(c,'helpdeskReset',false,'AD Academy');s=r.applyEnterpriseConfig(s,c);
ok(!s.aclReset,'AD delegated-reset right removed cross-module');
ok(s.events.length===eventCount,'previous telemetry retained');
s=r.executeCommand(s,'attack reset svc-reports');
ok(s.commands.at(-1).output.startsWith('DENIED'),'new reset attempt denied');
ok(s.events.filter(v=>v.eventId==='4724'&&v.kind==='attack').length===1,'no fabricated 4724 after ACL removal');
ok(s.sessionActive,'existing session not magically revoked by AD ACL change');
ok(r.gradeRange(s).complete===false,'cross module security change not treated as finished remediation');
// Exercises with custom saved evidence must invalidate verification on cross-module configuration edits.
let t=r.executeCommand(r.initialState(),'verify attack');t=r.executeCommand(t,'verify service');
ok(t.tests!==null,'before shared change has retest state');
t=r.applyEnterpriseConfig(t,{helpdeskReset:false,wsToApp443:false});
ok(t.tests===null&&t.revision===1,'shared changes invalidate stale retest');
ok(r.applyEnterpriseConfig(t,{helpdeskReset:false,wsToApp443:false})===t,'idempotent projections');
// Restore fuzzing: malformed, foreign, forged keys and overgrown logs must be rejected.
for(const payload of [null,{},[],{...c,version:7},{...c,helpdeskReset:'false'},{...c,revision:-1},{...c,changes:[{revision:999,key:'__proto__',from:true,to:false,origin:'AD Academy'}]},{...c,changes:Array.from({length:51},()=>c.changes[0])}]){
 const z=e.restoreEnterprise(payload);ok(z.revision===0&&z.helpdeskReset&&z.wsToApp443,'malformed data reverts to explicitly vulnerable training defaults');
}
ok(e.restoreEnterprise(c).revision===c.revision,'valid state restored');
ok(e.restoreEnterprise(c).changes.length===c.changes.length,'history retained');
ok(e.changeEnterprise(c,'helpdeskReset',false,'AD Academy')===c,'no-op change must not alter revision');
for(const origin of ['AD Academy','NGFW Simulator','3D Network Range','Unified Cyber Range','Enterprise Console']){
 const changed=e.changeEnterprise(e.initialEnterprise(),'wsToApp443',false,origin);
 ok(changed.changes[0].origin===origin,'origin attribution preserved');
}
let chain=e.initialEnterprise();for(let i=0;i<90;i++){chain=e.changeEnterprise(chain,'wsToApp443',i%2!==0,'Enterprise Console');}
ok(chain.changes.length<=30,'history bounded');
ok(e.restoreEnterprise(chain).changes.length===chain.changes.length,'bounded history rehydrates');
for(const file of ['src/enterprise/store.ts','src/enterprise/EnterpriseLink.tsx','src/enterprise/enterprise.css','src/unified/UnifiedRange.tsx','src/adacademy/ADAcademy.tsx','src/ngfw/NgfwWorkspace.tsx','src/threeD/WorldLab.tsx']){
 ok(fs.existsSync(file),file+' exists');
}
for(const file of ['src/adacademy/ADAcademy.tsx','src/ngfw/NgfwWorkspace.tsx','src/threeD/WorldLab.tsx','src/unified/UnifiedRange.tsx']){
 ok(fs.readFileSync(file,'utf8').includes('<EnterpriseLink'),'shared control UI connected to '+file);
}
ok(fs.readFileSync('src/learning/backupEngine.ts','utf8').includes('cyberlab-'),'backup includes enterprise key by prefix');
ok(fs.readFileSync('package.json','utf8').includes('verify:enterprise'),'enterprise verifier wired');
console.log(`PASS ${n} Enterprise Bridge v2.2 assertions`);
