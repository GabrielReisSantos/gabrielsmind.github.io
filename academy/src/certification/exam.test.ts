import {describe,it,expect} from 'vitest';
import {TRACKS,QUESTIONS,questionsFor} from './blueprints';
import {makePracticeExam,PRACTICE_QUESTION_COUNT,PRACTICE_DURATION_SECONDS} from './exam';

describe('expanded certification Academy',()=>{
 it('has 36 independent questions per certification and at least 30 per pathway',()=>{
  expect(QUESTIONS).toHaveLength(108);
  for(const track of TRACKS)expect(questionsFor(track.id),track.id).toHaveLength(36);
 });
 it('assigns all practice questions to declared objectives and nonempty explanations',()=>{
  const ids=QUESTIONS.map(q=>q.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(new Set(QUESTIONS.map(q=>q.stem.toLowerCase())).size).toBe(QUESTIONS.length);
  for(const q of QUESTIONS){
   const domain=TRACKS.find(t=>t.id===q.track)?.domains.find(d=>d.id===q.domain);
   expect(domain,q.id).toBeDefined();
   expect(q.options,q.id).toHaveLength(4);
   expect(new Set(q.options).size,q.id).toBe(4);
   expect(q.correct,q.id).toBeGreaterThanOrEqual(0);
   expect(q.correct,q.id).toBeLessThan(4);
   expect(q.why.length,q.id).toBeGreaterThanOrEqual(60);
   expect(q.study.length,q.id).toBeGreaterThan(0);
  }
 });
 it('creates a randomized 30-question assessment with all domains covered',()=>{
  for(const track of TRACKS){
   const picked=makePracticeExam(track.id,()=>0.377);
   expect(picked).toHaveLength(PRACTICE_QUESTION_COUNT);
   expect(new Set(picked.map(q=>q.id)).size).toBe(picked.length);
   for(const domain of track.domains){
    const count=picked.filter(q=>q.domain===domain.id).length;
    expect(count,`${track.id} ${domain.id}`).toBeGreaterThan(0);
    expect(Math.abs(count/PRACTICE_QUESTION_COUNT-domain.weight/100),`${domain.id} weighting`).toBeLessThanOrEqual(0.05);
   }
  }
 });
 it('selects different original questions with different RNG streams',()=>{
  for(const track of TRACKS){
   const first=makePracticeExam(track.id,()=>0.01).map(q=>q.id);
   const second=makePracticeExam(track.id,()=>0.91).map(q=>q.id);
   expect(first).not.toEqual(second);
  }
 });
 it('uses a 45 minute practice clock',()=>expect(PRACTICE_DURATION_SECONDS).toBe(2700));
});
