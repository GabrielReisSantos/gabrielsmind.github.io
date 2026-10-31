/** Independent, blueprint-weighted practice selection. Not an official exam generator. */
import {TRACKS,questionsFor,type Question,type Track} from './blueprints';

export const PRACTICE_QUESTION_COUNT=30;
export const PRACTICE_DURATION_SECONDS=45*60;

function shuffle<T>(values:T[],rng:()=>number):T[]{
 const copy=[...values];
 for(let i=copy.length-1;i>0;i--){const raw=rng();const n=Number.isFinite(raw)?Math.max(0,Math.min(0.999999999999,raw)):0;const j=Math.floor(n*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
 return copy;
}

export function makePracticeExam(trackId:Track['id'],rng:()=>number=Math.random,count=PRACTICE_QUESTION_COUNT):Question[]{
 const track=TRACKS.find(t=>t.id===trackId);
 if(!track)throw new Error(`Unknown certification: ${trackId}`);
 const all=questionsFor(trackId);
 const target=Math.max(0,Math.min(Math.floor(count),all.length));
 if(target===0)return [];
 const weightSum=track.domains.reduce((sum,d)=>sum+d.weight,0);
 const allocations=track.domains.map((d)=>{
  const exact=target*d.weight/weightSum;
  return {id:d.id,count:Math.min(Math.floor(exact),questionsFor(trackId,d.id).length),fraction:exact-Math.floor(exact)};
 });
 let unassigned=target-allocations.reduce((sum,d)=>sum+d.count,0);
 // Largest-remainder allocation, subject to the available question bank in each domain.
 while(unassigned>0){
  const eligible=allocations.filter(d=>d.count<questionsFor(trackId,d.id).length)
    .sort((a,b)=>b.fraction-a.fraction||a.count-b.count);
  if(!eligible.length)break;
  eligible[0].count++;
  eligible[0].fraction=0;
  unassigned--;
 }
 const selected=allocations.flatMap(d=>shuffle(questionsFor(trackId,d.id),rng).slice(0,d.count));
 return shuffle(selected,rng);
}
