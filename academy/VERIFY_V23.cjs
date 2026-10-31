const assert=require('node:assert/strict');
const {initialNative,forwardNative,isolateGuest,updateNative,restoreNative}=require('./.native-verify/enterprise/nativeEngine.js');
const {editCable,editPort,editRoute,editRule,moveRule,simulate}=require('./.native-verify/threeD/topologyEngine.js');
const {applyEnterpriseConfig,executeCommand}=require('./.native-verify/unified/engine.js');
let assertions=0;const check=(f)=>{f();assertions++;};
const seed=()=>initialNative();
check(()=>assert.equal(forwardNative(seed()).allowed,true));
check(()=>assert.deepEqual(forwardNative(seed()).physical.path,['ws01','fw','app01']));
check(()=>assert.equal(isolateGuest(seed()),true));
for(const i of [0,1,2,3]){
 const c=seed().topology.cables[i];
 check(()=>{let s=seed();s=updateNative(s,{topology:editCable(s.topology,c.id,false)});if(i<=1)assert.equal(forwardNative(s).allowed,false);else assert.equal(typeof forwardNative(s).allowed,'boolean');});
}
for(const p of ['eth0','eth1'])check(()=>{let s=seed();s=updateNative(s,{topology:editPort(s.topology,'fw',p,{adminUp:false})});assert.equal(forwardNative(s).allowed,false);});
for(const dest of ['dc01','guest'])check(()=>{let s=seed();s=updateNative(s,{topology:editRoute(s.topology,'route-reports',{via:dest})});assert.equal(forwardNative(s).allowed,false);});
check(()=>{let s=seed();s=updateNative(s,{topology:editRule(s.topology,'native-ws-https',{action:'deny'})});assert.equal(forwardNative(s).stage,'topology-policy');});
check(()=>{let s=seed();s=updateNative(s,{topology:editRule(s.topology,'native-guest-deny',{action:'allow'})});assert.equal(isolateGuest(s),false);});
for(const mode of ['disabled','deny','shadow','route','zone','service'])check(()=>{
 let s=seed(),f=structuredClone(s.firewall);
 if(mode==='disabled')f.security[0].enabled=false;
 if(mode==='deny')f.security[0].action='deny';
 if(mode==='shadow')f.security.unshift({...f.security[1],id:'shadow'});
 if(mode==='route')f.dmzRoute=false;
 if(mode==='zone')f.security[0].to='untrust';
 if(mode==='service')f.security[0].service='tcp/22';
 s=updateNative(s,{firewall:f});assert.equal(forwardNative(s).allowed,false);
});
for(const rev of [1,2,3,9])check(()=>{let s=seed();for(let i=0;i<rev;i++)s=updateNative(s,{firewall:structuredClone(s.firewall)});const v=forwardNative(s);assert.equal(v.allowed,true);assert.equal(s.revision,rev);});
for(const bad of [null,{},[],{version:2},{...seed(),version:9},{...seed(),topology:{...seed().topology,nodes:[]}}, {...seed(),firewall:{...seed().firewall,security:null}}, {...seed(),revision:-1}])check(()=>assert.deepEqual(restoreNative(bad),seed()));
check(()=>{const s=seed();assert.deepEqual(restoreNative(s),s);});
check(()=>{let s=seed();s=updateNative(s,{firewall:structuredClone(s.firewall)});const v=forwardNative(s);const r=applyEnterpriseConfig(executeCommand(applyEnterpriseConfig(require('./.native-verify/unified/engine.js').initialState(),{helpdeskReset:true,wsToApp443:true}),'verify monitoring'),{helpdeskReset:true,wsToApp443:v.allowed,nativeRevision:s.revision,nativeReason:v.reason,nativeStage:v.stage});assert.equal(r.tests,null);});
for(const edge of ['c1','c2'])check(()=>{let s=seed();s=updateNative(s,{topology:editCable(s.topology,edge,false)});const v=forwardNative(s);let r=applyEnterpriseConfig(require('./.native-verify/unified/engine.js').initialState(),{helpdeskReset:true,wsToApp443:v.allowed,nativeRevision:s.revision,nativeStage:v.stage,nativeReason:v.reason});r=executeCommand(executeCommand(r,'attack reset svc-reports'),'attack login app01');assert.equal(r.events.some(e=>e.eventId==='4624'&&e.kind==='attack'),false);});
console.log(`PASS v2.3 native enterprise assertions: ${assertions}`);
