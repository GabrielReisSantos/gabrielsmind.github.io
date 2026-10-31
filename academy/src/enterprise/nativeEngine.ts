/** Native enterprise forwarding adapter. All traffic is local deterministic data;
 * physical reachability is computed by 3D topologyEngine.simulate, followed by
 * the NGFW engine's actual ordered security/NAT/session evaluation.
 * This module does not manipulate any of the older standalone exercises. */
import {makeTopology,simulate,type Topology,type Trace,type Flow} from '../threeD/topologyEngine';
import type {CyberScene} from '../threeD/sceneEngine';
import {evaluate as evaluateNgfw,type LabConfig,type Evaluation as NgfwEvaluation,type Traffic} from '../ngfw/engine';

export const NATIVE_SCENE:CyberScene={
 id:'enterprise-native',title:'UR-001 · Native enterprise',subtitle:'PHYSICAL LINKS · ROUTING · NGFW',
 brief:'Trace WS01 → NGFW → APP01 through actual editable links, interfaces, routes and ordered firewall rules.',
 caseId:'enterprise-native',track:'NGFW',learningTarget:'Preserve approved reporting and prevent unwanted workstation access.',
 devices:[
  {id:'ws01',label:'WS01',kind:'workstation',zone:'TRUST',ip:'10.10.10.42',x:-5,z:1,purpose:'Helpdesk workstation'},
  {id:'fw',label:'NGFW',kind:'firewall',zone:'SECURITY',ip:'10.10.10.1',x:0,z:0,purpose:'Shared security boundary'},
  {id:'app01',label:'APP01',kind:'server',zone:'DMZ',ip:'10.20.10.20',x:5,z:1,purpose:'Reports API HTTPS'},
  {id:'dc01',label:'DC01',kind:'directory',zone:'TRUST',ip:'10.10.10.10',x:-2,z:-3,purpose:'Fictional domain controller'},
  {id:'guest',label:'GUEST',kind:'workstation',zone:'GUEST',ip:'10.30.10.25',x:4,z:-3,purpose:'Denied guest network'}
 ],
 links:[{from:'ws01',to:'fw',label:'Trust ingress'},{from:'fw',to:'app01',label:'DMZ uplink'},{from:'dc01',to:'fw',label:'Directory'},{from:'guest',to:'fw',label:'Guest ingress'}],
 packetPath:['ws01','fw','app01']
};
const PRIMARY:Flow={source:'ws01',destination:'app01',port:443,protocol:'tcp'};
const GUEST:Flow={source:'guest',destination:'app01',port:443,protocol:'tcp'};
export const NATIVE_TRAFFIC:Traffic={id:'enterprise-https',label:'WS01 to APP01',summary:'Scoped HTTPS flow from helpdesk WS01 to APP01',src:'10.10.10.42',dst:'10.20.10.20',sport:52042,dport:443,proto:'tcp',app:'ssl',flag:'SYN'};

export function initialNativeTopology():Topology{
 const topology=makeTopology(NATIVE_SCENE);
 topology.nodes.find(n=>n.id==='ws01')!.gateway='fw';
 topology.nodes.find(n=>n.id==='guest')!.gateway='fw';
 topology.nodes.find(n=>n.id==='dc01')!.gateway='fw';
 topology.routes=[{id:'route-reports',router:'fw',cidr:'10.20.10.0/24',via:'app01'},
  {id:'route-directory',router:'fw',cidr:'10.10.10.10/32',via:'dc01'}];
 topology.rules=[{id:'native-ws-https',sourceZone:'TRUST',destinationZone:'DMZ',port:443,action:'allow',enabled:true,description:'Enterprise WS01 to APP01 HTTPS training flow'},
  {id:'native-guest-deny',sourceZone:'GUEST',destinationZone:'DMZ',port:443,action:'deny',enabled:true,description:'Block guest access to the reporting service'}];
 return topology;
}
export function initialNativeNgfw():LabConfig{return {dmzRoute:true,decrypt:false,threatPrevention:true,nat:[],security:[
 {id:'enterprise-allow-https',name:'Enterprise WS01 → APP01 HTTPS',from:'trust',to:'dmz',destination:'10.20.10.20',app:'ssl',service:'application-default',action:'allow',profile:true,enabled:true},
 {id:'enterprise-deny-other',name:'Deny non-approved traffic',from:'any',to:'any',destination:'any',app:'any',service:'any',action:'deny',profile:false,enabled:true}
]};}
export type NativeEnterprise={version:1;revision:number;topology:Topology;firewall:LabConfig};
export const NATIVE_STORAGE='cyberlab-native-enterprise-v23';
export const initialNative=():NativeEnterprise=>({version:1,revision:0,topology:initialNativeTopology(),firewall:initialNativeNgfw()});
export type ForwardResult={allowed:boolean;stage:'physical'|'routing'|'topology-policy'|'ngfw-policy'|'delivered';reason:string;physical:Trace;firewall:NgfwEvaluation|null;path:string[];configRevision:number;rule:string|null};

