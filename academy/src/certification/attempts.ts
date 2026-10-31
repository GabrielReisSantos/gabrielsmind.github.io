/** Crash/reload-safe local practice attempts. This is not a tamper-resistant exam system. */
import {QUESTIONS,TRACKS,type Question,type Track} from './blueprints';
import {PRACTICE_DURATION_SECONDS} from './exam';
export const BANK_VERSION='1.9.3';
export type ExamStatus='active'|'submitted'|'expired';
export interface ExamAttempt { id:string;version:string;trackId:Track['id'];questionIds:string[];answers:Record<string,number>;flags:string[];index:number;startedAt:number;deadlineAt:number;status:ExamStatus;completedAt:number|null }
export interface ExamResult { id:string;trackId:Track['id'];completedAt:number;status:'submitted'|'expired';score:number;answered:number;total:number;domains:Record<string,{correct:number;total:number}>;questionIds:string[];answers:Record<string,number> }
const questionById=new Map(QUESTIONS.map(q=>[q.id,q]));
export const ATTEMPT_KEY='cyberlab-cert-exam-v2-';
export const HISTORY_KEY='cyberlab-cert-exam-history-v2';
export function createAttempt(trackId:Track['id'],questions:Question[],now:number):ExamAttempt {
 if(questions.length===0||questions.some(q=>q.track!==trackId)||new Set(questions.map(q=>q.id)).size!==questions.length)throw new Error('Invalid exam question selection');
 return {id:`${trackId}-${now}-${Math.random().toString(36).slice(2,10)}`,version:BANK_VERSION,trackId,questionIds:questions.map(q=>q.id),answers:{},flags:[],index:0,startedAt:now,deadlineAt:now+PRACTICE_DURATION_SECONDS*1000,status:'active',completedAt:null};
}
export function completeAttempt(attempt:ExamAttempt,now:number):ExamAttempt {
 if(attempt.status!=='active')return attempt;
 const expired=now>=attempt.deadlineAt;
 return {...attempt,status:expired?'expired':'submitted',completedAt:expired?attempt.deadlineAt:now};
}
export function remainingSeconds(attempt:ExamAttempt,now:number){return attempt.status==='active'?Math.max(0,Math.ceil((attempt.deadlineAt-now)/1000)):0;}
export function setExamAnswer(attempt:ExamAttempt,id:string,choice:number,now:number):ExamAttempt {
 if(attempt.status!=='active'||now>=attempt.deadlineAt||!attempt.questionIds.includes(id)||!Number.isInteger(choice)||choice<0||choice>3)return attempt;
 return {...attempt,answers:{...attempt.answers,[id]:choice}};
}
export function toggleExamFlag(attempt:ExamAttempt,id:string):ExamAttempt {
 if(attempt.status!=='active'||!attempt.questionIds.includes(id))return attempt;
 return {...attempt,flags:attempt.flags.includes(id)?attempt.flags.filter(x=>x!==id):[...attempt.flags,id]};
}
export function safeAttempt(raw:unknown,trackId:Track['id'],now:number):ExamAttempt|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const v=raw as Partial<ExamAttempt>;
 if(v.version!==BANK_VERSION||v.trackId!==trackId||typeof v.id!=='string'||v.id.length>100||!Array.isArray(v.questionIds)||v.questionIds.length!==30)return null;
 if(new Set(v.questionIds).size!==v.questionIds.length||v.questionIds.some(id=>typeof id!=='string'||questionById.get(id)?.track!==trackId))return null;
 if(!Number.isFinite(v.startedAt)||!Number.isFinite(v.deadlineAt)||v.startedAt!<0||v.startedAt!>now+60000||v.deadlineAt!==v.startedAt!+PRACTICE_DURATION_SECONDS*1000)return null;
 if(v.status!=='active'&&v.status!=='expired'&&v.status!=='submitted')return null;
 if(!Number.isSafeInteger(v.index)||v.index!<0||v.index!>=v.questionIds.length)return null;
 const answers:Record<string,number>={};const valid=new Set(v.questionIds);
 if(v.answers&&typeof v.answers==='object'&&!Array.isArray(v.answers))for(const [id,choice] of Object.entries(v.answers))if(valid.has(id)&&Number.isInteger(choice)&&choice>=0&&choice<=3)answers[id]=choice;
 const flags=Array.isArray(v.flags)?[...new Set(v.flags.filter((x):x is string=>typeof x==='string'&&valid.has(x)))]:[];
 const completion=v.status==='active'?null:v.completedAt;
 if(v.status!=='active'&&(!Number.isFinite(completion)||completion!<v.startedAt!||completion!>v.deadlineAt!))return null;
 const attempt:ExamAttempt={id:v.id,version:BANK_VERSION,trackId,questionIds:v.questionIds,answers,flags,index:v.index!,startedAt:v.startedAt!,deadlineAt:v.deadlineAt!,status:v.status,completedAt:completion??null};
 return attempt.status==='active'&&now>=attempt.deadlineAt?completeAttempt(attempt,now):attempt;
}
export function loadAttempt(trackId:Track['id'],now=Date.now()):ExamAttempt|null{try{return safeAttempt(JSON.parse(localStorage.getItem(ATTEMPT_KEY+trackId)||'null'),trackId,now);}catch{return null;}}
export function saveAttempt(attempt:ExamAttempt):void{try{localStorage.setItem(ATTEMPT_KEY+attempt.trackId,JSON.stringify(attempt));}catch{/* Browser storage unavailable */}}
export function toResult(attempt:ExamAttempt):ExamResult {
 if(attempt.status==='active'||attempt.completedAt===null)throw new Error('Cannot grade an active exam');
 const track=TRACKS.find(t=>t.id===attempt.trackId)!;
 const domains:ExamResult['domains']={};let score=0;
 for(const d of track.domains){const qs=attempt.questionIds.map(id=>questionById.get(id)!).filter(q=>q.domain===d.id);const correct=qs.filter(q=>attempt.answers[q.id]===q.correct).length;domains[d.id]={correct,total:qs.length};if(qs.length)score+=d.weight*(correct/qs.length);}
 return {id:attempt.id,trackId:attempt.trackId,completedAt:attempt.completedAt,status:attempt.status,score:Math.round(score*10)/10,answered:Object.keys(attempt.answers).length,total:attempt.questionIds.length,domains,questionIds:[...attempt.questionIds],answers:{...attempt.answers}};
}
export function safeHistory(raw:unknown):ExamResult[]{
 if(!Array.isArray(raw))return [];
 const validTracks=new Set(TRACKS.map(t=>t.id));
 const results:ExamResult[]=[];
 for(const v of raw.slice(-100)){
  if(!v||typeof v!=='object'||typeof v.id!=='string'||!validTracks.has(v.trackId)||!Number.isFinite(v.completedAt)||!Number.isFinite(v.score)||v.score<0||v.score>100||!Array.isArray(v.questionIds)||!v.answers||typeof v.answers!=='object'||!v.domains)continue;
  const trackId=v.trackId as Track['id'];const questions=v.questionIds as string[];
  if(questions.length!==30||new Set(questions).size!==30||questions.some(id=>questionById.get(id)?.track!==trackId))continue;
  const maybeAttempt=safeAttempt({id:v.id,version:BANK_VERSION,trackId,questionIds:questions,answers:v.answers,flags:[],index:0,startedAt:v.completedAt-PRACTICE_DURATION_SECONDS*1000,deadlineAt:v.completedAt, status:'expired',completedAt:v.completedAt},trackId,v.completedAt);
  if(!maybeAttempt)continue;
  // Recompute scores from answers rather than trusting imported scores.
  const result=toResult(maybeAttempt);results.push({...result,status:v.status==='submitted'?'submitted':'expired'});
 }
 return [...new Map(results.map(r=>[r.id,r])).values()].slice(-25);
}
export function loadHistory():ExamResult[]{try{return safeHistory(JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]'));}catch{return [];}}
export function saveHistory(value:ExamResult[]):void{try{localStorage.setItem(HISTORY_KEY,JSON.stringify(value.slice(-25)));}catch{/* Browser storage unavailable */}}
export function questionsForAttempt(attempt:ExamAttempt){return attempt.questionIds.map(id=>questionById.get(id)!).filter(Boolean);}
