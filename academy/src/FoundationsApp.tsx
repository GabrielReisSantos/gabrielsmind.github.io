import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow, Background, Controls, Handle, MarkerType, Position,
  useEdgesState, useNodesState,
  type Edge, type Node, type NodeProps
} from '@xyflow/react';
import {
  Activity, ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleHelp, Code2, Database, FileText, Globe2, Layers3, LockKeyhole,
  Monitor, Network, Play, Plus, RotateCcw, Search, Server, Shield,
  ShieldCheck, ShieldOff, SlidersHorizontal, Terminal, Trash2, Wifi, X
} from 'lucide-react';
import { LESSONS } from './data/lessons';
import {
  DEVICES, evaluatePacket, initialRulesForLesson, lookupDomain,
  type Action, type DeviceId, type PacketResult, type Protocol, type Rule
} from './domain/simulator';

type Tab = 'inspect' | 'rules' | 'events' | 'dns';
type NetworkNode = Node<{label: string;kind: string;ip: string;role: string},'device'>;
type TestRecord = {destination:string;protocol:Protocol;port:number|null;action:Action};
type LogEntry = {id:number;time:string;kind:'allow'|'deny'|'info';message:string};
const KEY = 'cyberlab-interactive-progress-v1';
const positions: Record<DeviceId, {x:number;y:number}> = {
  client:{x:40,y:130}, dns:{x:45,y:335}, fw:{x:343,y:145},
  web:{x:675,y:58}, ssh:{x:675,y:268}, soc:{x:354,y:350}
};
const BASE_EDGES = [
  {id:'client-fw',source:'client',target:'fw',label:'Client traffic'},
  {id:'client-dns',source:'client',target:'dns',label:'DNS queries'},
  {id:'fw-web',source:'fw',target:'web',label:'HTTPS'},
  {id:'fw-ssh',source:'fw',target:'ssh',label:'Admin zone'},
  {id:'fw-soc',source:'fw',target:'soc',label:'Security events'}
];
const badgeIcons: Record<string, typeof Monitor> = {
  workstation:Monitor,firewall:Shield,server:Server,dns:Globe2,monitor:Activity
};
function DeviceNode({data,selected}:NodeProps<NetworkNode>) {
  const Icon = badgeIcons[data.kind] ?? Server;
  return <div className={`device-node device-${data.kind} ${selected?'node-selected':''}`}>
    <Handle type="target" position={Position.Left} className="node-handle" />
    <div className="device-icon"><Icon size={19}/></div>
    <div className="device-meta"><strong>{data.label}</strong><span>{data.ip}</span></div>
    <div className="device-pip" />
    <Handle type="source" position={Position.Right} className="node-handle" />
  </div>;
}
const nodeTypes = {device:DeviceNode};
const INITIAL_NODES: NetworkNode[] = DEVICES.map(d=>({
  id:d.id,type:'device',position:positions[d.id],data:{label:d.label,kind:d.kind,ip:d.ip,role:d.description},
}));
function loadCompleted():number[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if(!raw) return [];
    const value:unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((id):id is number=>typeof id==='number' && LESSONS.some(l=>l.id===id)) : [];
  } catch {return [];}
}
function createEdges(active:string[]):Edge[] {
  return BASE_EDGES.map(edge=>{
    const highlighted = active.includes(edge.id);
    const blocked = highlighted && edge.id === 'client-fw' && active.length === 2;
    return {
      ...edge, type:'smoothstep',animated:highlighted,
      style:{stroke: highlighted ? blocked?'#ffb76b':'#6ff3b3' : '#34435b',strokeWidth:highlighted?3:1.7},
      labelStyle:{fill:highlighted?'#bcf6d3':'#798aa7',fontSize:11,fontWeight:600},
      labelBgStyle:{fill:'#111a2b',fillOpacity:.93},labelBgPadding:[7,4] as [number,number],labelBgBorderRadius:6,
      markerEnd:{type:MarkerType.ArrowClosed,color:highlighted?'#6ff3b3':'#536481',width:15,height:15}
    } satisfies Edge;
  });
}
const timeNow =()=>new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
function App(){
  const [lessonId,setLessonId] = useState(1);
  const [completed,setCompleted] = useState<number[]>(loadCompleted);
  const [inspected,setInspected] = useState<string[]>([]);
  const [dnsResolved,setDnsResolved] = useState(false);
  const [dnsInput,setDnsInput] = useState('app.cyberlab.local');
  const [dnsAnswer,setDnsAnswer] = useState<{name:string;ip:string|null}|null>(null);
  const [testHistory,setTestHistory] = useState<TestRecord[]>([]);
  const [rules,setRules] = useState<Rule[]>(()=>initialRulesForLesson(1));
  const [selectedNode,setSelectedNode] = useState<DeviceId>('fw');
  const [tab,setTab] = useState<Tab>('inspect');
  const [target,setTarget] = useState<'web'|'ssh'>('web');
  const [protocol,setProtocol] = useState<Protocol>('tcp');
  const [port,setPort] = useState(443);
  const [lastResult,setLastResult] = useState<PacketResult|null>(null);
  const [feedback,setFeedback] = useState<'success'|'incomplete'|null>(null);
  const [newRule,setNewRule] = useState(false);
  const [draftName,setDraftName] = useState('Allow HTTPS');
  const [draftProtocol,setDraftProtocol] = useState<Protocol>('tcp');
  const [draftPort,setDraftPort] = useState(443);
  const [draftAction,setDraftAction] = useState<Action>('allow');
  const [logs,setLogs] = useState<LogEntry[]>([{id:1,time:timeNow(),kind:'info',message:'Isolated classroom simulation initialized.'}]);
  const [activePath,setActivePath] = useState<string[]>([]);
  const lesson = LESSONS.find(l=>l.id===lessonId)!;
  const [nodes, ,onNodesChange] = useNodesState<NetworkNode>(INITIAL_NODES);
  const [edges,setEdges] = useEdgesState<Edge>(createEdges([]));
  useEffect(()=>{window.localStorage.setItem(KEY,JSON.stringify(completed));},[completed]);
  useEffect(()=>setEdges(createEdges(activePath)),[activePath,setEdges]);

  const logMessage=useCallback((kind:LogEntry['kind'], message:string)=>{
    setLogs(prev=>[{id:Date.now()+Math.random(),time:timeNow(),kind,message},...prev].slice(0,80));
  },[]);
  const resetScenario = (id:number)=>{
    setLessonId(id);setRules(initialRulesForLesson(id));setInspected([]);
    setDnsResolved(false);setDnsAnswer(null);setDnsInput('app.cyberlab.local');
    setTestHistory([]);setTarget('web');setPort(443);setProtocol('tcp');
    setLastResult(null);setFeedback(null);setNewRule(false);setActivePath([]);
    setSelectedNode('fw');setTab('inspect');
    setLogs([{id:Date.now(),time:timeNow(),kind:'info',message:`Lesson ${String(id).padStart(2,'0')} scenario loaded.`}]);
  };
  const inspect = (id:string)=>{
    if(!DEVICES.some(d=>d.id===id))return;
    setSelectedNode(id as DeviceId);
    setInspected(prev=>prev.includes(id)?prev:[...prev,id]);
    setTab('inspect');setFeedback(null);
  };
  const simulate = ()=>{
    const destinationPort = protocol==='icmp'?null:(Number.isFinite(port)?Math.max(1,Math.min(65535,port)):0);
    const result=evaluatePacket({source:'client',destination:target,protocol,destinationPort},rules);
    setLastResult(result);setActivePath(result.path);setFeedback(null);
    setTestHistory(prev=>[...prev,{destination:target,protocol,port:destinationPort,action:result.action}]);
    logMessage(result.action,`${result.action.toUpperCase()} ${protocol.toUpperCase()}${destinationPort===null?'':`/${destinationPort}`} client → ${target} · ${result.rule}`);
  };
  const runDns = ()=>{
    const answer=lookupDomain(dnsInput);setDnsAnswer(answer);
    if(answer.name==='app.cyberlab.local' && answer.ip==='10.20.0.10')setDnsResolved(true);
    setActivePath(['client-dns']);setFeedback(null);
    logMessage(answer.ip?'info':'deny',`DNS ${answer.name || '(empty query)'} → ${answer.ip ?? 'NXDOMAIN'}`);
  };
  const updateRules = (updater:(old:Rule[])=>Rule[])=>{
    setRules(updater);setTestHistory([]);setLastResult(null);setActivePath([]);setFeedback(null);
  };
  const saveRule = ()=>{
    if(!draftName.trim() || (draftProtocol!=='icmp' && (!Number.isInteger(draftPort) || draftPort<1 || draftPort>65535))) return;
    updateRules(old=>[...old,{id:`custom-${Date.now()}`,name:draftName.trim(),protocol:draftProtocol,destinationPort:draftProtocol==='icmp'?null:draftPort,action:draftAction,enabled:true}]);
    setNewRule(false);logMessage('info',`Firewall policy changed: ${draftName.trim()} (${draftAction})`);
  };
  const hasTest=(destination:string,testPort:number,action:Action)=>testHistory.some(t=>t.destination===destination&&t.protocol==='tcp'&&t.port===testPort&&t.action===action);
  const missionReady = useMemo(()=>{
    switch(lessonId){
      case 1:return ['client','fw','web'].every(id=>inspected.includes(id));
      case 2:return dnsResolved;
      case 3:return hasTest('web',443,'allow');
      case 4:return hasTest('web',443,'allow')&&hasTest('ssh',22,'deny');
      case 5:return rules.some(r=>r.enabled&&r.protocol==='tcp'&&r.destinationPort===443&&r.action==='allow')
        &&evaluatePacket({source:'client',destination:'web',protocol:'tcp',destinationPort:443},rules).action==='allow'
        &&evaluatePacket({source:'client',destination:'ssh',protocol:'tcp',destinationPort:22},rules).action==='deny'
        &&hasTest('web',443,'allow')&&hasTest('ssh',22,'deny');
      default:return false;
    }
  // derived using render-time state; hasTest intentionally recreated with each render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[lessonId,inspected,dnsResolved,testHistory,rules]);
  const checkMission = ()=>{
    if(missionReady){
      setCompleted(prev=>prev.includes(lessonId)?prev:[...prev,lessonId].sort((a,b)=>a-b));
      setFeedback('success');logMessage('info',`Lesson ${lessonId} objective verified.`);
    } else setFeedback('incomplete');
  };
  const selected = DEVICES.find(d=>d.id===selectedNode)!;
  const Icon = badgeIcons[selected.kind]??Server;
  const progress=Math.round((completed.length/LESSONS.length)*100);
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-icon"><Network size={21}/></span><span className="brand-title">CYBER<span>LAB</span><small>INTERACTIVE</small></span></div>
      <div className="topbar-middle"><span className="nav-current"><Layers3 size={15}/> Learning workspace</span><span className="top-divider"/><span className="nav-subtle">Foundations / Module 01</span></div>
      <div className="header-actions"><span className="simulation-pill"><span className="live-dot"/> SIMULATION ONLY</span><button className="header-reset" onClick={()=>{if(window.confirm('Clear all saved lesson progress and reset the simulation?')){setCompleted([]);resetScenario(1);}}} title="Clear learner progress"><RotateCcw size={16}/> <span>Reset</span></button></div>
    </header>
    <div className="workspace-grid">
      <aside className="sidebar">
        <div className="sidebar-top"><span className="section-overline">YOUR CURRICULUM</span><h2>Start with the basics.</h2><p>Build intuition through interactive, hands-on lessons.</p></div>
        <div className="module-card"><div className="module-kicker"><span className="module-icon"><BookOpen size={16}/></span><span>MODULE 01</span><span className="difficulty">BEGINNER</span></div><h3>Network & Firewall Fundamentals</h3><div className="progress-label"><span>Your progress</span><strong>{completed.length} / {LESSONS.length} lessons</strong></div><div className="progress-track"><div style={{width:`${progress}%`}}/></div></div>
        <div className="lesson-list"><span className="section-overline list-label">LESSONS</span>{LESSONS.map(l=><button key={l.id} className={`lesson-item ${lessonId===l.id?'active':''}`} onClick={()=>resetScenario(l.id)}>
          <span className={`lesson-number ${completed.includes(l.id)?'finished':''}`}>{completed.includes(l.id)?<Check size={15}/>:String(l.id).padStart(2,'0')}</span>
          <span className="lesson-copy"><strong>{l.title}</strong><small>{l.estimated} <span>·</span> {l.tag}</small></span>
          {lessonId===l.id?<ChevronRight size={17} className="lesson-chevron"/>:null}
        </button>)}</div>
        <div className="sidebar-bottom"><div className="sidebar-tip"><CircleHelp size={19}/><div><strong>How this lab works</strong><p>Change settings, send traffic, then read the result. Everything stays in your browser.</p></div></div><div className="sidebar-footer">CYBERLAB <span>v0.1.0 · MVP</span></div></div>
      </aside>
      <main className="main-area">
        <div className="lesson-heading"><div className="eyebrow"><span className="eyebrow-square"/> LESSON {String(lessonId).padStart(2,'0')} OF 05 <span className="tiny-separator">/</span> {lesson.tag.toUpperCase()}</div><div className="heading-row"><div><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><div className="time-badge"><Activity size={14}/>{lesson.estimated}</div></div></div>
        <div className="concept-row"><div className="concept-icon"><BookOpen size={19}/></div><div><strong>Concept</strong><p>{lesson.concept}</p></div></div>
        <div className="panel-title"><div><span className="panel-title-icon"><Network size={17}/></span><strong>Network simulator</strong><span className="panel-descriptor">Sandbox topology · Click any device to inspect</span></div><span className="topology-badge"><span className="topology-dot"/> ISOLATED ENVIRONMENT</span></div>
        <div className="network-panel"><ReactFlow<NetworkNode,Edge> nodes={nodes} edges={edges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} onNodeClick={(_,node)=>inspect(node.id)} fitView fitViewOptions={{padding:.23,minZoom:.65,maxZoom:1.15}} minZoom={.35} maxZoom={1.8} nodesConnectable={false} elementsSelectable panOnScroll={false} proOptions={{hideAttribution:true}}>
          <Background color="#21314c" size={1.5} gap={23} /><Controls showInteractive={false} position="bottom-left"/>
        </ReactFlow><div className="topology-overlay">VISUAL SIMULATION <span>·</span> NOT REAL NETWORK TRAFFIC</div></div>
        <div className="traffic-panel"><div className="traffic-heading"><div><Terminal size={17}/><strong>Traffic generator</strong></div><span>SOURCE <b>10.10.0.15</b></span></div>
          <div className="traffic-controls"><label>DESTINATION<select value={target} onChange={e=>{const value=e.target.value as 'web'|'ssh';setTarget(value);setPort(value==='ssh'?22:443);}}><option value="web">Web application · 10.20.0.10</option><option value="ssh">SSH server · 10.20.0.22</option></select></label>
          <label>PROTOCOL<select value={protocol} onChange={e=>setProtocol(e.target.value as Protocol)}><option value="tcp">TCP</option><option value="udp">UDP</option><option value="icmp">ICMP</option></select></label>
          <label>DESTINATION PORT<input type="number" min={1} max={65535} value={port} disabled={protocol==='icmp'} onChange={e=>setPort(Number(e.target.value))}/></label><button className="primary-button send-button" onClick={simulate}><Play size={15} fill="currentColor"/> Send traffic</button></div>
          {lastResult&&<div className={`result-banner result-${lastResult.action}`}><div className="result-status">{lastResult.action==='allow'?<ShieldCheck size={18}/>:<ShieldOff size={18}/>}<strong>{lastResult.action==='allow'?'CONNECTION ALLOWED':'CONNECTION DENIED'}</strong><span>{lastResult.rule}</span></div><p>{lastResult.reason}</p><details><summary>Trace the decision <ChevronRight size={14}/></summary><ol>{lastResult.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></details></div>}
        </div>
        <div className="mission-card"><div className="mission-top"><div className="mission-title"><span className="mission-icon"><ShieldCheck size={19}/></span><div><span className="section-overline">YOUR OBJECTIVE</span><h3>Put your knowledge to work</h3></div></div><span className="mission-tag">PRACTICAL TASK</span></div><p className="mission-copy">{lesson.mission}</p><div className="mission-bottom"><details className="hint-dropdown"><summary><CircleHelp size={16}/> Need a hint?</summary><p>{lesson.hint}</p></details><div className="mission-buttons"><button className="ghost-button" disabled={lessonId===1} onClick={()=>resetScenario(Math.max(1,lessonId-1))}><ChevronLeft size={16}/> Previous</button><button className="primary-button" onClick={checkMission}><Check size={16}/> Check objective</button></div></div>
          {feedback && <div className={`feedback feedback-${feedback}`}>{feedback==='success'?<CheckCircle2 size={18}/>:<CircleHelp size={18}/>}<div><strong>{feedback==='success'?'Objective complete!':'Not quite yet'}</strong><p>{feedback==='success'?'Your progress is saved on this device.':`Review the task and try again. Hint: ${lesson.hint}`}</p></div>{feedback==='success'&&lessonId<LESSONS.length&&<button onClick={()=>resetScenario(lessonId+1)}>Next lesson <ArrowRight size={15}/></button>}</div>}
        </div>
      </main>
      <aside className="inspector"><div className="inspector-heading"><div><SlidersHorizontal size={19}/><strong>Lab tools</strong></div><span className="inspector-online"><span/> READY</span></div>
        <div className="inspector-tabs" role="tablist" aria-label="Lab tools">
          {([['inspect','Inspect'],['rules','Policies'],['events','Events'],['dns','DNS']] as const).map(([id,label])=><button key={id} role="tab" aria-selected={tab===id} className={tab===id?'tab-active':''} onClick={()=>setTab(id)}>{label}</button>)}
        </div>
        <div className="inspector-body">
          {tab==='inspect'&&<><div className="section-overline">DEVICE INSPECTOR</div><div className="device-detail"><span className="detail-icon"><Icon size={25}/></span><div><strong>{selected.label}</strong><p>{selected.kind.toUpperCase()} <span>·</span> ONLINE</p></div></div><div className="detail-table"><div><span>IP address</span><code>{selected.ip}</code></div><div><span>Security zone</span><code>{selectedNode==='client'||selectedNode==='dns'?'CLIENT LAN':selectedNode==='fw'?'EDGE':selectedNode==='soc'?'MONITORING':'SERVER LAN'}</code></div><div><span>Device type</span><code>{selected.kind}</code></div></div><div className="inspector-note"><FileText size={17}/><p>{selected.description}</p></div><p className="tool-note">Select another device in the topology to view its information.</p></>}
          {tab==='rules'&&<><div className="tool-heading"><div><span className="section-overline">FIREWALL POLICY</span><h3>Rule table</h3></div><button className="outline-icon" onClick={()=>setNewRule(!newRule)} title="Create a firewall rule">{newRule?<X size={17}/>:<Plus size={18}/>}</button></div><div className="policy-info"><LockKeyhole size={17}/><span>Implicit default: <strong>DENY ALL</strong></span></div>
            {rules.length===0&&!newRule&&<div className="empty-state"><Shield size={25}/><strong>No allow rules</strong><p>All packets will be denied until you create a matching policy.</p></div>}
            {rules.map((r,i)=><div className="policy-card" key={r.id}><div className="rule-top"><span className="rule-index">{String(i+1).padStart(2,'0')}</span><strong>{r.name}</strong><button className="trash-button" title={`Remove ${r.name}`} aria-label={`Remove ${r.name}`} onClick={()=>updateRules(old=>old.filter(x=>x.id!==r.id))}><Trash2 size={15}/></button></div><div className="rule-details"><span>{r.protocol.toUpperCase()}{r.destinationPort===null?'':` / ${r.destinationPort}`}</span><span className={r.action==='allow'?'allow-label':'deny-label'}>{r.action.toUpperCase()}</span></div><label className="toggle-row"><input type="checkbox" checked={r.enabled} onChange={()=>updateRules(old=>old.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x))}/> Enabled</label></div>)}
            {newRule&&<div className="new-rule"><h4>New policy rule</h4><label>RULE NAME<input value={draftName} maxLength={50} onChange={e=>setDraftName(e.target.value)} /></label><div className="rule-form-two"><label>PROTOCOL<select value={draftProtocol} onChange={e=>setDraftProtocol(e.target.value as Protocol)}><option value="tcp">TCP</option><option value="udp">UDP</option><option value="icmp">ICMP</option></select></label><label>PORT<input type="number" min={1} max={65535} disabled={draftProtocol==='icmp'} value={draftPort} onChange={e=>setDraftPort(Number(e.target.value))}/></label></div><label>ACTION<select value={draftAction} onChange={e=>setDraftAction(e.target.value as Action)}><option value="allow">Allow</option><option value="deny">Deny</option></select></label><button className="primary-button" onClick={saveRule}><Plus size={15}/> Save rule</button></div>}
            <div className="inspector-note"><CircleHelp size={16}/><p>Rules are evaluated top to bottom; the first matching rule wins. This simplified model matches protocol and port.</p></div>
          </>}
          {tab==='events'&&<><div className="tool-heading"><div><span className="section-overline">SECURITY MONITORING</span><h3>Event stream</h3></div><span className="event-count">{logs.length} events</span></div><div className="event-stream">{logs.map(log=><div key={log.id} className="event-row"><div className="event-head"><span className={`event-indicator event-${log.kind}`} /><span>{log.time}</span><span className="event-kind">{log.kind.toUpperCase()}</span></div><p>{log.message}</p></div>)}</div><div className="inspector-note"><Activity size={16}/><p>Events come from the local simulator, not Sysmon, a real firewall, or a production SIEM.</p></div></>}
          {tab==='dns'&&<><div className="section-overline">NAME RESOLUTION</div><h3 className="dns-title">DNS lookup</h3><p className="tool-intro">Resolve a name against the built-in classroom DNS zone.</p><label className="dns-label">HOSTNAME<input value={dnsInput} spellCheck={false} placeholder="app.cyberlab.local" onChange={e=>setDnsInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')runDns();}} /></label><button className="primary-button dns-button" onClick={runDns}><Search size={16}/> Resolve hostname</button>{dnsAnswer&&<div className={`dns-result ${dnsAnswer.ip?'dns-found':'dns-missing'}`}><span>{dnsAnswer.ip?'A RECORD':'NXDOMAIN'}</span><strong>{dnsAnswer.ip??'No matching record'}</strong><p>{dnsAnswer.name}</p></div>}<div className="inspector-note"><Database size={17}/><p>Try <code>app.cyberlab.local</code>, <code>ssh.cyberlab.local</code>, or <code>dns.cyberlab.local</code>.</p></div></>}
        </div>
        <div className="inspector-footer"><div className="status-row"><Wifi size={16}/> <span>Browser-only, offline simulation</span><CheckCircle2 size={17}/></div><p>No real packets, attacks, or telemetry are generated.</p></div>
      </aside>
    </div>
    <footer className="mobile-footer"><Code2 size={14}/> CyberLab MVP · Your progress is stored locally in this browser.</footer>
  </div>;
}
export default App;
