/** Browser-only learning history; the schedule is a study aid, not evidence of exam readiness. */
import {QUESTIONS,type Question} from './blueprints';
export interface ReviewEntry { attempts:number; successes:number; failures:number; streak:number; lastAt:number; lastCorrectAt:number|null; dueAt:number; latestCorrect:boolean; history:Array<{at:number;correct:boolean}> }
export type ReviewMap=Record<string,ReviewEntry>;
const DAY=86400000;
const intervals=[DAY,3*DAY,7*DAY,14*DAY,30*DAY];
export function updateReview(records:ReviewMap,question:Question,choice:number,at:number):ReviewMap {
 const prev=records[question.id];const correct=choice===question.correct;
 const old=prev??{attempts:0,successes:0,failures:0,streak:0,lastAt:0,lastCorrectAt:null,dueAt:0,latestCorrect:false,history:[]};
 // Repeating a memorized answer on the same day does not raise a recall streak.
 const independent=old.lastCorrectAt===null||at-old.lastCorrectAt>=DAY;
 const streak=correct?(independent?Math.min(old.streak+1,5):old.streak):0;
 return {...records,[question.id]:{attempts:old.attempts+1,successes:old.successes+(correct?1:0),failures:old.failures+(correct?0:1),streak,lastAt:at,lastCorrectAt:correct?at:old.lastCorrectAt,dueAt:correct?at+intervals[Math.max(0,streak-1)]:at+5*60*1000,latestCorrect:correct,history:[...old.history,{at,correct}].slice(-20)}};
}
export function dueQuestions(track:string,records:ReviewMap,now:number):Question[]{
 return QUESTIONS.filter(q=>q.track===track&&records[q.id]&&records[q.id].dueAt<=now).sort((a,b)=>{
  const x=records[a.id],y=records[b.id];return Number(x.latestCorrect)-Number(y.latestCorrect)||x.streak-y.streak||x.dueAt-y.dueAt;
 });
}
export function domainStats(track:string,domain:string,records:ReviewMap){
 const all=QUESTIONS.filter(q=>q.track===track&&q.domain===domain),practiced=all.filter(q=>records[q.id]);
 const successes=practiced.filter(q=>records[q.id].latestCorrect).length;
 const solid=practiced.filter(q=>records[q.id].streak>=2).length;
 return {total:all.length,practiced:practiced.length,latestCorrect:successes,recallStreak2:solid};
}
export function safeReview(raw:unknown):ReviewMap {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
 const out:ReviewMap={};const valid=new Set(QUESTIONS.map(q=>q.id));
 for(const [id,value] of Object.entries(raw)){
  if(!valid.has(id)||!value||typeof value!=='object'||Array.isArray(value))continue;
  const v=value as Partial<ReviewEntry>;
  if(!Number.isSafeInteger(v.attempts)||v.attempts!<1||v.attempts!>100000||!Number.isFinite(v.dueAt)||v.dueAt!<0||!Number.isFinite(v.lastAt)||v.lastAt!<0)continue;
  const successes=Number.isSafeInteger(v.successes)?Math.max(0,Math.min(v.successes!,v.attempts!)):0;
  const failures=Math.max(0,v.attempts!-successes);
  const streak=Number.isSafeInteger(v.streak)?Math.max(0,Math.min(v.streak!,5)):0;
  const lastCorrectAt=typeof v.lastCorrectAt==='number'&&Number.isFinite(v.lastCorrectAt)?v.lastCorrectAt:null;
  const history=Array.isArray(v.history)?v.history.filter((h):h is {at:number;correct:boolean}=>Boolean(h&&typeof h==='object'&&Number.isFinite(h.at)&&typeof h.correct==='boolean')).slice(-20):[];
  out[id]={attempts:v.attempts!,successes,failures,streak,lastAt:v.lastAt!,lastCorrectAt,dueAt:v.dueAt!,latestCorrect:Boolean(v.latestCorrect),history};
 }
 return out;
}
export const REVIEW_STORAGE_KEY='cyberlab-cert-review-v1';
export function loadReview():ReviewMap {try{return safeReview(JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)||'{}'));}catch{return {};}}
export function saveReview(value:ReviewMap):void {try{localStorage.setItem(REVIEW_STORAGE_KEY,JSON.stringify(value));}catch{/* Storage may be unavailable. */}}
