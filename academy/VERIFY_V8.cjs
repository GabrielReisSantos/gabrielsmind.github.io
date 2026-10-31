/* Browser-only topology engine contract tests. Run with CommonJS output directory as argv[2]. */
const assert=require('node:assert/strict'),path=require('node:path');
const folder=process.argv[2]?path.resolve(process.argv[2]):'';if(!folder)throw Error('Specify compiled output directory');
const {SCENES,sceneById}=require(path.join(folder,'sceneEngine.js'));
const e=require(path.join(folder,'topologyEngine.js'));
let count=0;function ok(value,label){assert.ok(value,label);count++;}function eq(actual,wanted,label){assert.deepEqual(actual,wanted,label);count++;}
const initial=id=>e.makeTopology(sceneById(id));
const repaired=id=>{let t=initial(id);switch(id){case 'campus':return e.editPort(t,'sw1','eth1',{allowedVlans:[10,20,30,99]});case 'segments':return e.moveRule(t,'specific-https',-1);case 'public-dmz':return e.editNat(t,{translated:'10.40.10.20'});case 'oscp-network':return e.editRoute(t,'r-lab',{via:'router'});default:throw Error(id);}};
for(const s of SCENES){
 const t=initial(s.id),fault=e.evaluate(t),fix=repaired(s.id),result=e.evaluate(fix);
 ok(!fault.positive.pass,`${s.id} starts with a genuine failure`);
 ok(result.positive.pass,`${s.id} can be fixed`);
 ok(result.secure,`${s.id} correct repair preserves restrictions`);
 ok(result.waypointOk,`${s.id} route includes required security/infrastructure waypoints`);
 ok(result.negative.every(n=>!n.pass),`${s.id} negative flows are blocked`);
 ok(fix.revision>t.revision,`${s.id} edit increments network revision`);
 eq(e.renderScene(s,fix).links.length,fix.cables.length,`${s.id} render uses current physical cables`);
 eq(result.positive.cablePath.length,result.positive.path.length-1,`${s.id} every traversed hop has cable identity`);
 for(let i=0;i<result.positive.cablePath.length;i++){
  const cable=fix.cables.find(c=>c.id===result.positive.cablePath[i]);
  ok(!!cable&&[cable.from,cable.to].includes(result.positive.path[i])&&[cable.from,cable.to].includes(result.positive.path[i+1]),`${s.id} trace traverses actual cable ${i}`);
 }
 const start=e.packetPosition(s,result.positive,0),end=e.packetPosition(s,result.positive,1);
 const x=s.devices.find(n=>n.id===result.positive.path[0]),y=s.devices.find(n=>n.id===result.positive.path.at(-1));
 eq([start.x,start.z],[x.x,x.z],`${s.id} animation starts at actual ingress`);
 eq([end.x,end.z],[y.x,y.z],`${s.id} animation ends on actual last hop`);
 for(const p of [.01,.35,.65,.99]){const v=e.packetPosition(s,result.positive,p);ok([v.x,v.y,v.z].every(Number.isFinite),`${s.id} finite animation coordinates`);}
 const cable=fix.cables.find(c=>result.positive.cablePath.includes(c.id));
 if(cable){const down=e.editCable(fix,cable.id,false),downFlow=e.evaluate(down);ok(!downFlow.positive.pass,`${s.id} unplugging traffic path breaks delivery`);ok(!downFlow.secure,`${s.id} unplug not graded as successful repair`);ok(e.renderScene(s,down).links.some(l=>l.id===cable.id&&l.up===false),`${s.id} render shows disabled cable`);
 const off=e.editPort(fix,cable.from,cable.fromPort,{adminUp:false});ok(!e.evaluate(off).positive.pass,`${s.id} interface shutdown breaks forwarding`);
 ok(e.evaluate(e.editCable(down,cable.id,true)).positive.pass,`${s.id} re-enabling restores forwarding`);
 const no=e.removeCable(fix,cable.id);ok(!e.evaluate(no).positive.pass,`${s.id} removing physical cable breaks forwarding`);ok(!e.renderScene(s,no).links.some(l=>l.id===cable.id),`${s.id} removing cable removes rendered geometry`);
 const reattached=e.addCable(no,cable.from,cable.fromPort,cable.to,cable.toPort);ok(e.evaluate(reattached).positive.pass,`${s.id} reconnecting original ports restores forwarding`);
 eq(e.renderScene(s,reattached).links.length,reattached.cables.length,`${s.id} physical graph stays synchronized after reconnect`);
 }
 for(const cmd of ['show links','show interfaces','show routes','show policies','show nat','show packet trace'])ok(typeof e.diagnostic(fix,cmd,result.positive)==='string',`${s.id} ${cmd} diagnostic stable`);
 ok(e.diagnostic(fix,'show packet trace',result.positive).includes('Forwarded via'),`${s.id} packet trace derived from real links`);
 ok(fix.nodes.every(n=>new Set(n.interfaces.map(p=>p.id)).size===n.interfaces.length),`${s.id} unique port labels per device`);
 ok(fix.cables.every(c=>!!fix.nodes.find(n=>n.id===c.from)?.interfaces.find(p=>p.id===c.fromPort)&&!!fix.nodes.find(n=>n.id===c.to)?.interfaces.find(p=>p.id===c.toPort)),`${s.id} cables terminate on real ports`);
}
const campus=initial('campus');eq(e.evaluate(campus).positive.code,'interface-failure','baseline VLAN failure detected at trunk');
ok(e.evaluate(campus).positive.path.includes('sw1'),'VLAN failure trace reaches offending switch');
const campusFix=repaired('campus');
const vlanMismatch=e.editPort(campusFix,'sw2','eth0',{allowedVlans:[10,99]});eq(e.evaluate(vlanMismatch).positive.code,'interface-failure','other trunk endpoint can independently block VLAN');
const vlanWrongAccess=e.editPort(campusFix,'pc','eth0',{accessVlan:30});ok(!e.evaluate(vlanWrongAccess).positive.pass,'access port VLAN change affects forwarding');
const bridged=e.editPort(e.editPort(e.editPort(campusFix,'ops','eth0',{accessVlan:30}),'sw2','eth2',{accessVlan:30}),'sw2','eth0',{allowedVlans:[10,20,30,99]});
ok(e.evaluate(bridged).negative[0].pass,'unintended VLAN bridge becomes visibly reachable');ok(!e.evaluate(bridged).secure,'segmentation violation cannot be graded as a repair');
const segment=initial('segments');eq(e.evaluate(segment).positive.code,'policy-deny','rule shadowing blocks initially');
ok(e.evaluate(e.editRule(segment,'broad-deny',{action:'allow'})).positive.pass,'unsafe broad-allow restores connection');
ok(e.evaluate(e.editRule(segment,'broad-deny',{action:'allow'})).negative.some(r=>r.pass),'unsafe broad-allow leaks database traffic');
ok(!e.evaluate(e.editRule(segment,'broad-deny',{action:'allow'})).secure,'grading rejects allow-all shortcut');
ok(e.evaluate(e.moveRule(segment,'specific-https',-1)).secure,'least privilege ordering passes');
const publicNet=initial('public-dmz');eq(e.evaluate(publicNet).positive.code,'neighbor-unresolved','wrong DNAT target fails modeled neighbor resolution');
eq(e.evaluate(e.editNat(publicNet,{enabled:false})).positive.code,'nat-disabled','disabling DNAT blocks VIP');
ok(!e.evaluate(e.editNat(publicNet,{vip:'203.0.113.81'})).positive.pass,'modifying VIP changes routing/NAT result');
ok(e.evaluate(repaired('public-dmz')).secure,'correct DNAT fixes published service without SSH exposure');
const oscp=initial('oscp-network');eq(e.evaluate(oscp).positive.code,'non-forwarding-host','wrong next-hop reaches an endpoint');
ok(e.evaluate(repaired('oscp-network')).positive.path.includes('router'),'correct route goes through intended router');
const oscpFix=repaired('oscp-network');
const hop=oscpFix.cables.find(c=>c.from==='gateway'&&c.to==='router');
const addressing=e.editPort(oscpFix,hop.from,hop.fromPort,{ipCidr:'172.30.240.1/30'});
eq(e.evaluate(addressing).positive.code,'interface-failure','transit subnet mismatch blocks packet');
const addressingFix=e.editPort(addressing,hop.to,hop.toPort,{ipCidr:'172.30.240.2/30'});
ok(e.evaluate(addressingFix).secure,'fixing both interface addresses restores traffic');
const wrongMode=e.editPort(oscpFix,hop.from,hop.fromPort,{mode:'trunk'});
ok(!e.evaluate(wrongMode).positive.pass,'changing routed interface to trunk breaks link');
const wrongRoute=e.editRoute(oscpFix,'r-lab',{cidr:'10.60.10.0/24'});
eq(e.evaluate(wrongRoute).positive.code,'no-route','changing route prefix prevents longest-prefix match');
let rewire=e.removeCable(oscpFix,hop.id);
const a=e.freePorts(rewire,'gateway').find(p=>p.id==='eth1'),b=e.freePorts(rewire,'router').find(p=>p.id==='eth0');
ok(!!a&&!!b,'freed port inventory reflects disconnected cable');
rewire=e.addCable(rewire,'gateway','eth1','router','eth0');ok(e.evaluate(rewire).secure,'rewired link changes graph and recovers path');
const direct=e.addCable(oscpFix,'auditor','eth1','ot','eth1');ok(!e.evaluate(direct).positive.path.includes('eth1'),'default gateway steering cannot be bypassed by directly cabling workstations');
for(const fn of [()=>e.addCable(oscpFix,'gateway','eth1','db','eth2'),()=>e.addCable(oscpFix,'gateway','eth4','gateway','eth5'),()=>e.editPort(oscpFix,'gateway','eth1',{ipCidr:'999.9.0.1/33'}),()=>e.editRoute(oscpFix,'r-lab',{cidr:'bad'}),()=>e.editNat(publicNet,{vip:'broken'})]){assert.throws(fn);count++;}
for(const ip of ['10.50.10.25','10.50.10.254'])ok(e.matchesCidr(ip,'10.50.10.0/24'),'CIDR accepts address in network');
for(const ip of ['10.51.10.25','198.51.100.1'])ok(!e.matchesCidr(ip,'10.50.10.0/24'),'CIDR excludes outside addresses');
ok(!e.matchesCidr('bad','10.50.10.0/24'),'bad IP never matches');
console.log(`PASS: ${count} topology v0.8 link/port/route/policy/NAT/3D integrity assertions`);
