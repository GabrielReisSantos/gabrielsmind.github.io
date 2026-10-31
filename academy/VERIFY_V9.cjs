/* Renderer-agnostic visual geometry checks. No browser/GPU or npm dependencies. */
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(process.argv[2]||'.visual-verify');
const {SCENES,deviceById}=require(path.join(root,'sceneEngine.js'));
const {arrangeLabels,cableCurve,clamp,copyPreset,deviceHeight,projectWorld,ZONE_COLORS}=require(path.join(root,'visualEngine.js'));
let passed=0;function ok(v,s){assert.ok(v,s);passed++;}function eq(a,b,s){assert.deepEqual(a,b,s);passed++;}
for(const s of SCENES){
 ok(s.devices.length>=4,s.id+' devices');ok(s.links.length>=3,s.id+' links');
 for(const d of s.devices){
  ok(Array.isArray(ZONE_COLORS[d.zone]),`${s.id}:${d.id} zone material available`);
  ok(deviceHeight(d.kind)>.5&&deviceHeight(d.kind)<2,`${s.id}:${d.id} label height`);
  for(const presetName of ['isometric','overhead']){
   const c=copyPreset(presetName),p=projectWorld(d.x,deviceHeight(d.kind),d.z,c,1.8);
   ok(p.visible&&Number.isFinite(p.x)&&Number.isFinite(p.y),`${s.id}:${d.id}:${presetName} projects`);
   ok(Math.abs(p.x)<.96&&Math.abs(p.y)<.96,`${s.id}:${d.id}:${presetName} visible within viewport`);
  }
 }
 for(const l of s.links){const a=deviceById(s,l.from),b=deviceById(s,l.to);const pts=cableCurve(a,b);
  eq(pts[0].x,a.x,`${s.id}:${l.from}-${l.to} start x`);eq(pts[0].z,a.z,'start z');
  eq(pts.at(-1).x,b.x,'end x');eq(pts.at(-1).z,b.z,'end z');
  ok(pts.every(p=>Number.isFinite(p.x+p.y+p.z)),'cable has only finite positions');
 }
 const cam=copyPreset('isometric'),width=1080,height=540,aspect=width/height;
 const labs=s.devices.map(d=>{const p=projectWorld(d.x,deviceHeight(d.kind)+.43,d.z,cam,aspect);return {id:d.id,title:d.label,ip:d.ip,screenX:(p.x+1)*width/2,screenY:(1-p.y)*height/2,selected:d.id===s.devices[0].id,priority:0};});
 const arranged=arrangeLabels(labs,width,height);
 ok(arranged.length>=Math.min(2,s.devices.length),s.id+' readable labels');
 for(const l of arranged){ok(l.x>=0&&l.y>=0,'label origin bounded');ok(l.x+l.width<=width&&l.y+l.height<=height,'label stays on canvas');}
}
const original=copyPreset('isometric');original.distance=999;eq(copyPreset('isometric').distance,19.8,'camera presets are isolated');
for(const value of [-99,0,42,200])ok(clamp(value,0,100)>=0&&clamp(value,0,100)<=100,'clamping');
for(const l of arrangeLabels(Array.from({length:7},(_,i)=>({id:String(i),title:'SERVER-'+i,ip:'10.99.10.123',screenX:300+i*2,screenY:160+i,selected:i===0,priority:0})),650,400)){
 ok(l.x>=12&&l.x+l.width<=638,'dense label clamp');ok(l.y>=57&&l.y+l.height<=353,'dense vertical clamp');
}
console.log(`PASS: ${passed} presentation geometry and UI-label assertions.`);
