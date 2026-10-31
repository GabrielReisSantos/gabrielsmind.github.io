import {useEffect,useRef,useState} from 'react';
import {deviceById,type CyberScene,type SceneDevice} from './sceneEngine';
import {packetPosition,type Trace} from './topologyEngine';
import {arrangeLabels,cableCurve,clamp,copyPreset,DEFAULT_ACCENT,deviceHeight,MATERIAL,projectWorld,ZONE_COLORS,type Camera,type RGB} from './visualEngine';
import {orbitCamera,panCamera,zoomCamera,cameraText} from './cameraInteraction';

type P=[number,number,number];
const CO={floor:[.069,.105,.157] as RGB,steel:[.21,.28,.36] as RGB,shell:[.13,.19,.27] as RGB,edge:[.30,.39,.48] as RGB,black:[.045,.074,.12] as RGB,screen:[.035,.23,.31] as RGB,cyan:[.42,.87,.97] as RGB,green:[.35,.98,.68] as RGB,amber:[1,.75,.32] as RGB};
const VERT=`attribute vec3 aClip;attribute vec3 aColor;attribute vec3 aWorld;attribute float aMaterial;attribute float aShade;varying vec3 vColor;varying vec3 vWorld;varying float vMat;void main(){gl_Position=vec4(aClip,1.0);vColor=aColor*aShade;vWorld=aWorld;vMat=aMaterial;}`;
const FRAG=`precision mediump float;varying vec3 vColor;varying vec3 vWorld;varying float vMat;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 c=vColor;
 if(vMat>0.5&&vMat<1.5){float grain=hash(floor(vWorld.xz*157.0)+floor(vWorld.y*75.0));float brush=sin(vWorld.y*170.0+vWorld.x*13.0);c*=.97+.055*grain+.019*brush;}
 if(vMat>1.5&&vMat<2.5){float scan=sin(vWorld.y*220.0)*.019;c+=vec3(0.0,scan,scan*.9);}
 if(vMat>2.5&&vMat<3.5){float speck=hash(floor(vWorld.xz*27.0));c*=.96+.06*speck;}
 if(vMat>3.5){c=min(vec3(1.),c*1.13);}
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
function compile(gl:WebGLRenderingContext,kind:number,text:string){const sh=gl.createShader(kind);if(!sh)throw Error('Could not allocate GPU shader');gl.shaderSource(sh,text);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(sh);gl.deleteShader(sh);throw Error(msg||'Shader compilation failed');}return sh;}
function makeProgram(gl:WebGLRenderingContext){const p=gl.createProgram();if(!p)throw Error('Could not allocate GPU program');const vs=compile(gl,gl.VERTEX_SHADER,VERT),fs=compile(gl,gl.FRAGMENT_SHADER,FRAG);gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const m=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw Error(m||'GPU program link failed');}return p;}
class ModelBuilder{
 triangles:number[]=[];lines:number[]=[];
 constructor(private camera:Camera,private aspect:number){}
 private v(out:number[],p:P,col:RGB,mat:number,shade:number){const pr=projectWorld(...p,this.camera,this.aspect);out.push(pr.x,pr.y,pr.depth,...col,...p,mat,shade);}
 private face(a:P,b:P,c:P,d:P,col:RGB,shade=1,mat:number=MATERIAL.METAL){for(const p of [a,b,c,a,c,d])this.v(this.triangles,p,col,mat,shade);}
 box(x:number,y:number,z:number,w:number,h:number,d:number,col:RGB,mat:number=MATERIAL.METAL){
  const a=x-w/2,b=x+w/2,c=z-d/2,e=z+d/2,t=y+h;
  this.face([a,y,c],[b,y,c],[b,y,e],[a,y,e],col,.48,mat);
  this.face([a,t,e],[b,t,e],[b,t,c],[a,t,c],col,1.17,mat);
  this.face([a,y,e],[b,y,e],[b,t,e],[a,t,e],col,.94,mat);
  this.face([b,y,c],[a,y,c],[a,t,c],[b,t,c],col,.61,mat);
  this.face([b,y,e],[b,y,c],[b,t,c],[b,t,e],col,.78,mat);
  this.face([a,y,c],[a,y,e],[a,t,e],[a,t,c],col,.72,mat);
 }
 line(a:P,b:P,col:RGB,shade=1){this.v(this.lines,a,col,0,shade);this.v(this.lines,b,col,0,shade);}
 rectangle(x:number,z:number,w:number,d:number,y:number,col:RGB){const a=x-w/2,b=x+w/2,c=z-d/2,e=z+d/2;this.line([a,y,c],[b,y,c],col);this.line([b,y,c],[b,y,e],col);this.line([b,y,e],[a,y,e],col);this.line([a,y,e],[a,y,c],col);}
 cable(pts:{x:number;y:number;z:number}[],col:RGB,thickness=.05,dashed=false){
  for(let i=0;i<pts.length-1;i++){
   if(dashed&&i%3===1)continue;
   const a=pts[i],b=pts[i+1],dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz)||1,px=-dz/dist*thickness,pz=dx/dist*thickness;
   this.face([a.x+px,a.y,a.z+pz],[b.x+px,b.y,b.z+pz],[b.x-px,b.y,b.z-pz],[a.x-px,a.y,a.z-pz],col,1.16,MATERIAL.EMISSIVE);
   this.face([a.x-px,a.y-.028,a.z-pz],[b.x-px,b.y-.028,b.z-pz],[b.x+px,b.y-.028,b.z+pz],[a.x+px,a.y-.028,a.z+pz],col,.53);
  }
 }
}
function mix(a:RGB,b:RGB,f:number):RGB{return [a[0]*(1-f)+b[0]*f,a[1]*(1-f)+b[1]*f,a[2]*(1-f)+b[2]*f];}
function drawDevice(g:ModelBuilder,node:SceneDevice,selected:boolean,detailed:boolean,now:number){
 const {x,z,kind}=node,accent=ZONE_COLORS[node.zone]??DEFAULT_ACCENT;
 // Dark shadow, status base and four selected corner brackets.
 g.box(x,-.28,z,1.52,.08,1.20,[.035,.062,.085],MATERIAL.FLOOR);
 g.box(x,-.19,z,1.42,.08,1.10,mix(CO.black,accent,.22),MATERIAL.METAL);
 g.rectangle(x,z,1.43,1.12,-.101,mix(accent,CO.black,.28));
 if(selected){for(const sx of [-1,1])for(const sz of [-1,1]){
  const ax=x+sx*.86,az=z+sz*.70;
  g.line([ax-sx*.27,-.12,az],[ax,-.12,az],CO.green);
  g.line([ax,-.12,az-sz*.23],[ax,-.12,az],CO.green);
 }}
 if(kind==='workstation'){
  g.box(x,-.07,z+.30,.96,.075,.42,CO.steel); // desk foot
  g.box(x,.03,z-.12,.13,.40,.16,CO.edge); // monitor pedestal
  g.box(x,.34,z-.14,1.06,.70,.18,CO.shell);
  g.box(x,.40,z-.038,.90,.51,.025,CO.screen,MATERIAL.SCREEN);
  g.box(x,.84,z-.038,.88,.025,.025,accent,MATERIAL.EMISSIVE);
  g.box(x,-.004,z+.41,.77,.045,.20,CO.steel);
  if(detailed){for(let i=-4;i<=4;i++)g.box(x+i*.073,.042,z+.46,.049,.009,.044,CO.black);g.box(x+.60,.001,z+.40,.10,.034,.14,CO.shell);}
 }else if(kind==='switch'){
  g.box(x,.03,z,1.35,.37,.70,CO.shell);
  g.box(x,.15,z+.37,1.23,.17,.028,CO.black);
  g.box(x-.49,.26,z+.394,.20,.038,.015,accent,MATERIAL.EMISSIVE);
  for(let i=0;i<8;i++){
   g.box(x-.42+i*.117,.18,z+.39,.077,.065,.019,CO.steel);
   if(detailed)g.box(x-.42+i*.117,.268,z+.4,.030,.020,.015,(i%3===0)?CO.amber:CO.green,MATERIAL.EMISSIVE);
  }
  g.box(x,.425,z-.22,.97,.017,.2,mix(accent,CO.shell,.2));
 }else if(kind==='server'||kind==='directory'){
  const xw=kind==='directory'?.91:.82;
  g.box(x,.005,z,xw,1.62,.74,CO.black);
  g.box(x,.08,z-.37,xw+.06,1.52,.07,CO.steel);
  g.box(x,.08,z+.376,xw+.05,1.54,.045,CO.shell);
  for(let i=0;i<5;i++){
   const yy=.19+i*.282;
   g.box(x,yy,z+.408,xw-.14,.206,.021,i%2?CO.steel:mix(CO.shell,CO.black,.46));
   g.box(x-.24,yy+.072,z+.427,.32,.013,.009,mix(accent,CO.black,.47));
   g.box(x+xw*.31,yy+.08,z+.430,.045,.032,.011,i===4?CO.amber:CO.green,MATERIAL.EMISSIVE);
   if(detailed)for(let j=0;j<5;j++)g.box(x-.24+j*.069,yy+.008,z+.43,.043,.012,.01,[.075,.12,.16]);
  }
  g.box(x,1.65,z,xw+.01,.055,.74,accent);
  if(kind==='directory')g.box(x+.50,.65,z,.10,.67,.35,mix(accent,CO.shell,.4));
 }else{
  const firewall=kind==='firewall';
  g.box(x,.035,z,1.32,.61,.82,CO.shell);
  g.box(x,.10,z+.423,1.20,.36,.029,CO.black);
  g.box(x-.43,.37,z+.444,.25,.040,.017,accent,MATERIAL.EMISSIVE);
  if(firewall){
   for(let i=0;i<6;i++)g.box(x-.34+i*.135,.19,z+.449,.077,.081,.020,CO.edge);
   for(let i=0;i<4;i++)g.box(x+.14+i*.12,.30,z+.451,.033,.030,.016,CO.green,MATERIAL.EMISSIVE);
   g.box(x,.66,z-.23,.77,.04,.29,mix(accent,CO.shell,.52));
  }else{
   for(let i=0;i<4;i++)g.box(x-.34+i*.21,.18,z+.452,.13,.092,.022,CO.steel);
   for(let i=0;i<3;i++)g.box(x-.22+i*.20,.35,z+.453,.065,.036,.017,CO.green,MATERIAL.EMISSIVE);
   if(kind==='router'&&detailed){g.box(x-.49,.65,z-.29,.035,.33,.035,CO.steel);g.box(x+.49,.65,z-.29,.035,.33,.035,CO.steel);}
  }
  g.box(x,.68,z-.16,1.06,.035,.55,CO.steel);
 }
 if(selected){const glow=.025+.018*Math.sin(now/450);g.box(x,-.11,z,1.44,glow,1.12,accent,MATERIAL.EMISSIVE);}
}
function drawRounded(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
export default function WorldCanvas({scene,selected,onSelect,selectedLink,onSelectLink,playing,trace,onUnavailable}:{scene:CyberScene;selected:string|null;onSelect:(id:string)=>void;selectedLink:string|null;onSelectLink:(id:string)=>void;playing:boolean;trace:Trace|null;onUnavailable?:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),hud=useRef<HTMLCanvasElement>(null);
 const camera=useRef<Camera>(copyPreset('isometric')),mouse=useRef<{x:number;y:number;startX:number;startY:number;dragged:boolean;pan:boolean}|null>(null);
 const pointers=useRef(new Map<number,{x:number;y:number}>());const pinch=useRef<number|null>(null);const [cameraReadout,setCameraReadout]=useState(cameraText(camera.current));
 const updateCamera=(next:Camera)=>{camera.current=next;setCameraReadout(cameraText(next));};
 const playingRef=useRef(playing),started=useRef(0),traceRef=useRef(trace),selectRef=useRef(selected),linkRef=useRef(selectedLink);
 const [fallback,setFallback]=useState<string|null>(null),[showLabels,setShowLabels]=useState(true),[detailed,setDetailed]=useState(true),[view,setView]=useState<'isometric'|'overhead'|'custom'>('isometric');
 const showLabelsRef=useRef(showLabels),detailedRef=useRef(detailed);
 useEffect(()=>{showLabelsRef.current=showLabels;},[showLabels]);useEffect(()=>{detailedRef.current=detailed;},[detailed]);
 useEffect(()=>{playingRef.current=playing;traceRef.current=trace;if(playing)started.current=performance.now();},[playing,trace]);
 useEffect(()=>{selectRef.current=selected;},[selected]);useEffect(()=>{linkRef.current=selectedLink;},[selectedLink]);
 useEffect(()=>{updateCamera(copyPreset('isometric'));setView('isometric');},[scene.id]);
 useEffect(()=>{const el=canvas.current;if(!el)return;const handleWheel=(event:WheelEvent)=>{event.preventDefault();updateCamera(zoomCamera(camera.current,event.deltaY));setView('custom');};el.addEventListener('wheel',handleWheel,{passive:false});return()=>el.removeEventListener('wheel',handleWheel);},[]);
 useEffect(()=>{
  const cv=canvas.current,overlay=hud.current;if(!cv||!overlay)return;
  let gl:WebGLRenderingContext|null=null;
  try{gl=cv.getContext('webgl',{antialias:true,alpha:false,preserveDrawingBuffer:false})||cv.getContext('experimental-webgl',{antialias:true,alpha:false}) as WebGLRenderingContext|null;if(!gl)throw Error('WebGL is unavailable in this browser or GPU');}catch(e){setFallback(String(e));onUnavailable?.();return;}
  const context=gl,ctx=overlay.getContext('2d');if(!ctx){setFallback('2D label rendering unavailable');return;}
  let program:WebGLProgram,buffer:WebGLBuffer;try{program=makeProgram(context);const b=context.createBuffer();if(!b)throw Error('GPU buffer allocation failed');buffer=b;}catch(e){setFallback(String(e));onUnavailable?.();return;}
  setFallback(null);context.useProgram(program);context.enable(context.DEPTH_TEST);context.depthFunc(context.LEQUAL);context.disable(context.CULL_FACE);
  const fields=[['aClip',3,0],['aColor',3,12],['aWorld',3,24],['aMaterial',1,36],['aShade',1,40]] as const;
  context.bindBuffer(context.ARRAY_BUFFER,buffer);fields.forEach(([name,n,offset])=>{const loc=context.getAttribLocation(program,name);if(loc>=0){context.enableVertexAttribArray(loc);context.vertexAttribPointer(loc,n,context.FLOAT,false,44,offset);}});
  let frame=0,lastFrame=0;
  const draw=(data:number[],mode:number)=>{if(!data.length)return;context.bindBuffer(context.ARRAY_BUFFER,buffer);context.bufferData(context.ARRAY_BUFFER,new Float32Array(data),context.DYNAMIC_DRAW);fields.forEach(([name,n,offset])=>{const loc=context.getAttribLocation(program,name);if(loc>=0)context.vertexAttribPointer(loc,n,context.FLOAT,false,44,offset);});context.drawArrays(mode,0,data.length/11);};
  function render(now:number){
   if(now-lastFrame<28){frame=requestAnimationFrame(render);return;}lastFrame=now;
   const width=Math.max(2,cv!.clientWidth),height=Math.max(2,cv!.clientHeight),ratio=Math.min(window.devicePixelRatio||1,1.7),rw=Math.round(width*ratio),rh=Math.round(height*ratio);
   if(cv!.width!==rw||cv!.height!==rh){cv!.width=rw;cv!.height=rh;overlay!.width=rw;overlay!.height=rh;}
   context.viewport(0,0,rw,rh);context.clearColor(.028,.055,.085,1);context.clear(context.COLOR_BUFFER_BIT|context.DEPTH_BUFFER_BIT);
   const cam=camera.current,aspect=width/height,g=new ModelBuilder(cam,aspect);
   // Floating low-profile platform. No oversized back wall or ceiling grid.
   g.box(0,-.53,0,14.2,.18,9.3,CO.floor,MATERIAL.FLOOR);
   g.box(0,-.355,0,14.14,.035,9.24,[.095,.146,.206],MATERIAL.FLOOR);
   g.rectangle(0,0,14,9.05,-.311,[.27,.42,.50]);
   for(let x=-6;x<=6;x+=2)g.line([x,-.308,-4.38],[x,-.308,4.38],[.13,.20,.27],.72);
   for(let z=-4;z<=4;z+=2)g.line([-6.96,-.307,z],[6.96,-.307,z],[.13,.20,.27],.72);
   for(const x of [-6.8,6.8])for(const z of [-4.42,4.42])g.box(x,-.32,z,.34,.018,.035,CO.cyan,MATERIAL.EMISSIVE);
   // Small tinted equipment pads: zone cues without massive opaque walls.
   scene.devices.forEach(n=>{const accent=ZONE_COLORS[n.zone]??DEFAULT_ACCENT;g.box(n.x,-.31,n.z,1.82,.038,1.51,mix(CO.floor,accent,.18),MATERIAL.FLOOR);g.rectangle(n.x,n.z,1.83,1.53,-.263,mix(accent,CO.floor,.38));});
   // Physical cables are bound to the topology engine's cable ids and state.
   scene.links.forEach(l=>{const a=deviceById(scene,l.from),b=deviceById(scene,l.to);if(!a||!b)return;
    const highlighted=linkRef.current===l.id,active=!!l.id&&!!traceRef.current?.cablePath.includes(l.id);
    const color:RGB=l.up===false?[.99,.35,.38]:highlighted?[1,.83,.38]:active?(traceRef.current?.pass?CO.green:[1,.51,.37]):[.20,.56,.67];
    g.cable(cableCurve(a,b),color,highlighted?.069:.04,l.up===false);
    if(highlighted){const pts=cableCurve(a,b,16);g.cable(pts,mix(color,CO.cyan,.4),.095,l.up===false);}
   });
   scene.devices.forEach(n=>drawDevice(g,n,selectRef.current===n.id,detailedRef.current,now));
   if(playingRef.current){const t=(now-started.current)/3400;if(t>=1)playingRef.current=false;else{
     const p=traceRef.current?packetPosition(scene,traceRef.current,clamp(t,0,.999)):{x:0,y:.7,z:0};
     const color=traceRef.current?.pass?CO.green:[1,.44,.36] as RGB;
     g.box(p.x,p.y+.13,p.z,.22,.22,.22,color,MATERIAL.EMISSIVE);
     g.line([p.x,-.23,p.z],[p.x,p.y+.16,p.z],color);
    }}
   draw(g.triangles,context.TRIANGLES);context.depthMask(false);draw(g.lines,context.LINES);context.depthMask(true);
   ctx!.setTransform(ratio,0,0,ratio,0,0);ctx!.clearRect(0,0,width,height);
   if(showLabelsRef.current){
    const candidates=scene.devices.map(n=>{const p=projectWorld(n.x,deviceHeight(n.kind)+.43,n.z,cam,aspect);return {id:n.id,title:n.label,ip:n.ip,selected:n.id===selectRef.current,screenX:(p.x+1)*width/2,screenY:(1-p.y)*height/2,priority:Math.round(deviceHeight(n.kind)*10)};});
    for(const l of arrangeLabels(candidates,width,height)){
     const accent=ZONE_COLORS[scene.devices.find(n=>n.id===l.id)?.zone??'']??DEFAULT_ACCENT;
     ctx!.strokeStyle=l.selected?'rgba(139,244,190,.92)':'rgba(91,139,166,.48)';ctx!.fillStyle=l.selected?'rgba(15,44,47,.96)':'rgba(9,23,37,.85)';ctx!.lineWidth=l.selected?1.3:1;
     drawRounded(ctx!,l.x,l.y,l.width,l.height,7);ctx!.fill();ctx!.stroke();
     ctx!.fillStyle=`rgb(${accent.map(v=>Math.round(v*255)).join(',')})`;ctx!.fillRect(l.x+8,l.y+8,3,l.height-16);
     ctx!.font='600 11px system-ui, sans-serif';ctx!.textAlign='left';ctx!.fillStyle='#e9f5fa';ctx!.fillText(l.title,l.x+18,l.y+(l.showIp?18:18),l.width-24);
     if(l.showIp){ctx!.font='10px ui-monospace,SFMono-Regular,monospace';ctx!.fillStyle='#a4c1d1';ctx!.fillText(l.ip,l.x+18,l.y+33,l.width-24);}
    }
   }
   frame=requestAnimationFrame(render);
  }
  frame=requestAnimationFrame(render);
  const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);setFallback('WebGL context lost');onUnavailable?.();};
  cv.addEventListener('webglcontextlost',lost);
  return ()=>{cancelAnimationFrame(frame);cv.removeEventListener('webglcontextlost',lost);context.deleteBuffer(buffer);context.deleteProgram(program);};
 },[scene]);
 const pick=(px:number,py:number)=>{
  const el=canvas.current;if(!el)return;const w=el.clientWidth,h=el.clientHeight,cam=camera.current,aspect=w/h;
  let best:{id:string;distance:number}|null=null;
  for(const d of scene.devices){const p=projectWorld(d.x,deviceHeight(d.kind)*.55,d.z,cam,aspect),x=(p.x+1)*w/2,y=(1-p.y)*h/2,dist=Math.hypot(x-px,y-py);if(dist<55&&(!best||dist<best.distance))best={id:d.id,distance:dist};}
  if(best&&best.distance<32){onSelect(best.id);return;}
  let cable:{id:string;distance:number}|null=null;
  for(const l of scene.links){if(!l.id)continue;const a=deviceById(scene,l.from),b=deviceById(scene,l.to);if(!a||!b)continue;
   const pts=cableCurve(a,b,16);for(let i=0;i<pts.length-1;i++){
    const p=projectWorld(pts[i].x,pts[i].y,pts[i].z,cam,aspect),q=projectWorld(pts[i+1].x,pts[i+1].y,pts[i+1].z,cam,aspect);
    const ax=(p.x+1)*w/2,ay=(1-p.y)*h/2,bx=(q.x+1)*w/2,by=(1-q.y)*h/2,dx=bx-ax,dy=by-ay,len=Math.max(1,dx*dx+dy*dy),t=clamp(((px-ax)*dx+(py-ay)*dy)/len,0,1),dist=Math.hypot(px-(ax+dx*t),py-(ay+dy*t));
    if(dist<12&&(!cable||dist<cable.distance))cable={id:l.id,distance:dist};
   }
  }
  if(cable)onSelectLink(cable.id);else if(best)onSelect(best.id);
 };
 const coords=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
 const down=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const p=coords(e);
  pointers.current.set(e.pointerId,p);
  if(pointers.current.size===2){const ps=Array.from(pointers.current.values());pinch.current=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);mouse.current=null;return;}
  mouse.current={...p,startX:p.x,startY:p.y,dragged:false,pan:e.button===2||e.shiftKey};
 };
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  const p=coords(e),old=pointers.current.get(e.pointerId);if(!old)return;pointers.current.set(e.pointerId,p);
  if(pointers.current.size===2){const ps=Array.from(pointers.current.values());const dist=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);
   if(pinch.current!==null&&pinch.current>0)updateCamera(zoomCamera(camera.current,Math.log(pinch.current/Math.max(1,dist))*700));
   pinch.current=dist;setView('custom');return;
  }
  const m=mouse.current;if(!m)return;
  if(Math.hypot(p.x-m.startX,p.y-m.startY)>4)m.dragged=true;
  if(m.dragged){updateCamera(m.pan?panCamera(camera.current,p.x-m.x,p.y-m.y):orbitCamera(camera.current,p.x-m.x,p.y-m.y));setView('custom');}
  m.x=p.x;m.y=p.y;
 };
 const up=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  if(mouse.current&&!mouse.current.dragged&&pointers.current.size===1&&e.button!==2){const p=coords(e);pick(p.x,p.y);}
  pointers.current.delete(e.pointerId);mouse.current=null;pinch.current=null;
 };
 const zoom=(delta:number)=>{updateCamera(zoomCamera(camera.current,delta));setView('custom');};
 const preset=(name:'isometric'|'overhead')=>{updateCamera(copyPreset(name));setView(name);};
 const focus=()=>{const d=scene.devices.find(n=>n.id===selected);if(d){updateCamera({...camera.current,targetX:d.x,targetZ:d.z,distance:13.4});setView('custom');}};
 const pan=(dx:number,dy:number)=>{updateCamera(panCamera(camera.current,dx,dy));setView('custom');};
 const key=(e:React.KeyboardEvent<HTMLCanvasElement>)=>{
  if(e.key==='+'||e.key==='='){zoom(-115);e.preventDefault();}
  else if(e.key==='-'){zoom(115);e.preventDefault();}
  else if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'){
   const dx=e.key==='ArrowLeft'?-36:e.key==='ArrowRight'?36:0,dy=e.key==='ArrowUp'?-36:e.key==='ArrowDown'?36:0;
   if(e.shiftKey)pan(dx,dy);else {updateCamera(orbitCamera(camera.current,dx,dy));setView('custom');}e.preventDefault();
  }else if(e.key==='Home'){preset('isometric');e.preventDefault();}
 };
 return <div className="world-stage world-stage-v9">
  <div className="world-viewpoint"><div className="world-stage-heading"><span className="world-live-dot"/> 3D NETWORK RANGE <b>{scene.subtitle}</b></div><span className="world-scene-count">{scene.devices.length} DEVICES <i/> {scene.links.filter(l=>l.up!==false).length} ACTIVE LINKS</span></div>
  <div className="world-canvas-wrap"><canvas ref={canvas} tabIndex={0} className="world-canvas" aria-label={`Interactive 3D network topology: ${scene.title}. Use device buttons below as a keyboard alternative.`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={e=>{pointers.current.delete(e.pointerId);mouse.current=null;pinch.current=null;}} onContextMenu={e=>e.preventDefault()} onKeyDown={key}/><canvas ref={hud} className="world-hud" aria-hidden="true"/>
  {fallback&&<div className="world-fallback" role="status">3D renderer unavailable: {fallback}. The device buttons and topology configuration panels remain usable.</div>}</div>
  <div className="world-scene-legend" aria-hidden="true"><span><i className="world-legend-dot up"/> Live cable</span><span><i className="world-legend-dot down"/> Broken link</span><span><i className="world-legend-dot chosen"/> Selected</span></div>
  <div className="world-view-controls" aria-label="3D camera and appearance controls"><button className={view==='isometric'?'active':''} onClick={()=>preset('isometric')}>Isometric</button><button className={view==='overhead'?'active':''} onClick={()=>preset('overhead')}>Top</button><button onClick={focus} disabled={!selected} title="Center camera on selected device">Focus</button><button onClick={()=>zoom(-150)} aria-label="Zoom in">＋</button><button onClick={()=>zoom(150)} aria-label="Zoom out">−</button><button onClick={()=>pan(-65,0)} aria-label="Pan camera left">←</button><button onClick={()=>pan(65,0)} aria-label="Pan camera right">→</button><button onClick={()=>pan(0,-65)} aria-label="Pan camera up">↑</button><button onClick={()=>pan(0,65)} aria-label="Pan camera down">↓</button><button onClick={()=>preset('isometric')} aria-label="Reset camera">Reset</button><button className={showLabels?'active':''} onClick={()=>setShowLabels(v=>!v)} aria-pressed={showLabels}>Labels</button><button className={detailed?'active':''} onClick={()=>setDetailed(v=>!v)} aria-pressed={detailed}>Detail</button></div>
  <div className="world-device-picker" aria-label="Select device in network">{scene.devices.map(d=><button key={d.id} className={selected===d.id?'active':''} onClick={()=>onSelect(d.id)}><span className="world-device-chip-dot" style={{background:`rgb(${(ZONE_COLORS[d.zone]??DEFAULT_ACCENT).map(v=>Math.round(v*255)).join(',')})`}}/>{d.label}</button>)}</div>
  <div className="world-camera-tip" role="status" aria-live="polite">{cameraReadout} · Drag orbit · Shift/right drag pan · Wheel/pinch zoom · Focus canvas: arrows / Shift+arrows / + − / Home</div>
 </div>;
}
