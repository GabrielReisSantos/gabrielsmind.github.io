/** Deterministic classroom model. No actual network packets are emitted. */
export type Zone = 'users'|'servers'|'guest'|'ot'|'dmz'|'management';
export const ZONES: {id:Zone;name:string;vlan:number;subnet:string;purpose:string}[] = [
 {id:'users',name:'Corporate users',vlan:10,subnet:'10.10.10.0/24',purpose:'Managed employee workstations'},
 {id:'servers',name:'Application servers',vlan:20,subnet:'10.20.10.0/24',purpose:'Internal application tier'},
 {id:'guest',name:'Guest Wi-Fi',vlan:30,subnet:'10.30.10.0/24',purpose:'Unmanaged devices'},
 {id:'ot',name:'OT / ICS',vlan:50,subnet:'10.50.10.0/24',purpose:'Critical industrial controllers'},
 {id:'dmz',name:'DMZ',vlan:40,subnet:'10.40.10.0/24',purpose:'Internet-facing services'},
 {id:'management',name:'Admin',vlan:99,subnet:'10.99.10.0/24',purpose:'Privileged management plane'}
];
export type SegmentRule = {id:string;source:Zone;destination:Zone;service:'https'|'ssh'|'modbus'|'dns'|'any';action:'allow'|'deny';justification:string};
export type SegmentFlow={source:Zone;destination:Zone;service:SegmentRule['service']};
export const BASE_SEGMENT_RULES:SegmentRule[]=[
 {id:'r1',source:'guest',destination:'ot',service:'any',action:'deny',justification:'Explicit restricted industrial boundary'},
 {id:'r2',source:'users',destination:'servers',service:'https',action:'allow',justification:'App access for employees'},
 {id:'r3',source:'management',destination:'servers',service:'ssh',action:'allow',justification:'Controlled administration'}
];
export function segmentDecision(flow:SegmentFlow,rules:SegmentRule[]):{allowed:boolean;matched:SegmentRule|null;reason:string}{
  const matched=rules.find(rule=>rule.source===flow.source&&rule.destination===flow.destination&&(rule.service===flow.service||rule.service==='any'))??null;
  return {allowed:matched?.action==='allow',matched,reason:matched?`${matched.action.toUpperCase()} by rule ${matched.id}: ${matched.justification}`:'DENY: no matching explicit allow rule (default deny)'};
}
export function exposureScore(rules:SegmentRule[]):number{
  // Count explicitly permitted lateral links. A wildcard counts five illustrative services.
  let count=0;
  for(const source of ZONES){for(const destination of ZONES){if(source.id===destination.id)continue;
    for(const service of ['https','ssh','modbus','dns'] as const){if(segmentDecision({source:source.id,destination:destination.id,service},rules).allowed)count++;}
  }}return count;
}
export function parseIPv4(value:string):number|null{
 const parts=value.trim().split('.');if(parts.length!==4)return null;
 const nums=parts.map(p=>/^\d{1,3}$/.test(p)?Number(p):NaN);
 if(nums.some(n=>!Number.isInteger(n)||n<0||n>255))return null;
 return (((nums[0]*2**24)+(nums[1]<<16)+(nums[2]<<8)+nums[3])>>>0);
}
export function formatIPv4(ip:number):string{return [24,16,8,0].map(n=>(ip>>>n)&255).join('.');}
export function subnetDetails(value:string,prefix:number){
 const ip=parseIPv4(value);if(ip===null||!Number.isInteger(prefix)||prefix<0||prefix>32)return null;
 const mask=prefix===0?0:(0xffffffff << (32-prefix))>>>0;
 const network=(ip&mask)>>>0,broadcast=(network|(~mask>>>0))>>>0;
 const usable=prefix>=31?0:2**(32-prefix)-2;
 return {network:formatIPv4(network),broadcast:formatIPv4(broadcast),mask:formatIPv4(mask),first:usable?formatIPv4((network+1)>>>0):'N/A',last:usable?formatIPv4((broadcast-1)>>>0):'N/A',usable,prefix,ip:formatIPv4(ip)};
}
export type Route = {id:string;cidr:string;nextHop:string;interfaceName:string};
export const BASE_ROUTES:Route[] = [
 {id:'local-users',cidr:'10.10.10.0/24',nextHop:'direct',interfaceName:'Vlan10'},
 {id:'local-servers',cidr:'10.20.10.0/24',nextHop:'direct',interfaceName:'Vlan20'},
 {id:'dmz',cidr:'10.40.10.0/24',nextHop:'10.99.10.1',interfaceName:'ethernet1/3'},
 {id:'default',cidr:'0.0.0.0/0',nextHop:'203.0.113.1',interfaceName:'ethernet1/1'}
];
export function selectRoute(address:string,routes:Route[]):Route|null{
 const ip=parseIPv4(address);if(ip===null)return null;
 return routes.map(r=>{const [addr,prefixText]=r.cidr.split('/');const net=parseIPv4(addr),prefix=Number(prefixText);if(net===null||!Number.isInteger(prefix)||prefix<0||prefix>32)return null;
 const mask=prefix===0?0:(0xffffffff <<(32-prefix))>>>0;
 return (ip&mask)===(net&mask)?{r,prefix}:null;}).filter((x):x is {r:Route;prefix:number}=>x!==null).sort((a,b)=>b.prefix-a.prefix)[0]?.r??null;
}
export type AccessPort={id:string;mode:'access'|'trunk';vlan:number;allowed:number[]};
export const BASE_SWITCH_PORTS:AccessPort[]=[
 {id:'Gi0/1 · PC-A',mode:'access',vlan:10,allowed:[]},
 {id:'Gi0/2 · PC-B',mode:'access',vlan:20,allowed:[]},
 {id:'Gi0/24 · Uplink',mode:'trunk',vlan:1,allowed:[10,20,30,50]}
];
export function validateVlanPath(source:AccessPort,target:AccessPort,trunk:AccessPort):{passed:boolean;steps:string[]}{
 const steps=[`Ingress on ${source.id}: untagged frames assigned VLAN ${source.vlan}.`];
 if(source.mode!=='access'||target.mode!=='access'||trunk.mode!=='trunk')return {passed:false,steps:[...steps,'Topology expects access endpoints and a tagged trunk.']};
 if(!trunk.allowed.includes(source.vlan))return {passed:false,steps:[...steps,`Trunk ${trunk.id} does NOT permit VLAN ${source.vlan}. Frame dropped.`]};
 steps.push(`802.1Q trunk carries VLAN ${source.vlan}.`);
 if(source.vlan!==target.vlan)return {passed:false,steps:[...steps,`Egress ${target.id} belongs to VLAN ${target.vlan}; Layer 2 segmentation prevents delivery. Inter-VLAN routing is required.`]};
 return {passed:true,steps:[...steps,`Egress ${target.id}: tag removed and frame delivered.`]};
}
