/** Fully synthetic environments. 3-D coordinates are not physical network topology metrics. */
export type DeviceKind='workstation'|'switch'|'firewall'|'router'|'server'|'directory'|'gateway';
export type SceneDevice={id:string;label:string;kind:DeviceKind;zone:string;ip:string;x:number;z:number;purpose:string};
export type SceneLink={from:string;to:string;label:string;id?:string;up?:boolean};
export type CyberScene={id:string;title:string;subtitle:string;brief:string;caseId:string;track:'Foundations'|'NGFW'|'OSCP';devices:SceneDevice[];links:SceneLink[];packetPath:string[];learningTarget:string};
export const SCENES:readonly CyberScene[]=[
 {id:'campus',title:'VLAN campus',subtitle:'SWITCHING · CCNA',brief:'Two switches bridge an access VLAN over an 802.1Q trunk. Investigate why workstation VLAN 20 cannot reach the gateway.',caseId:'vlan',track:'Foundations',learningTarget:'Restore VLAN 20 on the trunk without opening all VLANs.',devices:[
 {id:'pc',label:'PC-2',kind:'workstation',zone:'VLAN20',ip:'10.20.10.44',x:-5,z:2,purpose:'Client access port in VLAN 20'},
 {id:'sw1',label:'SW1',kind:'switch',zone:'VLAN20',ip:'10.99.10.11',x:-2,z:1,purpose:'Access switch; uplink carries tagged VLANs'},
 {id:'sw2',label:'SW2',kind:'switch',zone:'VLAN20',ip:'10.99.10.12',x:2,z:1,purpose:'Distribution switch receives 802.1Q frames'},
 {id:'gw',label:'GW-V20',kind:'router',zone:'VLAN20',ip:'10.20.10.1',x:5,z:2,purpose:'Routed gateway for the client subnet'},
 {id:'guest',label:'Guest PC',kind:'workstation',zone:'GUEST',ip:'10.30.10.7',x:-3,z:-3,purpose:'Separate guest segment; must remain isolated'},
 {id:'ops',label:'OPS-SRV',kind:'server',zone:'MGMT',ip:'10.99.10.30',x:3,z:-3,purpose:'Management system outside the user VLAN'}],links:[{from:'pc',to:'sw1',label:'Access VLAN 20'},{from:'sw1',to:'sw2',label:'802.1Q trunk'},{from:'sw2',to:'gw',label:'VLAN 20 gateway'},{from:'guest',to:'sw1',label:'Guest VLAN 30'},{from:'ops',to:'sw2',label:'Mgmt VLAN 99'}],packetPath:['pc','sw1','sw2','gw']},
 {id:'segments',title:'Segmented enterprise',subtitle:'ZERO TRUST · NGFW',brief:'A policy-shadowing problem breaks a permitted HTTPS connection. Restore least-privilege segmentation between trust and DMZ.',caseId:'policy',track:'NGFW',learningTarget:'Move the precise HTTPS permit ahead of the broad deny; retain deny-by-default.',devices:[
 {id:'analyst',label:'Analyst PC',kind:'workstation',zone:'TRUST',ip:'10.10.10.11',x:-5,z:2,purpose:'Approved internal analyst HTTPS client'},
 {id:'fw',label:'NGFW-01',kind:'firewall',zone:'SECURITY',ip:'10.99.10.1',x:0,z:0,purpose:'Stateful NGFW with ordered application-aware policy'},
 {id:'web',label:'WEB-DMZ',kind:'server',zone:'DMZ',ip:'10.40.10.20',x:5,z:2,purpose:'Approved DMZ HTTPS application'},
 {id:'guest',label:'GUEST',kind:'workstation',zone:'GUEST',ip:'10.30.10.30',x:-5,z:-3,purpose:'Untrusted segment; must not inherit trust access'},
 {id:'database',label:'DB-INT',kind:'directory',zone:'SERVER',ip:'10.20.10.30',x:4,z:-3,purpose:'Internal database: not part of public HTTPS allowance'}],links:[{from:'analyst',to:'fw',label:'Trust ingress'},{from:'fw',to:'web',label:'DMZ 443'},{from:'guest',to:'fw',label:'Guest segment'},{from:'fw',to:'database',label:'Internal server zone'}],packetPath:['analyst','fw','web']},
 {id:'public-dmz',title:'Public service perimeter',subtitle:'NAT · NEXT-GEN FIREWALL',brief:'Internet traffic targets an external VIP. Find out why the translated destination cannot be reached.',caseId:'nat',track:'NGFW',learningTarget:'Publish only approved HTTPS to the DMZ host through DNAT.',devices:[
 {id:'internet',label:'Public client',kind:'workstation',zone:'UNTRUST',ip:'198.51.100.25',x:-5,z:0,purpose:'In-scope external synthetic test client'},
 {id:'edge',label:'Edge GW',kind:'gateway',zone:'UNTRUST',ip:'203.0.113.1',x:-2,z:0,purpose:'Perimeter router receiving external traffic'},
 {id:'fw',label:'NGFW-PUB',kind:'firewall',zone:'SECURITY',ip:'203.0.113.20',x:1,z:0,purpose:'DNAT policy translating a public VIP'},
 {id:'web',label:'WEB-01',kind:'server',zone:'DMZ',ip:'10.40.10.20',x:5,z:1,purpose:'Destination service listens on TCP 443'},
 {id:'mgmt',label:'MGMT',kind:'directory',zone:'MGMT',ip:'10.99.10.10',x:3,z:-3,purpose:'Management network, excluded from public translation'}],links:[{from:'internet',to:'edge',label:'WAN'},{from:'edge',to:'fw',label:'Public VIP'},{from:'fw',to:'web',label:'DNAT'},{from:'fw',to:'mgmt',label:'Management only'}],packetPath:['internet','edge','fw','web']},
 {id:'oscp-network',title:'OSCP network pivot',subtitle:'ROUTING · PENTEST METHODOLOGY',brief:'A fictional authorized engagement has a route to a segmented internal subnet pointing at the wrong next hop. Investigate the path before assuming exploitation.',caseId:'route',track:'OSCP',learningTarget:'Repair the 10.50.10.0/24 next hop; preserve the default route and segment boundaries.',devices:[
 {id:'auditor',label:'Auditor',kind:'workstation',zone:'SCOPE',ip:'10.10.10.10',x:-5,z:1,purpose:'Authorized synthetic tester with a defined scope'},
 {id:'gateway',label:'FW-ROUTE',kind:'firewall',zone:'EDGE',ip:'10.99.10.1',x:-1,z:1,purpose:'Firewall chooses routes using longest-prefix match'},
 {id:'router',label:'R-INT',kind:'router',zone:'ROUTING',ip:'10.99.10.2',x:2,z:1,purpose:'Correct routed next-hop for internal 10.50.10.0/24'},
 {id:'ot',label:'LAB-SRV',kind:'server',zone:'INTERNAL',ip:'10.50.10.25',x:5,z:1,purpose:'Synthetic internal target accessible only over intended routing'},
 {id:'db',label:'AD-CTRL',kind:'directory',zone:'AD',ip:'10.20.10.10',x:3,z:-3,purpose:'Fictional directory controller, out of path'},
 {id:'dmz',label:'WEB-PUB',kind:'server',zone:'DMZ',ip:'10.40.10.20',x:-3,z:-3,purpose:'Public web entry point; exposure does not itself prove privilege escalation'}],links:[{from:'auditor',to:'gateway',label:'Scoped path'},{from:'gateway',to:'router',label:'Next hop'},{from:'router',to:'ot',label:'Internal subnet'},{from:'gateway',to:'db',label:'Domain segment'},{from:'dmz',to:'gateway',label:'DMZ link'}],packetPath:['auditor','gateway','router','ot']}
];
export function sceneById(id:string):CyberScene{return SCENES.find(s=>s.id===id)??SCENES[0];}
export function deviceById(scene:CyberScene,id:string):SceneDevice|undefined{return scene.devices.find(d=>d.id===id);}
export function sceneIsConsistent(scene:CyberScene):boolean{const ids=new Set(scene.devices.map(d=>d.id));return ids.size===scene.devices.length&&scene.packetPath.every(id=>ids.has(id))&&scene.links.every(l=>ids.has(l.from)&&ids.has(l.to));}
/** Perspective project a world-space point to normalized-device coordinates. */
export function project3D(x:number,y:number,z:number,yaw:number,pitch:number,distance:number,aspect:number):{x:number;y:number;depth:number}{
 const a=x*Math.cos(yaw)-z*Math.sin(yaw);
 const b=x*Math.sin(yaw)+z*Math.cos(yaw);
 const yy=y*Math.cos(pitch)-b*Math.sin(pitch);
 const depth=Math.max(0.15,distance+y*Math.sin(pitch)+b*Math.cos(pitch));
 const focal=1.8;
 return {x:(a*focal)/(depth*aspect),y:(yy*focal)/depth,depth};
}
export function interpPacket(scene:CyberScene,fraction:number):{x:number;y:number;z:number}{
 const path=scene.packetPath.map(id=>deviceById(scene,id)!).filter(Boolean);
 const t=Math.min(.99999,Math.max(0,fraction))*(path.length-1);
 const idx=Math.floor(t),a=path[idx],b=path[idx+1]??a,p=t-idx;
 return {x:a.x+(b.x-a.x)*p,y:1.7+0.12*Math.sin(p*Math.PI),z:a.z+(b.z-a.z)*p};
}
