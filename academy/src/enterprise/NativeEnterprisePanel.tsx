import {useState} from 'react';
import {Activity,ArrowRight,CheckCircle2,Link2Off,Network,RotateCcw,Shield,ShieldAlert} from 'lucide-react';
import WorldCanvas from '../threeD/WorldCanvas';
import NetworkMap2D from '../threeD/NetworkMap2D';
import {editCable,editPort,editRoute,editRule,renderScene,type Topology} from '../threeD/topologyEngine';
import {forwardNative,isolateGuest,NATIVE_SCENE} from './nativeEngine';
import {patchNative,resetNative,useNative} from './nativeStore';
import type {LabConfig} from '../ngfw/engine';
import './native.css';

type Mode='topology'|'firewall';
export default function NativeEnterprisePanel({mode}:{mode:Mode}){
 const state=useNative(),outcome=forwardNative(state),safeGuest=isolateGuest(state);
 const [selected,setSelected]=useState('fw'),[selectedCable,setSelectedCable]=useState<string|null>(null),[twoD,setTwoD]=useState(false),[traceVisible,setTraceVisible]=useState(false),[error,setError]=useState('');
 const [playing,setPlaying]=useState(false);
 const scene=renderScene(NATIVE_SCENE,state.topology),current=state.topology.nodes.find(n=>n.id===selected);
 const editTopology=(fn:(t:Topology)=>Topology)=>{try{const result=fn(state.topology);patchNative({topology:result});setTraceVisible(false);setError('');}catch(e){setError(String(e));}};
 const editFirewall=(fn:(c:LabConfig)=>void)=>{try{const next=structuredClone(state.firewall);fn(next);patchNative({firewall:next});setTraceVisible(false);setError('');}catch(e){setError(String(e));}};
 const selectedLink=state.topology.cables.find(c=>c.id===selectedCable);
 const probe=()=>{setTraceVisible(true);setPlaying(false);requestAnimationFrame(()=>setPlaying(true));};
 return <section className="ne-root" aria-label={`Native enterprise ${mode==='topology'?'3D network':'NGFW policy'} editor`}>
  <div className="ne-header"><div><span className="ne-eyebrow">NATIVE CROSS-MODULE FORWARDING · V2.3</span><h2>{mode==='topology'?'3D Enterprise Topology':'Enterprise NGFW Rulebase'}</h2><p>Same editable enterprise, same packet verdict. Routing, live cables and ordered firewall policy are evaluated on every probe.</p></div><span className="ne-revision">CONFIG REV {state.revision}</span></div>
  <div className="ne-status"><span className={outcome.allowed?'ne-pass':'ne-fail'}>{outcome.allowed?<CheckCircle2 size={17}/>:<ShieldAlert size={17}/>} WS01 → APP01:443 {outcome.allowed?'DELIVERED':'BLOCKED'}</span><span>Cause: {outcome.stage}</span><span>Guest isolation: {safeGuest?'ENFORCED':'BROKEN'}</span></div>
  <div className="ne-grid"><div className="ne-primary">
  {mode==='topology'&&<div className="ne-view"><div className="ne-bar"><strong>Editable physical environment</strong><button onClick={()=>setTwoD(v=>!v)}>{twoD?'Use 3D':'Use 2D fallback'}</button></div><div className="ne-canvas">
   {twoD?<NetworkMap2D scene={scene} selected={selected} onSelect={setSelected} selectedLink={selectedCable} onSelectLink={setSelectedCable} trace={traceVisible?outcome.physical:null}/>:<WorldCanvas scene={scene} selected={selected} onSelect={setSelected} selectedLink={selectedCable} onSelectLink={setSelectedCable} trace={traceVisible?outcome.physical:null} playing={playing} onUnavailable={()=>setTwoD(true)}/>}
  </div></div>}
  {mode==='topology'&&<div className="ne-section"><h3><Network size={17}/> Cables & interfaces</h3>{state.topology.cables.map(c=><div className="ne-row" key={c.id}><div><strong>{c.from.toUpperCase()} ↔ {c.to.toUpperCase()}</strong><small>{c.id} · {c.fromPort} / {c.toPort}</small></div><button aria-label={`${c.id}: ${c.up?'disable':'enable'} physical cable`} aria-pressed={c.up} onClick={()=>editTopology(t=>editCable(t,c.id,!c.up))}>{c.up?'UP · Disable':'DOWN · Enable'}</button></div>)}
  {selectedLink&&<p>Selected cable {selectedLink.id}: {selectedLink.from} → {selectedLink.to}</p>}
  {current&&<div className="ne-device"><h4>{current.label} · Interface administration</h4>{current.interfaces.filter(p=>state.topology.cables.some(c=>(c.from===current.id&&c.fromPort===p.id)||(c.to===current.id&&c.toPort===p.id))).map(p=><div key={p.id} className="ne-row"><span>{p.id} · {p.ipCidr||p.mode}</span><button aria-pressed={p.adminUp} onClick={()=>editTopology(t=>editPort(t,current.id,p.id,{adminUp:!p.adminUp}))}>{p.adminUp?'Shutdown':'Enable'}</button></div>)}</div>}
  <h4>Forwarding route</h4>{state.topology.routes.filter(r=>r.id==='route-reports').map(r=><div key={r.id} className="ne-row"><span>NGFW · {r.cidr}</span><label>Next hop <select value={r.via} onChange={(e:{target:{value:string}})=>editTopology(t=>editRoute(t,r.id,{via:e.target.value}))}><option value="app01">APP01 (correct)</option><option value="dc01">DC01 (wrong)</option><option value="guest">GUEST (wrong)</option></select></label></div>)}
  <h4>Topology firewall policy</h4>{state.topology.rules.map(r=><div className="ne-row" key={r.id}><div><strong>{r.id}</strong><small>{r.sourceZone} → {r.destinationZone} TCP/{r.port}</small></div><button aria-pressed={r.action==='allow'} onClick={()=>editTopology(t=>editRule(t,r.id,{action:r.action==='allow'?'deny':'allow'}))}>{r.action.toUpperCase()}</button></div>)}
  </div>}
  {mode==='firewall'&&<div className="ne-section"><h3><Shield size={17}/> Native ordered NGFW policy</h3><p>These are real <code>ngfw/engine.ts</code> rules used for the enterprise packet; unlike the old boolean switch, order, destination zone, service, and enabled state all affect the verdict.</p>
   {state.firewall.security.map((r,i)=><div className="ne-rule" key={r.id}><div><strong>{i+1}. {r.name}</strong><small>{r.from} → {r.to} · {r.destination} · {r.app} · {r.service}</small><small>{r.enabled?'Enabled':'Disabled'} · {r.action.toUpperCase()}</small></div><div className="ne-buttons"><button title="Move rule up" disabled={i===0} onClick={()=>editFirewall(c=>{[c.security[i-1],c.security[i]]=[c.security[i],c.security[i-1]];})}>↑</button><button title="Move rule down" disabled={i===state.firewall.security.length-1} onClick={()=>editFirewall(c=>{[c.security[i+1],c.security[i]]=[c.security[i],c.security[i+1]];})}>↓</button><button onClick={()=>editFirewall(c=>{c.security[i].enabled=!c.security[i].enabled;})}>{r.enabled?'Disable':'Enable'}</button><button onClick={()=>editFirewall(c=>{c.security[i].action=r.action==='allow'?'deny':'allow';})}>{r.action.toUpperCase()}</button></div></div>)}
   <label className="ne-route-toggle"><input type="checkbox" checked={state.firewall.dmzRoute} onChange={(e:{target:{checked:boolean}})=>editFirewall(c=>{c.dmzRoute=e.target.checked;})}/> NGFW DMZ forwarding route enabled</label>
  </div>}
  </div><aside className="ne-aside"><h3><Activity size={17}/> Authoritative packet verdict</h3><p>{outcome.reason}</p><div className="ne-result"><strong>{outcome.allowed?'ALLOW':'DENY'}</strong><span>3D physical: {outcome.physical.pass?'PASS':'DROP · '+outcome.physical.code}</span><span>NGFW: {outcome.firewall?.verdict.toUpperCase()??'NOT REACHED'}</span><span>Matched security rule: {outcome.rule??'none'}</span><span>Packet path: {outcome.path.map(x=>x.toUpperCase()).join(' → ')}</span></div>
  <div className="ne-buttons"><button className="ne-action" onClick={probe}>Run fresh native probe <ArrowRight size={15}/></button><button onClick={()=>{resetNative();setTraceVisible(false);}}><RotateCcw size={15}/> Reset shared enterprise</button></div>
  {traceVisible&&<div className="ne-events"><strong>Trace at revision {state.revision}</strong>{outcome.physical.events.map((e,i)=><p key={i}><code>{e.device} · {e.kind}</code> {e.message}</p>)}{outcome.firewall?.steps.map((step,i)=><p key={`fw${i}`}><code>NGFW / {step.id}</code> {step.detail}</p>)}</div>}
  {!safeGuest&&<p className="ne-warning"><Link2Off size={15}/> The separate GUEST → APP01 negative probe is allowed. This is an unsafe configuration.</p>}
  {error&&<p role="alert" className="ne-warning">{error}</p>}
  <p className="ne-foot">All links, routes, rule decisions and traffic records are deterministic simulations. This is not a production PAN-OS dataplane or real packet capture.</p></aside></div>
 </section>;
}
