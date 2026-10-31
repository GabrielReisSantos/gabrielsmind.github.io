import type {CyberScene} from './sceneEngine';
import type {Trace} from './topologyEngine';
import './map2d.css';
export default function NetworkMap2D({scene,selected,onSelect,selectedLink,onSelectLink,trace}:{scene:CyberScene;selected:string|null;onSelect:(id:string)=>void;selectedLink:string|null;onSelectLink:(id:string)=>void;trace:Trace|null}){
 const pos=(x:number,z:number)=>({left:`${50+x*7.2}%`,top:`${48+z*10}%`});
 const byId=new Map(scene.devices.map(d=>[d.id,d]));
 const traceLinks=new Set(trace?.cablePath??[]);
 return <section className="map2d" aria-label={`Accessible 2D network diagram for ${scene.title}`}>
  <header className="map2d-header"><strong>2D TOPOLOGY · {scene.title}</strong><span>Network links reflect live interface and cable state</span></header>
  <div className="map2d-stage">
   <svg viewBox="0 0 1000 550" preserveAspectRatio="none" aria-hidden="true">
    {scene.links.map((c,i)=>{const a=byId.get(c.from),b=byId.get(c.to);if(!a||!b)return null;const key=c.id??`${c.from}-${c.to}-${i}`;
      const x1=500+a.x*72,y1=264+a.z*55,x2=500+b.x*72,y2=264+b.z*55;
      return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} className={['map2d-edge',c.up===false?'down':'',traceLinks.has(key)?'traced':'',selectedLink===key?'selected':''].join(' ')}/>;
    })}
   </svg>
   {scene.devices.map(d=><button type="button" key={d.id} className={`map2d-node ${selected===d.id?'selected':''}`} style={pos(d.x,d.z)} onClick={()=>onSelect(d.id)} aria-pressed={selected===d.id} title={`${d.label} — ${d.kind} — ${d.ip}`}><span className="map2d-node-kind">{d.kind.toUpperCase()}</span><strong>{d.label}</strong><small>{d.ip}</small></button>)}
  </div>
  <div className="map2d-linklist"><strong>Link inspector — select a cable with keyboard or mouse</strong><div>{scene.links.map((c,i)=>{const id=c.id??`${c.from}-${c.to}-${i}`;return <button type="button" key={id} className={selectedLink===id?'selected':''} aria-pressed={selectedLink===id} onClick={()=>onSelectLink(id)}><span className={`map2d-status ${c.up===false?'down':''}`}/>{byId.get(c.from)?.label} ↔ {byId.get(c.to)?.label} <small>{c.up===false?'Down':traceLinks.has(id)?'Traversed':'Connected'}</small></button>;})}</div></div>
  <p className="map2d-tip">Use Tab to inspect devices and links; Enter selects them. Physical changes in the configuration panels change both this map and packet forwarding.</p>
 </section>;
}