/** Native 3D forwarding has final say over physical path and router/policy rules;
 * NGFW's ordered rulebase and zones must independently permit the traffic. */
export function forwardNative(state:NativeEnterprise):ForwardResult{
 const physical=simulate(state.topology,PRIMARY);
 const firewall=physical.pass?evaluateNgfw(NATIVE_TRAFFIC,state.firewall,[]):null;
 let stage:ForwardResult['stage']='delivered';
 if(!physical.pass)stage=physical.code==='policy-deny'?'topology-policy':['no-route','missing-link','forwarding-loop','ttl-exceeded','non-forwarding-host'].includes(physical.code)?'routing':'physical';
 else if(firewall?.verdict==='deny')stage=firewall.actionSource==='route'?'routing':'ngfw-policy';
 const allowed=physical.pass&&firewall?.verdict==='allow';
 return {allowed,stage,reason:!physical.pass?physical.reason:firewall?.reason??'NGFW evaluation unavailable',physical,firewall,path:physical.path,configRevision:state.revision,rule:firewall?.matchedRule??null};
}
export function isolateGuest(state:NativeEnterprise):boolean{return !simulate(state.topology,GUEST).pass;}
export function updateNative(state:NativeEnterprise,patch:{topology?:Topology;firewall?:LabConfig}):NativeEnterprise{
 if(!patch.topology&&!patch.firewall)return state;
 return {...state,revision:state.revision+1,topology:patch.topology??state.topology,firewall:patch.firewall??state.firewall};
}
/** Harden persistence: only allow fixed scene, bounded elements and a recognized rule set.
 * This is a local training snapshot, not a tamper-proof trusted transcript. */
export function restoreNative(value:unknown):NativeEnterprise{
 const fallback=initialNative();
 if(!value||typeof value!=='object'||Array.isArray(value))return fallback;
 if(JSON.stringify(value).length>120000)return fallback;
 const n=value as Partial<NativeEnterprise>;
 if(n.version!==1||!Number.isSafeInteger(n.revision)||typeof n.revision!=='number'||n.revision<0||!n.topology||!n.firewall)return fallback;
 const t=n.topology,c=n.firewall;
 if(t.sceneId!==NATIVE_SCENE.id||!Array.isArray(t.nodes)||t.nodes.length!==5||!Array.isArray(t.cables)||t.cables.length>12||!Array.isArray(t.routes)||t.routes.length>16||!Array.isArray(t.rules)||t.rules.length>16||!Array.isArray(c.security)||c.security.length>16||!Array.isArray(c.nat)||c.nat.length>8)return fallback;
 const expected=new Set(NATIVE_SCENE.devices.map(d=>d.id));
 if(!t.nodes.every(x=>x&&expected.has(x.id)&&Array.isArray(x.interfaces)&&x.interfaces.length<12&&x.interfaces.every(p=>p&&typeof p.id==='string'&&typeof p.adminUp==='boolean'&&['routed','trunk','access'].includes(p.mode)&&Array.isArray(p.allowedVlans)&&p.allowedVlans.length<=100&&typeof p.ipCidr==='string'))||new Set(t.nodes.map(x=>x.id)).size!==5)return fallback;
 if(!t.cables.every(x=>x&&typeof x.id==='string'&&expected.has(x.from)&&expected.has(x.to)&&typeof x.fromPort==='string'&&typeof x.toPort==='string'&&typeof x.up==='boolean'&&t.nodes.some(n=>n.id===x.from&&n.interfaces.some(p=>p.id===x.fromPort))&&t.nodes.some(n=>n.id===x.to&&n.interfaces.some(p=>p.id===x.toPort))))return fallback;
 if(!t.routes.every(x=>x&&expected.has(x.router)&&expected.has(x.via)&&typeof x.cidr==='string'))return fallback;
 if(!t.rules.every(x=>x&&typeof x.id==='string'&&['allow','deny'].includes(x.action)&&typeof x.enabled==='boolean'&&Number.isInteger(x.port)&&x.port>=0&&x.port<=65535))return fallback;
 if(!c.security.every(x=>x&&typeof x.id==='string'&&['allow','deny'].includes(x.action)&&typeof x.enabled==='boolean'&&['trust','dmz','untrust','any'].includes(x.from)&&['trust','dmz','untrust','any'].includes(x.to)))return fallback;
 if(typeof c.dmzRoute!=='boolean'||typeof c.decrypt!=='boolean'||typeof c.threatPrevention!=='boolean')return fallback;
 return structuredClone(n as NativeEnterprise);
}
