/** CyberLab v0.8: one editable, browser-only model shared by links, forwarding, packet replay and CLI. */
import type {CyberScene,DeviceKind,SceneDevice} from './sceneEngine';
export type PortMode='access'|'trunk'|'routed';
export type Interface={id:string;adminUp:boolean;mode:PortMode;accessVlan:number;allowedVlans:number[];ipCidr:string};
export type Node=SceneDevice & {interfaces:Interface[];gateway?:string};
export type Cable={id:string;from:string;fromPort:string;to:string;toPort:string;up:boolean;label:string};
export type Route={id:string;router:string;cidr:string;via:string};
export type Rule={id:string;sourceZone:string;destinationZone:string;port:number;action:'allow'|'deny';enabled:boolean;description:string};
export type Mapping={vip:string;translated:string;enabled:boolean};
export type Topology={sceneId:string;nodes:Node[];cables:Cable[];routes:Route[];rules:Rule[];nat:Mapping|null;revision:number};
export type Flow={source:string;destination:string;port:number;protocol:'tcp';requestedIp?:string};
export type TraceEvent={device:string;kind:'ingress'|'link'|'route'|'nat'|'policy'|'deliver'|'drop';message:string;cableId?:string};
export type Trace={pass:boolean;code:string;reason:string;path:string[];cablePath:string[];events:TraceEvent[];effectiveDestination:string};
export type Exercise={sceneId:string;title:string;objective:string;initialCause:string;hypotheses:string[];correctHypothesis:number;positive:Flow;negative:Flow[];requiredWaypoints:string[];hint:string};
export const EXERCISES:Record<string,Exercise>={
 campus:{sceneId:'campus',title:'Broken 802.1Q uplink',objective:'Restore PC-2 to its VLAN 20 gateway, without bridging guest VLAN 30 into management VLAN 99.',initialCause:'The SW1 trunk omits VLAN 20.',hypotheses:['The client is missing an IPv4 address','VLAN 20 is not permitted by both ends of the trunk','A public DNAT rule is missing'],correctHypothesis:1,positive:{source:'pc',destination:'gw',port:443,protocol:'tcp'},negative:[{source:'guest',destination:'ops',port:443,protocol:'tcp'}],requiredWaypoints:['sw1','sw2'],hint:'Both sides of an 802.1Q trunk must carry the relevant VLAN.'},
 segments:{sceneId:'segments',title:'Security policy shadowing',objective:'Allow analyst HTTPS through NGFW-01 while keeping guest and other segments denied.',initialCause:'A broad deny precedes the narrow TRUST → DMZ HTTPS allow.',hypotheses:['The user-facing firewall interface is down','A deny rule is above the specific permit rule','Source NAT is translating the wrong address'],correctHypothesis:1,positive:{source:'analyst',destination:'web',port:443,protocol:'tcp'},negative:[{source:'guest',destination:'web',port:443,protocol:'tcp'},{source:'analyst',destination:'database',port:1433,protocol:'tcp'}],requiredWaypoints:['fw'],hint:'The rulebase is evaluated from top to bottom, using the first matching entry.'},
 'public-dmz':{sceneId:'public-dmz',title:'Wrong DNAT destination',objective:'Publish only the intended HTTPS VIP to WEB-01; keep management access private.',initialCause:'The public VIP translates to a nonexistent DMZ address.',hypotheses:['The NAT translation points to the wrong server IP','The internet client has the wrong VLAN','The internal web service needs Telnet'],correctHypothesis:0,positive:{source:'internet',destination:'web',port:443,protocol:'tcp',requestedIp:'203.0.113.80'},negative:[{source:'internet',destination:'mgmt',port:443,protocol:'tcp',requestedIp:'203.0.113.81'},{source:'internet',destination:'web',port:22,protocol:'tcp',requestedIp:'203.0.113.80'}],requiredWaypoints:['edge','fw'],hint:'Check the VIP and translated IP against the actual server address.'},
 'oscp-network':{sceneId:'oscp-network',title:'Incorrect internal next hop',objective:'Repair the route to LAB-SRV without granting the scoped auditor access to the AD controller.',initialCause:'The firewall forwards the internal subnet toward AD-CTRL instead of R-INT.',hypotheses:['The firewall route points to the wrong next-hop device','The lab server has stopped listening on HTTPS','The route requires enabling all segmentation rules'],correctHypothesis:0,positive:{source:'auditor',destination:'ot',port:443,protocol:'tcp'},negative:[{source:'auditor',destination:'db',port:5985,protocol:'tcp'}],requiredWaypoints:['gateway','router'],hint:'Inspect the most-specific route selected for 10.50.10.25.'}
};
const node=(t:Topology,id:string)=>t.nodes.find(n=>n.id===id);
const iface=(t:Topology,id:string,port:string)=>node(t,id)?.interfaces.find(p=>p.id===port);
const clone=(t:Topology):Topology=>structuredClone(t);
const CIDR=/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d|[12]\d|3[0-2])$/;
function ipv4(text:string):number|null{const parts=text.split('.');if(parts.length!==4||parts.some(p=>!/^\d{1,3}$/.test(p)||Number(p)>255))return null;return parts.reduce((sum,p)=>sum*256+Number(p),0)>>>0;}
function network(cidr:string):{net:number;mask:number;length:number}|null{const m=CIDR.exec(cidr);if(!m)return null;const ip=ipv4(m.slice(1,5).join('.'));if(ip===null)return null;const length=Number(m[5]);const mask=length===0?0:(0xffffffff<<(32-length))>>>0;return {net:(ip&mask)>>>0,mask,length};}
export function matchesCidr(ip:string,cidr:string):boolean{const value=ipv4(ip),range=network(cidr);return value!==null&&!!range&&((value&range.mask)>>>0)===range.net;}
function pairedSubnet(a:string,b:string):boolean{const x=network(a),y=network(b),ai=ipv4(a.split('/')[0]),bi=ipv4(b.split('/')[0]);return !!x&&!!y&&ai!==null&&bi!==null&&x.length===y.length&&x.net===y.net&&ai!==bi;}
function newPort(id:string):Interface{return {id,adminUp:true,mode:'routed',accessVlan:1,allowedVlans:[10,20,30,99],ipCidr:''};}
function assignedVlan(sceneId:string,n:SceneDevice):number{if(sceneId==='campus')return n.id==='guest'?30:n.id==='ops'?99:20;return 1;}
function role(n:Node):DeviceKind{return n.kind;}
function isRouter(n:Node):boolean{return role(n)==='router'||role(n)==='gateway'||role(n)==='firewall';}
function buildNodes(scene:CyberScene):Node[]{return scene.devices.map(n=>({...n,interfaces:[],gateway:undefined}));}
function reserve(n:Node):Interface{const p=newPort(`eth${n.interfaces.length}`);n.interfaces.push(p);return p;}
export function makeTopology(scene:CyberScene):Topology{
 const nodes=buildNodes(scene);const cables:Cable[]=[];
 scene.links.forEach((l,i)=>{
  const a=nodes.find(n=>n.id===l.from)!,b=nodes.find(n=>n.id===l.to)!,p=reserve(a),q=reserve(b),vlanA=assignedVlan(scene.id,a),vlanB=assignedVlan(scene.id,b);
  if(scene.id==='campus'){
   if(a.kind==='switch'&&b.kind==='switch'){p.mode='trunk';q.mode='trunk';p.allowedVlans=[10,30,99];q.allowedVlans=[10,20,99];}
   else{p.mode='access';q.mode='access';const segment=a.kind==='switch'?vlanB:b.kind==='switch'?vlanA:vlanA;p.accessVlan=segment;q.accessVlan=segment;}
  }else{p.ipCidr=`172.31.${i+1}.1/30`;q.ipCidr=`172.31.${i+1}.2/30`;}
  cables.push({id:`c${i+1}`,from:a.id,fromPort:p.id,to:b.id,toPort:q.id,up:true,label:l.label});
 });
 nodes.forEach(n=>{reserve(n);reserve(n);});
 const routes:Route[]=[],rules:Rule[]=[];
 let nat:Mapping|null=null;
 if(scene.id==='segments'){
  nodes.find(n=>n.id==='analyst')!.gateway='fw';nodes.find(n=>n.id==='guest')!.gateway='fw';
  routes.push({id:'r-dmz',router:'fw',cidr:'10.40.10.0/24',via:'web'},{id:'r-int',router:'fw',cidr:'10.20.10.0/24',via:'database'});
  rules.push({id:'broad-deny',sourceZone:'TRUST',destinationZone:'*',port:0,action:'deny',enabled:true,description:'Broad TRUST to any destination/port deny shadowing HTTPS'},
   {id:'specific-https',sourceZone:'TRUST',destinationZone:'DMZ',port:443,action:'allow',enabled:true,description:'Least-privilege analyst HTTPS'});
 }
 if(scene.id==='public-dmz'){
  nodes.find(n=>n.id==='internet')!.gateway='edge';
  routes.push({id:'r-vip',router:'edge',cidr:'203.0.113.80/32',via:'fw'},{id:'r-internal',router:'fw',cidr:'10.40.10.0/24',via:'web'},
   {id:'r-mgmt',router:'fw',cidr:'10.99.10.0/24',via:'mgmt'});
  rules.push({id:'pub-https',sourceZone:'UNTRUST',destinationZone:'DMZ',port:443,action:'allow',enabled:true,description:'Public HTTPS only'});
  nat={vip:'203.0.113.80',translated:'10.40.10.99',enabled:true};
 }
 if(scene.id==='oscp-network'){
  nodes.find(n=>n.id==='auditor')!.gateway='gateway';
  routes.push({id:'r-lab',router:'gateway',cidr:'10.50.10.0/24',via:'db'},
   {id:'r-ad',router:'gateway',cidr:'10.20.10.0/24',via:'db'},
   {id:'r-hop',router:'router',cidr:'10.50.10.0/24',via:'ot'});
  rules.push({id:'auditor-https',sourceZone:'SCOPE',destinationZone:'INTERNAL',port:443,action:'allow',enabled:true,description:'Scoped audit access to lab HTTPS'});
 }
 return {sceneId:scene.id,nodes,cables,routes,rules,nat,revision:0};
}
export function freePorts(t:Topology,id:string):Interface[]{const used=new Set(t.cables.flatMap(c=>[`${c.from}:${c.fromPort}`,`${c.to}:${c.toPort}`]));return (node(t,id)?.interfaces??[]).filter(p=>!used.has(`${id}:${p.id}`));}
export function addCable(t:Topology,a:string,ap:string,b:string,bp:string):Topology{
 if(a===b||!iface(t,a,ap)||!iface(t,b,bp))throw Error('Select two different devices with valid interfaces.');
 if(!freePorts(t,a).some(p=>p.id===ap)||!freePorts(t,b).some(p=>p.id===bp))throw Error('An interface can carry only one physical cable. Disconnect it first.');
 const next=clone(t),numeric=next.cables.reduce((max,c)=>Math.max(max,Number(c.id.slice(1))||0),0)+1;
 next.cables.push({id:`c${numeric}`,from:a,fromPort:ap,to:b,toPort:bp,up:true,label:'Learner-created link'});next.revision++;return next;
}
export function removeCable(t:Topology,id:string):Topology{const next=clone(t);if(!next.cables.some(c=>c.id===id))throw Error('Cable not found');next.cables=next.cables.filter(c=>c.id!==id);next.revision++;return next;}
export function editCable(t:Topology,id:string,up:boolean):Topology{const next=clone(t),c=next.cables.find(c=>c.id===id);if(!c)throw Error('Cable not found');c.up=up;next.revision++;return next;}
export function editPort(t:Topology,id:string,port:string,changes:Partial<Interface>):Topology{
 const next=clone(t),p=iface(next,id,port);if(!p)throw Error('Port not found');
 if(changes.mode&&!['access','trunk','routed'].includes(changes.mode))throw Error('Invalid port mode');
 if(changes.ipCidr!==undefined&&changes.ipCidr!==''&&!network(changes.ipCidr))throw Error('Use an IPv4 address with a valid prefix, e.g. 172.31.4.1/30');
 if(changes.accessVlan!==undefined&&(!Number.isInteger(changes.accessVlan)||changes.accessVlan<1||changes.accessVlan>4094))throw Error('VLAN must be between 1 and 4094');
 if(changes.allowedVlans!==undefined&&changes.allowedVlans.some(v=>!Number.isInteger(v)||v<1||v>4094))throw Error('Invalid allowed VLAN list');
 Object.assign(p,changes);next.revision++;return next;
}
export function editRoute(t:Topology,id:string,changes:Partial<Pick<Route,'cidr'|'via'>>):Topology{const next=clone(t),r=next.routes.find(r=>r.id===id);if(!r)throw Error('Route not found');if(changes.cidr&&!network(changes.cidr))throw Error('Invalid CIDR route');if(changes.via&&!node(next,changes.via))throw Error('Invalid next hop');Object.assign(r,changes);next.revision++;return next;}
export function editNat(t:Topology,changes:Partial<Mapping>):Topology{if(!t.nat)throw Error('This environment has no NAT policy');const next=clone(t);if(changes.translated&&ipv4(changes.translated)===null)throw Error('Enter a valid translated IPv4 address');if(changes.vip&&ipv4(changes.vip)===null)throw Error('Enter a valid public IPv4 address');Object.assign(next.nat!,changes);next.revision++;return next;}
export function moveRule(t:Topology,id:string,offset:number):Topology{const next=clone(t),idx=next.rules.findIndex(r=>r.id===id),to=idx+offset;if(idx<0||to<0||to>=next.rules.length)return t;[next.rules[idx],next.rules[to]]=[next.rules[to],next.rules[idx]];next.revision++;return next;}
export function editRule(t:Topology,id:string,changes:Partial<Pick<Rule,'enabled'|'action'>>):Topology{const next=clone(t),r=next.rules.find(r=>r.id===id);if(!r)throw Error('Rule not found');Object.assign(r,changes);next.revision++;return next;}
function peers(t:Topology,id:string){return t.cables.filter(c=>c.from===id||c.to===id).map(c=>({c,other:c.from===id?c.to:c.from,port:c.from===id?c.fromPort:c.toPort,otherPort:c.from===id?c.toPort:c.fromPort}));}
function canCross(t:Topology,c:Cable,sourceId:string,vlan:number):string|null{
 if(!c.up)return 'Cable is administratively down';
 const src=sourceId===c.from?iface(t,c.from,c.fromPort):iface(t,c.to,c.toPort),dst=sourceId===c.from?iface(t,c.to,c.toPort):iface(t,c.from,c.fromPort);
 if(!src||!dst)return 'Cable references an unavailable interface';
 if(!src.adminUp||!dst.adminUp)return 'Interface is administratively down';
 if(src.mode==='routed'||dst.mode==='routed'){
  if(src.mode!=='routed'||dst.mode!=='routed')return 'Routed / switchport mode mismatch';
  if(!pairedSubnet(src.ipCidr,dst.ipCidr))return `Transit IP/subnet mismatch (${src.ipCidr||'unset'} vs ${dst.ipCidr||'unset'})`;
 }else{
  for(const p of [src,dst])if(p.mode==='access'&&p.accessVlan!==vlan)return `Access VLAN ${p.accessVlan} rejects VLAN ${vlan}`;
  for(const p of [src,dst])if(p.mode==='trunk'&&!p.allowedVlans.includes(vlan))return `Trunk does not permit VLAN ${vlan}`;
 }
 return null;
}
function findPath(t:Topology,start:string,goal:string,vlan:number,visited:Set<string>,requireUsable=true):string[]{
 const queue:[string,string[]][]=[[start,[start]]],seen=new Set([...visited].filter(x=>x!==start));seen.add(start);
 while(queue.length){const [at,path]=queue.shift()!;if(at===goal)return path;
  for(const p of peers(t,at))if(!seen.has(p.other)&&(!requireUsable||!canCross(t,p.c,at,vlan))){seen.add(p.other);queue.push([p.other,[...path,p.other]]);}
 }
 return [];
}
function bestRoute(t:Topology,id:string,ip:string):Route|undefined{return t.routes.filter(r=>r.router===id&&matchesCidr(ip,r.cidr)).sort((a,b)=>Number(b.cidr.split('/')[1])-Number(a.cidr.split('/')[1]))[0];}
export function simulate(t:Topology,flow:Flow):Trace{
 const src=node(t,flow.source),dst=node(t,flow.destination);
 const path:string[]=src?[src.id]:[],cablePath:string[]=[],events:TraceEvent[]=[],initial=flow.requestedIp??dst?.ip??'',vlan=src?assignedVlan(t.sceneId,src):1;
 let effective=initial;
 const finish=(pass:boolean,code:string,reason:string):Trace=>{events.push({device:path.at(-1)??flow.source,kind:pass?'deliver':'drop',message:reason});return {pass,code,reason,path,cablePath,events,effectiveDestination:effective};};
 if(!src||!dst)return finish(false,'bad-endpoint','Select existing source and destination devices.');
 if(flow.protocol!=='tcp'||flow.port<1||flow.port>65535)return finish(false,'bad-flow','Unsupported synthetic flow.');
 let current=src.id,previous='';
 const visited=new Set<string>();
 for(let ttl=0;ttl<Math.max(12,t.nodes.length*3);ttl++){
  if(visited.has(current))return finish(false,'forwarding-loop',`Loop detected at ${current}.`);
  visited.add(current);const n=node(t,current)!;
  events.push({device:current,kind:'ingress',message:`At ${n.label}, zone ${n.zone}, destination ${effective}`} );
  if(current===dst.id){if(effective!==dst.ip)return finish(false,'wrong-destination',`Reached ${dst.label}, but packet destination ${effective} does not match service IP ${dst.ip}.`);return finish(true,'delivered',`TCP/${flow.port} reaches ${dst.label} through ${path.join(' → ')}.`);}
  if(n.kind==='firewall'&&t.nat&&effective===t.nat.vip){
   if(!t.nat.enabled)return finish(false,'nat-disabled',`No DNAT mapping enabled for ${effective}.`);
   effective=t.nat.translated;events.push({device:current,kind:'nat',message:`DNAT ${initial} → ${effective}`});
   if(!t.nodes.some(candidate=>candidate.ip===effective))return finish(false,'neighbor-unresolved',`DNAT selected ${effective}, but no modeled host owns that destination. Neighbor resolution fails.`);
  }
  if(n.kind==='firewall'){
   const rule=t.rules.find(r=>r.enabled&&(r.sourceZone===src.zone||r.sourceZone==='*')&&(r.destinationZone===dst.zone||r.destinationZone==='*')&&(r.port===flow.port||r.port===0));
   if(!rule||rule.action==='deny')return finish(false,'policy-deny',rule?`Denied by first matching security policy ${rule.id}.`:`Implicit deny: no ${src.zone} → ${dst.zone} TCP/${flow.port} permit.`);
   events.push({device:current,kind:'policy',message:`Allowed by rule ${rule.id} (${src.zone} → ${dst.zone}, TCP/${flow.port}).`});
  }
  let next:string|undefined;
  if(isRouter(n)){
   const route=bestRoute(t,n.id,effective);
   if(!route)return finish(false,'no-route',`${n.label}: no matching route for ${effective}.`);
   next=route.via;events.push({device:current,kind:'route',message:`LPM ${route.cidr} selects next hop ${next}.`});
  }else if(n.kind==='workstation'||n.kind==='server'||n.kind==='directory'){
   if(previous)return finish(false,'non-forwarding-host',`${n.label} is an endpoint, not a router.`);
   if(n.gateway)next=n.gateway;
   else{const walk=findPath(t,current,dst.id,vlan,visited);next=(walk.length?walk:findPath(t,current,dst.id,vlan,visited,false))[1];}
  }else{
   const walk=findPath(t,current,dst.id,vlan,visited);next=(walk.length?walk:findPath(t,current,dst.id,vlan,visited,false))[1];
  }
  if(!next){
   const physical=peers(t,current).some(p=>p.c.up);
   return finish(false,physical?'vlan-or-interface':'no-path',physical?`No forwarding path from ${n.label}: check interface mode, VLAN, administrative state or transit addressing.`:`No active physical path from ${n.label}.`);
  }
  const connection=peers(t,current).find(p=>p.other===next);
  if(!connection)return finish(false,'missing-link',`${n.label}: selected next hop ${next} is not directly cabled.`);
  const blocked=canCross(t,connection.c,current,vlan);
  if(blocked)return finish(false,'interface-failure',`${n.label} → ${next}: ${blocked}.`);
  cablePath.push(connection.c.id);events.push({device:current,kind:'link',cableId:connection.c.id,message:`Forwarded via ${connection.c.id} (${connection.port} → ${connection.otherPort}) to ${next}.`});
  previous=current;current=next;path.push(next);
 }
 return finish(false,'ttl-exceeded','The hop limit was exceeded.');
}
export function evaluate(t:Topology,lesson:Exercise=EXERCISES[t.sceneId]){
 const positive=simulate(t,lesson.positive),negative=lesson.negative.map(flow=>simulate(t,flow));
 const waypointOk=lesson.requiredWaypoints.every(id=>positive.path.includes(id));
 return {positive,negative,waypointOk,secure:positive.pass&&negative.every(r=>!r.pass)&&waypointOk};
}
export function diagnostic(t:Topology,command:string,last:Trace|null=null):string{
 if(command==='show links')return t.cables.map(c=>`${c.id.padEnd(4)} ${c.from}:${c.fromPort} ↔ ${c.to}:${c.toPort}  ${c.up?'UP':'DOWN'}  ${c.label}`).join('\n')||'No physical cables';
 if(command==='show interfaces')return t.nodes.flatMap(n=>n.interfaces.map(p=>`${n.id.padEnd(10)} ${p.id.padEnd(5)} ${p.adminUp?'UP  ':'DOWN'} ${p.mode.padEnd(7)} ${p.mode==='access'?`VLAN ${p.accessVlan}`:p.mode==='trunk'?`allowed ${p.allowedVlans.join(',')}`:p.ipCidr||'IP UNSET'}`)).join('\n');
 if(command==='show routes')return t.routes.map(r=>`${r.router}: ${r.cidr} via ${r.via}`).join('\n')||'No static routes (campus L2 only)';
 if(command==='show policies')return t.rules.map((r,i)=>`${String(i+1).padStart(2)} ${r.enabled?'ON ':'OFF'} ${r.sourceZone} → ${r.destinationZone} TCP/${r.port||'ANY'} ${r.action.toUpperCase()} [${r.id}]`).join('\n')||'No L3 policies in this switching lab';
 if(command==='show nat')return t.nat?`${t.nat.enabled?'ON':'OFF'} VIP ${t.nat.vip} → ${t.nat.translated}`:'No NAT rules';
 if(command==='show packet trace')return last?last.events.map((e,i)=>`${i+1}. ${e.device} / ${e.kind.toUpperCase()}: ${e.message}`).join('\n'):'Run a packet probe first.';
 return 'Supported commands: show links, show interfaces, show routes, show policies, show nat, show packet trace';
}
/** Displayed links are derived from physical cables, never from a fixed training illustration. */
export function renderScene(scene:CyberScene,t:Topology):CyberScene{return {...scene,links:t.cables.map(c=>({id:c.id,from:c.from,to:c.to,label:`${c.fromPort}↔${c.toPort}`,up:c.up})),devices:t.nodes.map(n=>({id:n.id,label:n.label,kind:n.kind,zone:n.zone,ip:n.ip,x:n.x,z:n.z,purpose:n.purpose}))};}
/** Dynamic geometry follows the actual forwarding decisions and terminates on the failing hop. */
export function packetPosition(scene:CyberScene,trace:Trace,fraction:number):{x:number;y:number;z:number}{
 const positions=trace.path.map(id=>scene.devices.find(d=>d.id===id)).filter((d):d is SceneDevice=>!!d);
 if(!positions.length)return {x:0,y:1.7,z:0};if(positions.length===1)return {x:positions[0].x,y:1.7,z:positions[0].z};
 const t=Math.max(0,Math.min(1,fraction))*(positions.length-1),index=Math.min(positions.length-2,Math.floor(t)),part=t-index,a=positions[index],b=positions[index+1];
 return {x:a.x+(b.x-a.x)*part,y:1.7+.12*Math.sin(Math.PI*part),z:a.z+(b.z-a.z)*part};
}
