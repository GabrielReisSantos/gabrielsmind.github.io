import {useEffect,useMemo,useRef,useState,type ChangeEvent,type KeyboardEvent} from 'react';
import {BookOpen,CheckCircle2,Code2,Download,Keyboard,Play,RotateCcw,ShieldAlert,Terminal,Wifi,WifiOff} from 'lucide-react';
import {CODING_LESSONS,getLesson,type Language} from './lessons';
import {codingSavedIds,initialApiState,mockApi,parseHttpRequest,validateApiLesson,validateCSharpReference,type ApiState} from './engine';
import {runPython,stopPython} from './pythonRunner';
import {storeLocation} from '../../learning/progress';
import './coding.css';
const PROGRESS_KEY='cyberlab-coding-v15-progress';
const DRAFT_PREFIX='cyberlab-coding-v15-draft-';
export type Completion={id:string;quality:'guided'|'independent';kind:'executed'|'reference'|'mock';repetitions:number};
function readCompletions():Completion[]{try{
 const raw=JSON.parse(localStorage.getItem(PROGRESS_KEY)??'[]') as unknown;
 if(!Array.isArray(raw))return [];
 const ids=CODING_LESSONS.map(l=>l.id);const valid=codingSavedIds(raw.map((r:unknown)=>r&&typeof r==='object'?'id'in r?(r as {id:unknown}).id:null:null),ids);
 return valid.map(id=>{const row=raw.find((r:unknown)=>r&&typeof r==='object'&&'id'in r&&(r as {id:unknown}).id===id) as Partial<Completion>;return {id,quality:row.quality==='independent'?'independent':'guided',kind:row.kind==='executed'?'executed':row.kind==='reference'?'reference':'mock',repetitions:Math.min(100,Math.max(1,Number(row.repetitions)||1))};});
 }catch{return [];}}
