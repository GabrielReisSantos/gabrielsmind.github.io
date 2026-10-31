/** Shared, clamped camera maths. Pure functions are testable without WebGL or DOM. */
import {clamp,type Camera} from './visualEngine';
export function orbitCamera(c:Camera,dx:number,dy:number):Camera{
 return {...c,yaw:c.yaw+dx*.008,elevation:clamp(c.elevation+dy*.006,.22,1.53)};
}
export function zoomCamera(c:Camera,delta:number):Camera{
 return {...c,distance:clamp(c.distance*Math.exp(delta*.0014),6.8,55)};
}
export function panCamera(c:Camera,dx:number,dy:number):Camera{
 const factor=c.distance/540;
 const x=dx*factor,z=dy*factor;
 return {...c,targetX:clamp(c.targetX-Math.cos(c.yaw)*x-Math.sin(c.yaw)*z,-20,20),targetZ:clamp(c.targetZ+Math.sin(c.yaw)*x-Math.cos(c.yaw)*z,-20,20)};
}
export function cameraText(c:Camera):string{return `Zoom ${Math.round(100*19.8/c.distance)}%, orbit ${Math.round(c.yaw*180/Math.PI)} degrees, pan ${c.targetX.toFixed(1)}, ${c.targetZ.toFixed(1)}`;}
