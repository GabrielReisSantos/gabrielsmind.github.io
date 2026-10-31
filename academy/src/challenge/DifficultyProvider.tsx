import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {DIFFICULTIES,isDifficulty,profileFor,remainingSeconds,type Difficulty} from './difficulty';
import './challenge.css';
const KEY='cyberlab-challenge-difficulty-v7';
const Context=createContext<{mode:Difficulty;setMode:(m:Difficulty)=>void}>({mode:'beginner',setMode:()=>{}});
function initialMode():Difficulty{try{const stored=localStorage.getItem(KEY);return isDifficulty(stored)?stored:'beginner';}catch{return 'beginner';}}
export function DifficultyProvider({children}:{children:ReactNode}){
 const [mode,setMode]=useState<Difficulty>(initialMode);
 useEffect(()=>{try{localStorage.setItem(KEY,mode);}catch{/* private browsing */}},[mode]);
 return <Context.Provider value={{mode,setMode}}>{children}</Context.Provider>;
}
export function useDifficulty(){const {mode,setMode}=useContext(Context);return {mode,setMode,profile:profileFor(mode)};}
export function DifficultySelector(){const {mode,setMode}=useDifficulty();return <label className="challenge-selector" title="Difficulty affects mission evidence requirements, hints, feedback, scoring and exam timing"><span>DIFFICULTY</span><select aria-label="Global challenge difficulty" value={mode} onChange={e=>setMode(e.target.value as Difficulty)}>{DIFFICULTIES.map(p=><option value={p.id} key={p.id}>{p.title}</option>)}</select></label>;}
export function DifficultyNotice(){const {profile}=useDifficulty();return <div className="challenge-notice"><b>{profile.title}</b><span>{profile.summary}</span></div>;}
/** Exam clock persisted per exercise; the timer cannot be reset by reloading or navigating away. */
export function useChallengeClock(exerciseKey:string){
 const {mode,profile}=useDifficulty();const storageKey=`cyberlab-v7-exam-start-${exerciseKey}`;
 const [started,setStarted]=useState<number|null>(()=>{if(mode!=='exam')return null;try{const n=Number(localStorage.getItem(storageKey));return n>0?n:null;}catch{return null;}});
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{if(mode!=='exam')return;try{const n=Number(localStorage.getItem(storageKey));setStarted(n>0?n:null);}catch{setStarted(null);}},[storageKey,mode]);
 useEffect(()=>{if(mode!=='exam'||started===null)return;const id=window.setInterval(()=>setNow(Date.now()),1000);return ()=>clearInterval(id);},[started,mode]);
 const start=()=>{const at=Date.now();try{localStorage.setItem(storageKey,String(at));}catch{/* no storage */}setStarted(at);setNow(at);};
 const reset=()=>{try{localStorage.removeItem(storageKey);}catch{/* no storage */}setStarted(null);setNow(Date.now());};
 const remaining=remainingSeconds(started,now,profile.timeLimitSeconds);
 return {started:mode==='exam'?started:0,remaining,expired:mode==='exam'&&started!==null&&remaining===0,needsStart:mode==='exam'&&started===null,start,reset};
}
export function ExamGate({clock,children}:{clock:ReturnType<typeof useChallengeClock>;children:ReactNode}){
 const {mode}=useDifficulty();
 if(mode!=='exam')return <>{children}</>;
 if(clock.needsStart)return <div className="challenge-exam-gate"><h3>Timed assessment</h3><p>15 minutes. Hints and immediate correctness feedback are disabled. The attempt timer survives page reloads. Evidence must be collected before submitting. This is independent practice, not a real certification exam.</p><button onClick={clock.start}>Begin 15-minute attempt</button></div>;
 return <><div className={`challenge-exam-clock ${clock.expired?'expired':''}`} role="timer">{clock.expired?'TIME EXPIRED':`TIME LEFT ${String(Math.floor((clock.remaining??0)/60)).padStart(2,'0')}:${String((clock.remaining??0)%60).padStart(2,'0')}`}</div>{clock.expired?<div className="challenge-exam-gate"><h3>Time expired</h3><p>This attempt can no longer earn a passing score. Review your collected evidence, or explicitly restart the timed attempt.</p><button onClick={clock.reset}>Restart attempt</button></div>:children}</>;
}
