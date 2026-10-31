import {describe,it,expect} from 'vitest';
import {QUESTIONS} from './blueprints';
import {updateReview,dueQuestions,domainStats,safeReview} from './review';
const DAY=86400000,BASE=1793360000000,q=QUESTIONS[0];
describe('delayed recall',()=>{
 it('does not reward repetition of an already visible answer on the same day',()=>{
  let r=updateReview({},q,q.correct,BASE);
  expect(r[q.id].streak).toBe(1);
  expect(r[q.id].dueAt).toBe(BASE+DAY);
  r=updateReview(r,q,q.correct,BASE+1000);
  expect(r[q.id].streak).toBe(1);
  r=updateReview(r,q,q.correct,BASE+DAY+2000);
  expect(r[q.id].streak).toBe(2);
  expect(r[q.id].dueAt).toBe(BASE+DAY+2000+3*DAY);
 });
 it('includes wrong answers in the due queue only when scheduled',()=>{
  const r=updateReview({},q,(q.correct+1)%4,BASE);
  expect(dueQuestions(q.track,r,BASE)).toHaveLength(0);
  expect(dueQuestions(q.track,r,BASE+300000)[0].id).toBe(q.id);
  expect(domainStats(q.track,q.domain,r).practiced).toBe(1);
 });
 it('drops unknown IDs on import',()=>{
  const r=updateReview({},q,q.correct,BASE);
  expect(safeReview({...r,forged:{attempts:12}})[q.id].streak).toBe(1);
  expect(safeReview({...r,forged:{attempts:12}}).forged).toBeUndefined();
 });
});
