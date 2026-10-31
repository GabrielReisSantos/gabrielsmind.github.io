/** Presentation-only geometry helpers. These never decide reachability. */
import type {SceneDevice} from './sceneEngine';
export type RGB = [number,number,number];
export type Camera = {yaw:number;elevation:number;distance:number;targetX:number;targetZ:number};
export type Projection={x:number;y:number;depth:number;visible:boolean};
export const CAMERA_PRESETS:Readonly<Record<'isometric'|'overhead',Camera>>={
  isometric:{yaw:-0.54,elevation:0.83,distance:19.8,targetX:0,targetZ:0},
  overhead:{yaw:0,elevation:1.46,distance:23,targetX:0,targetZ:0}
};
export const ZONE_COLORS:Readonly<Record<string,RGB>>={
 TRUST:[.25,.79,.67],VLAN20:[.24,.68,.96],GUEST:[.76,.48,.96],MGMT:[.49,.67,.86],
 DMZ:[.99,.70,.33],SERVER:[.30,.88,.72],SECURITY:[1,.56,.37],UNTRUST:[.99,.42,.46],
 INTERNAL:[.29,.83,.61],EDGE:[1,.63,.34],ROUTING:[.40,.69,.99],AD:[.75,.52,.94],SCOPE:[.30,.78,.95]
};
export const DEFAULT_ACCENT:RGB=[.45,.76,.85];
export const MATERIAL={METAL:1,SCREEN:2,FLOOR:3,EMISSIVE:4} as const;
export function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n));}
export function copyPreset(name:'isometric'|'overhead'):Camera{return {...CAMERA_PRESETS[name]};}
/** Right-handed orbit camera looking at (targetX,0.55,targetZ); WebGL clip z in [-1,1]. */
export function projectWorld(x:number,y:number,z:number,camera:Camera,aspect:number):Projection{
 const {yaw,elevation,distance,targetX,targetZ}=camera;
 const ce=Math.cos(elevation),se=Math.sin(elevation),sy=Math.sin(yaw),cy=Math.cos(yaw);
 const dx=x-targetX,dy=y-.5,dz=z-targetZ;
 const rightX=cy,rightZ=-sy;
 const upX=-sy*se,upY=ce,upZ=-cy*se;
 const forwardX=-sy*ce,forwardY=-se,forwardZ=-cy*ce;
 const localX=dx*rightX+dz*rightZ;
 const localY=dx*upX+dy*upY+dz*upZ;
 const depth=distance+(dx*forwardX+dy*forwardY+dz*forwardZ);
 const visible=depth>0.2;
 const lens=2.05/Math.max(.2,depth);
 return {x:localX*lens/Math.max(.4,aspect),y:localY*lens,depth:clamp((depth-1)/72,0,1)*2-1,visible};
}
export function deviceHeight(kind:SceneDevice['kind']){return kind==='server'||kind==='directory'?1.86:kind==='workstation'?1.12:kind==='switch'?.69:.93;}
export type LabelCandidate={id:string;title:string;ip:string;screenX:number;screenY:number;selected:boolean;priority:number};
export type LabelPlacement=LabelCandidate&{x:number;y:number;width:number;height:number;showIp:boolean};
const overlap=(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number})=>a.x<b.x+b.width+5&&a.x+a.width+5>b.x&&a.y<b.y+b.height+4&&a.y+a.height+4>b.y;
/** Greedy bounded label placement avoids the stacked IP boxes from v0.8. */
export function arrangeLabels(candidates:LabelCandidate[],width:number,height:number):LabelPlacement[]{
 const placed:LabelPlacement[]=[];
 const ordered=[...candidates].sort((a,b)=>Number(b.selected)-Number(a.selected)||b.priority-a.priority);
 for(const c of ordered){
  if(!Number.isFinite(c.screenX)||!Number.isFinite(c.screenY)||c.screenX<0||c.screenX>width||c.screenY<30||c.screenY>height-43)continue;
  const showIp=c.selected,widthPx=clamp(Math.max(65,c.title.length*7.1+25,showIp?c.ip.length*6.6+22:0),65,180),heightPx=showIp?43:28;
  let result:LabelPlacement|undefined;
  for(const shift of [0,-32,-64,32,-96,64,-128]){
   const x=clamp(c.screenX-widthPx/2,12,Math.max(12,width-widthPx-12));
   const y=clamp(c.screenY-heightPx-14+shift,57,Math.max(57,height-heightPx-47));
   const candidate:LabelPlacement={...c,x,y,width:widthPx,height:heightPx,showIp};
   if(!placed.some(p=>overlap(p,candidate))){result=candidate;break;}
  }
  if(result)placed.push(result);
 }
 return placed;
}
/** Quadratic cable curve: the same physical cable id is used by the forwarding engine. */
export function cableCurve(a:{x:number;z:number},b:{x:number;z:number},count=16){
 const length=Math.hypot(b.x-a.x,b.z-a.z);
 return Array.from({length:count+1},(_,i)=>{const t=i/count;return {x:a.x+(b.x-a.x)*t,y:.28+(Math.sin(Math.PI*t)*Math.min(.34,length*.048)),z:a.z+(b.z-a.z)*t};});
}