function readDraft(id:string){try{return localStorage.getItem(DRAFT_PREFIX+id)??'';}catch{return '';}}
function downloadText(text:string,name:string){const blob=new Blob([text],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export default function CodingFoundations(){
 const [track,setTrack]=useState<Language>(()=>{const last=window.localStorage.getItem('cyberlab-coding-v15-lesson');return (last&&getLesson(last)?.language)||'python';});
 const [selected,setSelected]=useState<string>(()=>{const id=window.localStorage.getItem('cyberlab-coding-v15-lesson');return id&&getLesson(id)?id:'py-01';});
 const [draft,setDraft]=useState(()=>readDraft(selected));
 const [completions,setCompletions]=useState<Completion[]>(readCompletions);
 const [typed,setTyped]=useState(0),[pasted,setPasted]=useState(false),[hinted,setHinted]=useState(false),[showHint,setShowHint]=useState(false);
 const [result,setResult]=useState<{ok:boolean;text:string;verified:boolean}|null>(null);
 const [busy,setBusy]=useState(false),[api,setApi]=useState<ApiState>(initialApiState);
 const [awardedThisRound,setAwardedThisRound]=useState(false);
 const textareaRef=useRef<HTMLTextAreaElement>(null);
 const lesson=getLesson(selected)??CODING_LESSONS[0];
 const count=useMemo(()=>CODING_LESSONS.filter(l=>l.language===track&&completions.some(c=>c.id===l.id)).length,[completions,track]);
 const current=completions.find(c=>c.id===lesson.id);
 useEffect(()=>{try{localStorage.setItem(DRAFT_PREFIX+selected,draft);}catch{/* private browsing */}},[draft,selected]);
 useEffect(()=>()=>stopPython(),[]);
 function changeLesson(id:string){const next=getLesson(id);if(!next)return;stopPython();setBusy(false);setSelected(id);setTrack(next.language);setDraft(readDraft(id));setTyped(0);setPasted(false);setHinted(false);setShowHint(false);setResult(null);setAwardedThisRound(false);setApi(initialApiState());try{localStorage.setItem('cyberlab-coding-v15-track',next.language);localStorage.setItem('cyberlab-coding-v15-lesson',id);}catch{/* ignore */}storeLocation('foundation','coding');}
 function chooseTrack(language:Language){changeLesson(CODING_LESSONS.find(l=>l.language===language)?.id??'py-01');}
 function award(kind:Completion['kind']){
  if(awardedThisRound||(typed<8&&!pasted))return;setAwardedThisRound(true);
  const quality=(!pasted&&!hinted&&typed>=Math.min(35,Math.max(8,Math.ceil(lesson.solution.length*.25))))?'independent':'guided';
  setCompletions(currentRows=>{
   const old=currentRows.find(c=>c.id===lesson.id);const updated:Completion={id:lesson.id,quality:old?.quality==='independent'?'independent':quality,kind,repetitions:Math.min(100,(old?.repetitions??0)+1)};
   const next=[...currentRows.filter(c=>c.id!==lesson.id),updated];try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(next));window.dispatchEvent(new Event('cyberlab:progress'));}catch{/* ignore */}return next;
  });
 }
 async function run(){if(busy)return;setResult(null);
  if(!draft.trim()){setResult({ok:false,text:'Type your code first. The exercise starts blank on purpose.',verified:false});return;}
  if(lesson.language==='csharp'){
   const pass=validateCSharpReference(lesson,draft);
   setResult({ok:pass,text:pass?'Reference syntax matched. This is typing practice only: no C# compiler executed.':'This differs from the reference structure. Check braces, keywords, punctuation and capitalization. C# is case-sensitive.',verified:pass});if(pass)award('reference');return;
  }
  if(lesson.language==='api'){
   try{const request=parseHttpRequest(draft);const {result:response,state}=mockApi(request,api);setApi(state);const passed=validateApiLesson(lesson.id,request,response);setResult({ok:passed,text:`HTTP/1.1 ${response.status} ${response.statusText}\nContent-Type: application/json\n\n${JSON.stringify(response.body,null,2)}\n\n${passed?'Request verified for this exercise.':'Response received. Compare the method, path, headers, and JSON with your objective.'}`,verified:passed});if(passed)award('mock');}catch(e){setResult({ok:false,text:String(e),verified:false});}return;
  }
  setBusy(true);
  try{const response=await runPython(draft,lesson.pythonTests??[]);const pass=response.ok&&response.output.trim()===lesson.expected.trim();setResult({ok:pass,text:response.ok?`Python output:\n${response.output||'(no output)'}\n\n${pass?'All output checks passed.':'Output differs from expected; review your logic and try again.'}`:`Python error:\n${response.output}`,verified:pass});if(pass)award('executed');}finally{setBusy(false);}
 }
 function reset(){stopPython();setBusy(false);setDraft('');setTyped(0);setPasted(false);setHinted(false);setShowHint(false);setResult(null);setAwardedThisRound(false);textareaRef.current?.focus();}
 function onKeyDown(e:KeyboardEvent<HTMLTextAreaElement>){if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();void run();return;}if(e.key==='Tab'){e.preventDefault();const el=e.currentTarget,s=el.selectionStart,stop=el.selectionEnd;setDraft(t=>t.slice(0,s)+'    '+t.slice(stop));setTyped(v=>v+4);requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=s+4;});return;}if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey)setTyped(v=>v+1);else if(e.key==='Enter')setTyped(v=>v+1);}
 return <section className="code-foundations" aria-label="Coding foundations">
  <div className="code-hero"><div><span className="code-eyebrow"><Keyboard size={16}/> HANDS-ON FOUNDATIONS · TYPING PRACTICE</span><h2>Learn the syntax by writing it.</h2><p>Type every line. Run Python in your browser, rehearse C# syntax, and send raw HTTP requests to an in-memory API. No AI autocomplete, no prefilled solution.</p></div><div className="code-hero-total"><strong>{completions.length}<span>/{CODING_LESSONS.length}</span></strong><small>drills practiced</small></div></div>
  <div className="code-track-nav" role="group" aria-label="Choose coding course">{([{id:'python',title:'Python fundamentals',icon:Terminal},{id:'csharp',title:'C# fundamentals',icon:Code2},{id:'api',title:'HTTP & APIs',icon:Wifi}] as const).map(x=><button key={x.id} className={track===x.id?'active':''} onClick={()=>chooseTrack(x.id)} aria-pressed={track===x.id}><x.icon size={19}/><span>{x.title}</span><small>{CODING_LESSONS.filter(l=>l.language===x.id&&completions.some(c=>c.id===l.id)).length}/6</small></button>)}</div>
  <div className="code-workspace"><aside className="code-list"><div className="code-list-heading"><strong>Learning steps</strong><small>{count} of 6 practiced</small></div>{CODING_LESSONS.filter(l=>l.language===track).map((l,i)=>{const c=completions.find(x=>x.id===l.id);return <button key={l.id} className={lesson.id===l.id?'active':''} onClick={()=>changeLesson(l.id)}><span className="code-lesson-num">{String(i+1).padStart(2,'0')}</span><span><strong>{l.title}</strong><small>{l.concept}</small></span>{c&&<CheckCircle2 size={17} color="#55d6a0"/>}</button>;})}<p>Progress measures practice, not certification mastery. C# has not been compiled.</p></aside>
   <div className="code-main"><div className="code-brief"><span className="code-eyebrow">{track.toUpperCase()} · {lesson.id.toUpperCase()} · {lesson.concept}</span><h3>{lesson.title}</h3><p>{lesson.objective}</p><div className="code-task"><BookOpen size={17}/><div><strong>Your task</strong><p>{lesson.prompt}</p></div></div></div>
    <div className="code-editor-header"><span><Code2 size={16}/> {track==='python'?'main.py':track==='csharp'?'Program.cs':'request.http'}</span><span><Keyboard size={14}/> {typed} keys typed · {draft.split('\n').length} lines</span></div>
    <div className="code-editor"><div className="code-gutter" aria-hidden="true">{draft.split('\n').map((_,i)=><span key={i}>{i+1}</span>)}</div><textarea ref={textareaRef} aria-label="Type code for the selected exercise" spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" value={draft} onChange={(e:ChangeEvent<HTMLTextAreaElement>)=>{setDraft(e.target.value);setResult(null);}} onKeyDown={onKeyDown} onPaste={()=>setPasted(true)} placeholder={track==='api'?'GET /api/assets HTTP/1.1\nAccept: application/json':'Type your code here. The editor starts empty.'}/></div>
    <p className="code-typing-note">Type at least eight keys or make an explicit assisted paste before a successful check records a new practice repetition. Re-running a saved draft without typing does not count.</p>
    <div className="code-controls"><button className="code-primary" disabled={busy} onClick={()=>void run()}><Play size={16}/>{busy?'Loading Python runtime…':track==='csharp'?'Check reference syntax':track==='api'?'Send simulated request':'Run Python'} <kbd>Ctrl ↵</kbd></button><button onClick={reset}><RotateCcw size={15}/> Clear & repeat</button><button onClick={()=>downloadText(draft,track==='python'?'main.py':track==='csharp'?'Program.cs':'request.http')}><Download size={15}/> Export</button></div>
    {busy&&<div className="code-notice"><Wifi size={16}/> Pyodide is loading a one-time WebAssembly runtime from a pinned CDN. Python executes in a browser worker, not on a server.</div>}
    {result&&<div role="status" className={`code-output ${result.ok?'good':'bad'}`}><strong>{result.ok?'✓ Exercise check passed':'Diagnostic output'}</strong><pre>{result.text}</pre></div>}
    {current&&<div className="code-notice"><CheckCircle2 size={16}/> Practiced {current.repetitions} time(s) · {current.quality==='independent'?'Independent typing':'Guided / pasted / insufficient independent keystrokes'} · {current.kind==='executed'?'Python executed':current.kind==='reference'?'C# reference compared':'Mock request evaluated'}</div>}
    <div className="code-guidance"><div><strong>Syntax pattern</strong><pre>{lesson.example}</pre></div><div><button onClick={()=>{setShowHint(v=>!v);setHinted(true);}} aria-expanded={showHint}><ShieldAlert size={15}/> {showHint?'Hide hint':'Reveal hint'}</button>{showHint&&<p>{lesson.hint}</p>}<p>Expected result: <code>{lesson.expected}</code></p></div></div>
    <div className="code-disclaimer"><WifiOff size={15}/>{track==='python'?'Python runs as CPython/WebAssembly in an isolated browser worker; first use requires a CDN download. Do not paste secrets.':track==='csharp'?'C# is case-sensitive typing/repetition practice; structural match does not mean the code compiles. Real compilation will require an added WASM compiler.':'HTTP is sent to a deterministic in-memory mock service, not a real network endpoint. The example bearer token is synthetic.'}</div>
   </div>
  </div>
 </section>;
}
