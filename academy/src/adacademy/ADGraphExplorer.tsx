import {useEffect,useMemo,useRef,useState} from 'react';
import {Box,Compass,Layers2,Move,Plus,Minus,RotateCcw} from 'lucide-react';
import {getPath,type ADScenario} from '../adlab/adEngine';
import {copyPreset,projectWorld,type Camera,clamp} from '../threeD/visualEngine';
import {orbitCamera,panCamera,zoomCamera} from '../threeD/cameraInteraction';
import './adgraph.css';
type Props={scenario:ADScenario;disabled:string[];activeEdge:string|null;onEdge:(id:string)=>void;onInteract?:(what:'select'|'zoom')=>void};
type Point={x:number;y:number;depth:number};
const W=850,H=350;
/** A readable, perspective-projected 3D identity graph; no network packets or privilege transitions are executed here. */
export default function ADGraphExplorer({scenario,disabled,activeEdge,onEdge,onInteract}:Props){
 const [mode,setMode]=useState<'2d'|'3d'>('2d');
 const [camera,setCamera]=useState<Camera>({...copyPreset('isometric'),distance:8.8});
 const [flat,setFlat]=useState({zoom:1,x:0,y:0});
 const drag=useRef<{x:number;y:number;mode:'pan'|'orbit';moved:boolean}|null>(null);
 const svgRef=useRef<SVGSVGElement>(null);
 const [selectedNode,setSelectedNode]=useState<string|null>(null);
 const [showHelp,setShowHelp]=useState(false);
 const [query,setQuery]=useState('');const [edgeFilter,setEdgeFilter]=useState<'all'|'risk'|'conditional'>('all');
 const active=new Set(getPath(scenario,disabled)?.map(e=>e.id)??[]);
 const position=useMemo(()=>{
  const result=new Map<string,Point>();
  scenario.nodes.forEach(n=>{
   if(mode==='2d'){result.set(n.id,{x:(n.x+56-W/2)*flat.zoom+W/2+flat.x,y:(n.y+29-H/2)*flat.zoom+H/2+flat.y,depth:0});return;}
   const x=(n.x+56-W/2)/56,z=(n.y+29-160)/52;
   const p=projectWorld(x,n.type==='host'?1.05:n.type==='service'?.8:.55,z,camera,W/H);
   result.set(n.id,{x:W/2+p.x*W/2,y:H/2-p.y*H/2,depth:p.depth});
  });return result;
 },[scenario,mode,flat,camera]);
 const nodes=[...scenario.nodes].sort((a,b)=>(position.get(b.id)?.depth??0)-(position.get(a.id)?.depth??0));
 const coords=(e:React.PointerEvent<SVGSVGElement>)=>{const r=e.currentTarget.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};};
 const zoom=(delta:number)=>{onInteract?.('zoom');if(mode==='3d')setCamera(c=>zoomCamera(c,delta));else setFlat(f=>({...f,zoom:clamp(f.zoom*Math.exp(-delta*.0014),.55,3.2)}));};
 const pan=(dx:number,dy:number)=>{if(mode==='3d')setCamera(c=>panCamera(c,dx,dy));else setFlat(f=>({...f,x:clamp(f.x+dx,-400,400),y:clamp(f.y+dy,-240,240)}));};
 const reset=()=>{setCamera({...copyPreset('isometric'),distance:8.8});setFlat({zoom:1,x:0,y:0});};
 const onMove=(e:React.PointerEvent<SVGSVGElement>)=>{const d=drag.current;if(!d)return;const p=coords(e),dx=p.x-d.x,dy=p.y-d.y;if(Math.abs(dx)+Math.abs(dy)>2)d.moved=true;if(d.mode==='orbit'&&mode==='3d')setCamera(c=>orbitCamera(c,dx,dy));else pan(dx,dy);d.x=p.x;d.y=p.y;};
 useEffect(()=>{const element=svgRef.current;if(!element)return;const onWheel=(e:WheelEvent)=>{e.preventDefault();zoom(e.deltaY);};element.addEventListener('wheel',onWheel,{passive:false});return()=>element.removeEventListener('wheel',onWheel);},[mode]);
 const nodeInfo=scenario.nodes.find(n=>n.id===selectedNode);
 const focusNode=(id:string)=>{const node=scenario.nodes.find(n=>n.id===id);if(!node)return;setSelectedNode(id);onInteract?.('select');if(mode==='2d')setFlat(f=>({...f,x:W/2-(node.x+56-W/2)*f.zoom-W/2,y:H/2-(node.y+29-H/2)*f.zoom-H/2}));else setCamera(c=>({...c,targetX:(node.x+56-W/2)/56,targetZ:(node.y+29-160)/52}));};
 const chooseEdge=(id:string)=>{onEdge(id);onInteract?.('select');};
 const visibleEdges=scenario.edges.filter(e=>edgeFilter==='all'||edgeFilter==='risk'&&e.weak||edgeFilter==='conditional'&&e.conditional);

 return <div className="adg-shell">
  <div className="adg-searchbar"><label htmlFor="adg-search">Find identity or computer</label><input id="adg-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users, groups, services..."/><select aria-label="AD permission relationship filter" value={edgeFilter} onChange={e=>setEdgeFilter(e.target.value as typeof edgeFilter)}><option value="all">All relationships</option><option value="risk">Excessive permissions</option><option value="conditional">Conditional paths</option></select><button type="button" onClick={()=>{reset();setQuery('');setEdgeFilter('all');setSelectedNode(null);}}>Fit entire graph</button></div>
  {query.trim()&&<div className="adg-search-results" role="list" aria-label="Matching identities">{scenario.nodes.filter(n=>`${n.label} ${n.id} ${n.type}`.toLowerCase().includes(query.trim().toLowerCase())).map(n=><button type="button" key={n.id} onClick={()=>{focusNode(n.id);setQuery('');}}>{n.label} <small>{n.type}</small></button>)}{!scenario.nodes.some(n=>`${n.label} ${n.id} ${n.type}`.toLowerCase().includes(query.trim().toLowerCase()))&&<span>No matches</span>}</div>}
  <div className="adg-toolbar"><div className="adg-switch" role="group" aria-label="AD diagram view">
   <button type="button" className={mode==='2d'?'active':''} aria-pressed={mode==='2d'} onClick={()=>setMode('2d')}><Layers2 size={16}/> 2D map</button>
   <button type="button" className={mode==='3d'?'active':''} aria-pressed={mode==='3d'} onClick={()=>setMode('3d')}><Box size={16}/> 3D graph</button>
  </div><div className="adg-camera" role="group" aria-label="AD diagram camera controls">
   <button type="button" title="Zoom in" aria-label="Zoom AD graph in" onClick={()=>zoom(-180)}><Plus size={17}/></button>
   <button type="button" title="Zoom out" aria-label="Zoom AD graph out" onClick={()=>zoom(180)}><Minus size={17}/></button>
   <button type="button" title="Pan left" aria-label="Pan AD graph left" onClick={()=>pan(-48,0)}>←</button>
   <button type="button" title="Pan right" aria-label="Pan AD graph right" onClick={()=>pan(48,0)}>→</button>
   <button type="button" title="Pan up" aria-label="Pan AD graph up" onClick={()=>pan(0,-35)}>↑</button>
   <button type="button" title="Pan down" aria-label="Pan AD graph down" onClick={()=>pan(0,35)}>↓</button>
   <button type="button" title="Reset diagram" aria-label="Reset AD graph camera" onClick={reset}><RotateCcw size={16}/></button>
   <button type="button" title="Help" aria-label="AD graph controls help" onClick={()=>setShowHelp(v=>!v)}><Compass size={16}/></button>
  </div></div>
  {showHelp&&<div className="adg-instructions" role="status"><Move size={17}/> {mode==='3d'?'Drag to rotate · Shift-drag to pan · Wheel to zoom · Select a relationship to inspect permissions.':'Drag to pan · Wheel to zoom · Select a relationship to inspect permissions.'} Keyboard: focus diagram, arrows to move/orbit; Shift+arrows to pan, + and − to zoom, Home to reset.</div>}
  <div className="adg-viewport"><svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${mode==='3d'?'Perspective 3D':'Two-dimensional'} Active Directory relationship diagram`} tabIndex={0}
    onContextMenu={e=>e.preventDefault()}
    onKeyDown={e=>{let handled=true;if(e.key==='+'||e.key==='=')zoom(-140);else if(e.key==='-')zoom(140);else if(e.key==='Home')reset();else if(e.key.startsWith('Arrow')){const dx=e.key==='ArrowLeft'?-35:e.key==='ArrowRight'?35:0,dy=e.key==='ArrowUp'?-35:e.key==='ArrowDown'?35:0;if(mode==='3d'&&!e.shiftKey)setCamera(c=>orbitCamera(c,dx,dy));else pan(dx,dy);}else handled=false;if(handled)e.preventDefault();}}
    onPointerDown={e=>{if(e.button>2)return;const p=coords(e);drag.current={...p,mode:mode==='3d'&&!e.shiftKey&&e.button!==2?'orbit':'pan',moved:false};e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={onMove} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
    <defs><marker id="adg-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#7fa5b9"/></marker><marker id="adg-alert" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#efad69"/></marker></defs>
    <rect width={W} height={H} rx="12" fill="#0a1929"/>
    {mode==='3d'&&Array.from({length:9},(_,i)=>i-4).flatMap(v=>{
      const a=projectWorld(-8,-.1,v,camera,W/H),b=projectWorld(8,-.1,v,camera,W/H);
      const c=projectWorld(v*1.9,-.1,-4,camera,W/H),d=projectWorld(v*1.9,-.1,4,camera,W/H);
      const px=(p:{x:number;y:number})=>({x:W/2+p.x*W/2,y:H/2-p.y*H/2});const p1=px(a),p2=px(b),p3=px(c),p4=px(d);
      return [<line key={`a${v}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#244357" strokeWidth="1"/>,<line key={`b${v}`} x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke="#244357" strokeWidth="1"/>];
    })}
    {visibleEdges.map(edge=>{const a=position.get(edge.from),b=position.get(edge.to);if(!a||!b)return null;const removed=disabled.includes(edge.id),risk=active.has(edge.id),focus=activeEdge===edge.id;const color=removed?'#687b8b':focus?'#7df3cd':risk?'#efad69':'#719bb4';
      return <g key={edge.id} role="button" tabIndex={0} aria-label={`${edge.from} to ${edge.to}, ${edge.right}${removed?', removed':''}`} onClick={()=>chooseEdge(edge.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseEdge(edge.id);}}} style={{cursor:'pointer'}}>
       <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="22"/>
       <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={focus?4:risk?3:2} opacity={removed?.3:1} strokeDasharray={removed?'3 6':edge.conditional?'7 5':undefined} markerEnd={risk?'url(#adg-alert)':'url(#adg-arrow)'} />
       <rect x={(a.x+b.x)/2-43} y={(a.y+b.y)/2-11} width="86" height="22" rx="5" fill={focus?'#155b56':'#193046'} stroke={color} opacity={removed?.5:1}/>
       <text x={(a.x+b.x)/2} y={(a.y+b.y)/2+4} textAnchor="middle" fill="#edf6fc" fontSize="10">{edge.right.length>14?edge.right.slice(0,13)+'…':edge.right}</text>
      </g>;})}
    {nodes.map(node=>{const p=position.get(node.id)!;const focus=selectedNode===node.id;const col=node.type==='group'?'#237c84':node.type==='service'?'#7469a9':node.type==='host'?'#b27f47':'#218d65';const width=mode==='3d'?123:116,height=mode==='3d'?56:54;
     return <g key={node.id} role="button" tabIndex={0} aria-label={`Inspect ${node.label}, ${node.type}`} onClick={()=>focusNode(node.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focusNode(node.id);}}} style={{cursor:'pointer'}}>
      {mode==='3d'&&<><ellipse cx={p.x+5} cy={p.y+34} rx="67" ry="15" fill="#010c14" opacity=".5"/><path d={`M${p.x-width/2},${p.y+height/2} l10 11 h${width} l-10 -11 Z`} fill="#142939" stroke={col}/><path d={`M${p.x+width/2},${p.y-height/2} l10 11 v${height} l-10 -11 Z`} fill="#162938" stroke={col}/></>}
      <rect x={p.x-width/2} y={p.y-height/2} width={width} height={height} rx="10" fill="#172b3d" stroke={focus?'#a1ffda':col} strokeWidth={focus?3:1.5}/>
      <rect x={p.x-width/2+8} y={p.y-height/2+9} width="4" height={height-18} rx="2" fill={col}/>
      <text x={p.x} y={p.y-4} textAnchor="middle" fill="#f2f8fb" fontSize="12" fontWeight="700">{node.label.length>17?node.label.slice(0,16)+'…':node.label}</text>
      <text x={p.x} y={p.y+15} textAnchor="middle" fill="#a8c4d3" fontSize="10">{node.type}</text>
     </g>;
    })}
   </svg></div>
   <div className="adg-footer"><span>{mode==='3d'?'3D perspective · orbit enabled':'2D map · drag to pan'} · {scenario.nodes.length} identities/objects · {scenario.edges.length} relationships</span><span>{getPath(scenario,disabled)?'Potential attack path shown':'Risk path disconnected'}</span></div>
   {nodeInfo&&<div className="adg-inspector"><div><strong>{nodeInfo.label}</strong><span>{nodeInfo.type}</span><p>{nodeInfo.description}</p></div><button type="button" onClick={()=>setSelectedNode(null)} aria-label="Close identity details">Close</button></div>}
   <p className="adg-disclaimer">Graph filters change what is displayed, not access rights. A highlighted relationship indicates a hypothetical permission path, not a proven compromise. Choose a relationship below to review its prerequisites.</p>
  </div>;
}
