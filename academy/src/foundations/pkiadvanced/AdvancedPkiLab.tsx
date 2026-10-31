import {useState,useRef,type KeyboardEvent} from 'react';
import {ShieldCheck,Terminal,Play,RotateCcw,BookOpen,Download,CheckCircle2,AlertTriangle,Eye,KeyRound,Clock,FileText} from 'lucide-react';
import {createAdvancedState,execute,type AdvancedState,type Outcome} from './engine';
import {ADVANCED_DRILLS,TRACKS,type Track} from './lessons';
import {readPractice,savePractice,recordPractice,type PracticeRecord} from './recall';
import './advanced.css';

const download=(name:string,text:string)=>{const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);};
const promptNginx=`server {
    listen 443 ssl;
    server_name app.cyberlab.test;
    ssl_certificate /etc/nginx/tls/fullchain.pem;
    ssl_certificate_key /etc/nginx/tls/server.key;
    ssl_client_certificate /etc/nginx/tls/root.crt;
    ssl_verify_client on;
    ssl_protocols TLSv1.2 TLSv1.3;
}`;
function validateNginx(text:string){return [
 {label:'HTTPS listener with TLS',ok:/listen\s+443\s+ssl\s*;/.test(text)},
 {label:'Correct DNS virtual host',ok:/server_name\s+app\.cyberlab\.test\s*;/.test(text)},
 {label:'Full chain (leaf + intermediate)',ok:/ssl_certificate\s+[^\s;]*fullchain\.pem\s*;/.test(text)},
 {label:'Separate private key path',ok:/ssl_certificate_key\s+[^\s;]*server\.key\s*;/.test(text)},
 {label:'Require trusted client certificate for mTLS',ok:/ssl_client_certificate\s+[^\s;]+;/.test(text)&&/ssl_verify_client\s+on\s*;/.test(text)}
];}
const promptPython=`import os\nimport requests\n\ntoken = os.environ.get("INVENTORY_TOKEN")\nresponse = requests.get("https://inventory.cyberlab.test/assets", headers={"Authorization": f"Bearer {token}"}, timeout=5)\nresponse.raise_for_status()\nprint(response.json())`;
function validatePython(source:string){const checks=[{label:'Import environment configuration',good:/import\s+os\b/.test(source)},{label:'Read token from environment, never hardcode it',good:/os\.environ\.(get|__getitem__)\s*\(|os\.getenv\s*\(/.test(source)&&!/Bearer\s+[A-Za-z0-9_-]{20,}/.test(source)},{label:'Use HTTP client and Authorization Bearer header',good:/requests\.get\s*\(/.test(source)&&/Authorization/.test(source)&&/Bearer/.test(source)},{label:'Set a finite timeout',good:/timeout\s*=\s*\d+/.test(source)},{label:'Validate HTTP response status',good:/raise_for_status\s*\(/.test(source)}];return checks;}
export default function AdvancedPkiLab(){
 const [lab,setLab]=useState<AdvancedState>(()=>createAdvancedState());
 const [track,setTrack]=useState<Track>('factory');
 const [selected,setSelected]=useState(ADVANCED_DRILLS[0].id);
 const [input,setInput]=useState('');
 const [last,setLast]=useState<Outcome|null>(null);
 const [busy,setBusy]=useState(false);
 const [typed,setTyped]=useState(0);
 const [pasted,setPasted]=useState(false);
 const [hint,setHint]=useState(false);
 const [showReference,setShowReference]=useState(false);
 const [records,setRecords]=useState<PracticeRecord[]>(readPractice);
 const [python,setPython]=useState('');
 const [nginx,setNginx]=useState('');
 const [nginxValidated,setNginxValidated]=useState(false);
 const [pyTouched,setPyTouched]=useState(0);
 const [pyPasted,setPyPasted]=useState(false);
 const [pyChecked,setPyChecked]=useState(false);
 const textarea=useRef<HTMLTextAreaElement>(null);
 const lesson=ADVANCED_DRILLS.find(l=>l.id===selected)??ADVANCED_DRILLS[0];
 const record=records.find(r=>r.id===lesson.id);
 const completed=records.filter(r=>r.independent>0).length;
 const files=Object.entries(lab.files).filter(([file])=>!file.endsWith('.key'));
 const webCrypto=typeof crypto!=='undefined'&&!!crypto.subtle;
 const isDue=(r:PracticeRecord|undefined)=>!!r&&r.independent>0&&r.dueAt<=Date.now();
 function choose(id:string){const d=ADVANCED_DRILLS.find(l=>l.id===id);if(!d)return;setSelected(id);setTrack(d.track);clear();}
 function clear(){setInput('');setTyped(0);setPasted(false);setHint(false);setShowReference(false);setLast(null);textarea.current?.focus();}
 function reset(){if(!window.confirm('Restart the ephemeral PKI environment? This clears session keys, certificates and tokens but keeps non-sensitive study history.'))return;setLab(createAdvancedState());setLast(null);clear();}
 function keydown(e:KeyboardEvent<HTMLTextAreaElement>){if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();void run();}else if(e.key==='Tab'){e.preventDefault();const el=e.currentTarget,s=el.selectionStart,t=el.selectionEnd;setInput(prev=>prev.slice(0,s)+'  '+prev.slice(t));setTyped(n=>n+2);requestAnimationFrame(()=>el.selectionStart=el.selectionEnd=s+2);}else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey)setTyped(n=>n+1);}
 async function run(){if(busy||!input.trim())return;if(!webCrypto){setLast({ok:false,code:'insecure',output:'WebCrypto requires HTTPS or localhost.',security:false});return;}
 setBusy(true);try{
  const r=await execute(lab,input);setLab({...lab,files:{...lab.files},audit:[...lab.audit],tokens:[...lab.tokens]});setLast(r);
  const matches=r.code===lesson.expect&&r.ok===lesson.success;
  if(matches){const assisted=pasted||hint||showReference||typed<Math.max(8,Math.floor(lesson.command.length*.65));const now=Date.now();const previous=records.find(x=>x.id===lesson.id);const next=recordPractice(previous,lesson.id,now,true,assisted);const rows=[...records.filter(x=>x.id!==lesson.id),next];setRecords(rows);savePractice(rows);}
 }catch(error){setLast({ok:false,code:'unexpected',output:String(error),security:false});}finally{setBusy(false);}}
 const history=lab.audit.slice(-7).reverse();
 const pyChecks=validatePython(python);const pythonPassed=pyChecked&&pyChecks.every(c=>c.good)&&!pyPasted&&pyTouched>=Math.max(30,Math.floor(python.length*.6));
 return <section className="v17-root" aria-label="Advanced TLS PKI and secrets engineering">
  <header className="v17-hero"><div><span className="v17-eyebrow"><ShieldCheck size={16}/> PKI ENGINEERING · HANDS-ON LAB V1.7</span><h2>Issue. Break. Diagnose. Repair.</h2><p>Build a genuine root → intermediate → server/client certificate chain, then investigate certificate failures, firewall decryption and API secret rotation. Every training command is typed, never executed on your host.</p></div><div className="v17-hero-count"><b>{completed}<span> / {ADVANCED_DRILLS.length}</span></b><small>independent drills</small></div></header>
  <div className="v17-tracks">{TRACKS.map(t=><button key={t.id} className={track===t.id?'active':''} aria-pressed={track===t.id} onClick={()=>{const d=ADVANCED_DRILLS.find(l=>l.track===t.id);if(d)choose(d.id);}}><strong>{t.title}</strong><small>{t.subtitle}</small><span>{ADVANCED_DRILLS.filter(l=>l.track===t.id&&records.some(r=>r.id===l.id&&r.independent>0)).length}/{ADVANCED_DRILLS.filter(l=>l.track===t.id).length} independently completed</span></button>)}</div>
  <div className="v17-workspace"><aside className="v17-sidebar"><h3>{TRACKS.find(t=>t.id===track)?.title}</h3><p>Run lessons in order when creating certificates. Session artifacts are reused across all tracks.</p>{ADVANCED_DRILLS.filter(l=>l.track===track).map((d,i)=>{const r=records.find(x=>x.id===d.id);return <button className={`v17-step ${selected===d.id?'active':''}`} key={d.id} onClick={()=>choose(d.id)} aria-current={d.id===selected?'step':undefined}><span className="v17-num">{i+1}</span><span><strong>{d.title}</strong><small>{d.kind==='real'?'Real WebCrypto artifacts':'Stateful model'}{isDue(r)?' · Due for recall':''}</small></span>{r&&r.independent>0?<CheckCircle2 size={16} color="#6de3af"/>:null}</button>;})}</aside>
   <div className="v17-panel"><div className="v17-step-head"><span className="v17-eyebrow">{lesson.id.toUpperCase()} · {lesson.kind==='real'?'REAL CRYPTOGRAPHIC ARTIFACT':'DETERMINISTIC SIMULATION'}</span><h3>{lesson.title}</h3><p>{lesson.objective}</p></div>
    <div className="v17-why"><BookOpen size={18}/><span>{lesson.explain}</span></div>
    <div className="v17-chain" aria-label="Certificate chain"><span>Root CA <small>pathLen 1</small></span><b>→</b><span>Intermediate CA <small>pathLen 0</small></span><b>→</b><span>Server / client <small>leaf keys + EKU</small></span></div>
    <div className="v17-console-top"><span><Terminal size={15}/> Training interpreter</span><span>{typed} typed keys · Ctrl+Enter</span></div>
    <textarea ref={textarea} className="v17-editor" aria-label="Type the training command" placeholder="Type a training command. Enter 'help' to see supported commands." spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" value={input} onChange={e=>setInput(e.target.value)} onPaste={()=>setPasted(true)} onKeyDown={keydown}/>
    <div className="v17-actions"><button className="v17-primary" disabled={busy||!webCrypto} onClick={()=>void run()}><Play size={15}/>{busy?'Running…':'Run command'}</button><button onClick={clear}><RotateCcw size={15}/> Clear & repeat</button><button onClick={()=>setHint(true)}><Eye size={15}/> Hint</button><button onClick={reset}><RotateCcw size={15}/> Reset lab</button></div>
    {hint&&<div className="v17-hint"><strong>Hint</strong><p>{lesson.hint}</p><button onClick={()=>setShowReference(v=>!v)}>{showReference?'Hide':'Show'} reference command (assisted)</button>{showReference&&<code>{lesson.command}</code>}</div>}
    {last&&<div className={`v17-output ${last.ok?'good':'bad'}`} role="status"><strong>{last.ok?'Operation completed':'Operation denied / diagnostic failure'} · {last.code}</strong><pre>{last.output}</pre>{last.code===lesson.expect&&last.ok===lesson.success&&<p>Expected lesson result reached. {pasted||hint||showReference||typed<Math.max(8,Math.floor(lesson.command.length*.65))?'Assisted attempt: repeat without hints or pasting for independent credit.':'Independent attempt recorded; repeat at the next due review.'}</p>}</div>}
    {record&&<p className="v17-credit"><Clock size={15}/> {record.independent} independent recall(s), {record.attempts} successful practice attempt(s). {record.independent?isDue(record)?'Due for recall now.':`Next review: ${new Date(record.dueAt).toLocaleString()}`:'Repeat unaided to earn independent credit.'}</p>}
    <div className="v17-artifacts"><div><h4><FileText size={17}/> Session artifacts</h4><p>Real X.509/CSR/PEM exports are available below. Private keys deliberately stay in memory and are not offered for download here.</p></div><div className="v17-file-list">{files.length?files.map(([name,value])=><button key={name} onClick={()=>download(name,value)} title={`Export ${name}`}><Download size={13}/><code>{name}</code></button>):<span>No generated certificates yet.</span>}</div></div>
    <div className="v17-history"><h4>Investigation trace</h4>{history.length?history.map((e,i)=><div key={`${i}-${e.command}`}><span>{e.ok?'✓':'×'}</span><code>{e.command}</code><small>{e.code}</small></div>):<p>Session is fresh. Begin with the root certificate in Certificate Factory.</p>}</div>
   </div>
  </div>
  <div className="v17-python"><div><span className="v17-eyebrow"><KeyRound size={15}/> CROSS-MODULE PRACTICE: PYTHON + SECRETS + APIs</span><h3>Write the secure Python API consumer</h3><p>Type Python from scratch: import the token from the environment, pass it in an Authorization header, set a timeout, and validate the status. This block checks source structure; it does not execute Python. Use Coding Foundations for actual Python execution.</p></div><div className="v17-code-card"><div className="v17-console-top"><span>inventory_client.py</span><span>Syntax/contract practice</span></div><textarea aria-label="Python inventory API client source" value={python} onChange={e=>{setPython(e.target.value);setPyChecked(false);}} onPaste={()=>setPyPasted(true)} onKeyDown={e=>{if(e.key.length===1&&!e.ctrlKey&&!e.metaKey)setPyTouched(x=>x+1);}} spellCheck={false} placeholder="Type Python here. Click 'Show example' if you're stuck."/><div className="v17-actions"><button className="v17-primary" onClick={()=>setPyChecked(true)}>Check my code</button><button onClick={()=>{setPython('');setPyTouched(0);setPyPasted(false);setPyChecked(false);}}>Clear & repeat</button><details><summary>Show example (assisted)</summary><pre>{promptPython}</pre></details></div>{pyChecked&&<div className="v17-python-checks">{pyChecks.map(c=><p key={c.label}>{c.good?'✓':'×'} {c.label}</p>)}<strong>{pythonPassed?'Independent source structure passed (not executed).':'Revise missing checks and type independently for rehearsal credit.'}</strong></div>}</div></div>
  <div className="v17-python"><div><span className="v17-eyebrow"><ShieldCheck size={15}/> SERVER DEPLOYMENT PRACTICE</span><h3>Configure HTTPS and mutual TLS</h3><p>Type a fictional NGINX server block that presents the server fullchain and private key, trusts the correct client CA, and requires client certificates. This is structural review only; it does not install, parse or execute NGINX.</p></div><div className="v17-code-card"><div className="v17-console-top"><span>nginx /etc/nginx/sites-available/training</span><span>Local reference checker</span></div><textarea aria-label="Type an NGINX TLS server block" value={nginx} onChange={e=>{setNginx(e.target.value);setNginxValidated(false);}} spellCheck={false} placeholder="server { ... }"/><div className="v17-actions"><button className="v17-primary" onClick={()=>setNginxValidated(true)}>Check TLS configuration</button><button onClick={()=>{setNginx('');setNginxValidated(false);}}>Clear & repeat</button><details><summary>Show reference (assisted)</summary><pre>{promptNginx}</pre></details></div>{nginxValidated&&<div className="v17-python-checks">{validateNginx(nginx).map(c=><p key={c.label}>{c.ok?'✓':'×'} {c.label}</p>)}<strong>{validateNginx(nginx).every(x=>x.ok)?'Required structural controls present. Not a real NGINX test.':'Configuration still misses required controls.'}</strong></div>}</div></div>
  <footer className="v17-disclaimer"><AlertTriangle size={17}/><p><strong>Safety and scope:</strong> Real throwaway CA, CSR and leaf certificate artifacts are created using WebCrypto; OpenSSL command strings are interpreted, not executed. `s_client`, mTLS, NGFW decryption, revocation and API behavior are simulations. Do not enter real private keys or service credentials. Browser-only scoring cannot certify real operational competence. WebCrypto requires HTTPS or localhost.</p></footer>
 </section>;
}
