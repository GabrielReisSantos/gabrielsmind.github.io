'use strict';
const assert=require('node:assert/strict');const path=require('node:path');
const root=path.resolve(process.argv[2]||'.campaign-verify');
const c=require(path.join(root,'campaign/engine.js'));
const ent=require(path.join(root,'enterprise/engine.js'));
const nat=require(path.join(root,'enterprise/nativeEngine.js'));
let checks=0;
function ok(v,label){assert.ok(v,label);checks++;}
function eq(a,b,label){assert.deepEqual(a,b,label);checks++;}
function prep(id,e,n,l){if(id==='identity')e=ent.changeEnterprise(e,'helpdeskReset',true,'Enterprise Console');if(id==='pivot'){n=c.setGuestLayer(n,'topology',true);n=c.setGuestLayer(n,'firewall',true);}if(id==='secrets')l={...l,revision:l.revision+1,tokenExposed:true,tokenRotated:false,monitoring:false};l=c.seedMission(l,id);return [e,n,l];}
function report(l,id){return {...l,reports:{...l.reports,[id]:{cause:c.MISSION_INFO[id].rootCause,impact:'The simulated attacker accessed a system via the recorded vulnerability and required investigation.',remediation:'Applied the minimum required remediation to protect the network while retaining the business service.',retest:'Verified negative attacker paths and positive business sessions on the latest revision.'}}};}
function cleanProbes(l,e,n,id){l=c.probeCampaign(l,e,n,'service');l=c.probeCampaign(l,e,n,id==='identity'?'identity':id==='pivot'?'guest':'secret');return l;}
let e=ent.initialEnterprise(),n=nat.initialNative(),l=c.initialCampaign();
eq(l.completed.length,0,'fresh campaign empty');ok(c.inspectCampaign(e,n,l).business,'approved reports work');ok(c.inspectCampaign(e,n,l).identityExposed,'insecure delegation exists for first test');
eq(c.seedMission(l,'pivot'),l,'cannot skip locked campaign mission');
[l]=[c.seedMission(l,'identity')];ok(l.started.includes('identity'),'mission start tracked');
l=c.replayAttack(l,e,n);ok(l.sessions.identity,'identity impersonation creates session');ok(l.events.at(-1).recorded,'online sensor catches replay');ok(l.events.at(-1).observed==='exposure','risk event emitted');
let orig=l.events.at(-1).id;l=c.pinCampaign(l,orig);ok(l.pinned.includes(orig),'evidence pin');
l=report(l,'identity');l=cleanProbes(l,e,n,'identity');l=c.assessCampaign(l,e,n);ok(!l.assessments.identity.passed,'cannot pass with exposed ACL and live session');
e=ent.changeEnterprise(e,'helpdeskReset',false,'Enterprise Console');l={...l,sessions:{...l.sessions,identity:false},revision:l.revision+1};l=c.assessCampaign(l,e,n);ok(!l.assessments.identity.passed,'stale probes not accepted');
l=cleanProbes(l,e,n,'identity');l=c.assessCampaign(l,e,n);ok(l.assessments.identity.passed,'identity remediation verified');ok(l.completed.includes('identity'),'identity mission unlocked pivot');
// New incident carries AD hardening and business connectivity.
[e,n,l]=prep('pivot',e,n,l);ok(!c.inspectCampaign(e,n,l).identityExposed,'AD hardening persists');ok(c.inspectCampaign(e,n,l).guestReachable,'dual control fault actually opens path');
l=c.replayAttack(l,e,n);ok(l.sessions.pivot,'guest path creates attacker session');const pivEv=l.events.at(-1).id;l=c.pinCampaign(l,pivEv);l=report(l,'pivot');
n=c.setGuestLayer(n,'topology',false);ok(!c.inspectCampaign(e,n,l).guestReachable,'single layer blocks end-to-end session');ok(c.inspectCampaign(e,n,l).guestFirewall,'NGFW weak despite topo block');
l={...l,sessions:{...l.sessions,pivot:false},revision:l.revision+1};l=cleanProbes(l,e,n,'pivot');l=c.assessCampaign(l,e,n);ok(!l.assessments.pivot.passed,'single-layer correction insufficient');
n=c.setGuestLayer(n,'firewall',false);l=cleanProbes(l,e,n,'pivot');l=c.assessCampaign(l,e,n);ok(l.assessments.pivot.passed,'dual layer remediation verified');
let revertedIdentity=ent.changeEnterprise(e,'helpdeskReset',true,'Enterprise Console');let cross=l;cross=cleanProbes(cross,revertedIdentity,n,'pivot');cross=c.assessCampaign(cross,revertedIdentity,n);ok(!cross.assessments.pivot.passed,'later mission cannot pass with earlier AD safeguards undone');ok(!c.inspectCampaign(e,n,l).guestTopology&&!c.inspectCampaign(e,n,l).guestFirewall,'both layers deny');
// Wrong repair: availability must remain, not merely security.
let broken=ent.changeEnterprise(e,'wsToApp443',false,'Enterprise Console');let failCase=cleanProbes(l,broken,n,'pivot');failCase=c.assessCampaign(failCase,broken,n);ok(!failCase.assessments.pivot.passed,'breaking business fails scoring');
[e,n,l]=prep('secrets',e,n,l);ok(l.started.includes('secrets'),'third mission unlocked');ok(!c.inspectCampaign(e,n,l).monitoring,'sensor offline seeded');l=c.replayAttack(l,e,n);ok(l.sessions.secrets,'token reuse establishes session');ok(l.dataCopied,'historical data exposure preserved');ok(!l.events.at(-1).recorded,'offline sensor cannot collect threat');
let leakId=l.events.at(-1).id;l=c.pinCampaign(l,leakId);l=report(l,'secrets');
// Sensor restored without token rotation must fail.
l={...l,monitoring:true,revision:l.revision+1};l=c.replayAttack(l,e,n);ok(l.events.at(-1).recorded,'sensor captures second attack');l={...l,sessions:{...l.sessions,secrets:false},revision:l.revision+1};l=cleanProbes(l,e,n,'secrets');l=c.assessCampaign(l,e,n);ok(!l.assessments.secrets.passed,'restored monitoring alone does not revoke token');
// Token rotation without session revocation must fail.
l={...l,tokenRotated:true,revision:l.revision+1,sessions:{...l.sessions,secrets:true}};l=cleanProbes(l,e,n,'secrets');l=c.assessCampaign(l,e,n);ok(!l.assessments.secrets.passed,'rotating credential does not kill existing session');
l={...l,sessions:{...l.sessions,secrets:false},revision:l.revision+1};l=cleanProbes(l,e,n,'secrets');l=c.assessCampaign(l,e,n);ok(l.assessments.secrets.passed,'token, sensor and session fixed');
let revertedGuest=c.setGuestLayer(n,'firewall',true);let regressed=cleanProbes(l,e,revertedGuest,'secrets');regressed=c.assessCampaign(regressed,e,revertedGuest);ok(!regressed.assessments.secrets.passed,'later mission detects guest firewall regression');eq(l.completed,['identity','pivot','secrets'],'complete campaign all three');ok(l.dataCopied,'past data exposure remains acknowledged');
const exported=c.exportCampaign(l,e,n);ok(exported.includes('Historical')===false&&exported.includes('Silent token abuse'),'report exports all missions');
const recovered=c.restoreCampaign(JSON.parse(JSON.stringify(l)));eq(recovered.completed,l.completed,'local progress restores');eq(recovered.events.length,l.events.length,'timeline restores');eq(c.restoreCampaign({version:1,seq:0}),c.initialCampaign(),'invalid persistent record rejected');eq(c.restoreCampaign({...l,reports:{...l.reports,secrets:{...l.reports.secrets,impact:42}}}),c.initialCampaign(),'malformed report rejected');
console.log(`PASS CyberLab v3.0 campaign: ${checks} deterministic assertions (3 complete missions, security-negative scenarios, persistence).`);
