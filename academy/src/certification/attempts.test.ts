import {describe,it,expect} from 'vitest';
import {makePracticeExam} from './exam';
import {createAttempt,completeAttempt,setExamAnswer,toggleExamFlag,remainingSeconds,safeAttempt,toResult,safeHistory,questionsForAttempt,BANK_VERSION} from './attempts';
const BASE=1793360000000;
describe('persisted certification exam attempts',()=>{
 it('preserves a deadline, flag and answer on restore',()=>{
  let attempt=createAttempt('ngfw',makePracticeExam('ngfw',()=>0.44),BASE);
  const id=attempt.questionIds[0];
  attempt=toggleExamFlag(setExamAnswer(attempt,id,2,BASE),id);
  expect(attempt.version).toBe(BANK_VERSION);
  expect(remainingSeconds(attempt,BASE+60000)).toBe(2640);
  const restored=safeAttempt(JSON.parse(JSON.stringify(attempt)),'ngfw',BASE+60000)!;
  expect(restored.answers[id]).toBe(2);
  expect(restored.flags).toEqual([id]);
  expect(setExamAnswer(restored,id,1,restored.deadlineAt)).toEqual(restored);
 });
 it('expires when a tab is reopened after the deadline',()=>{
  const a=createAttempt('netsec',makePracticeExam('netsec',()=>0.39),BASE);
  expect(safeAttempt(JSON.parse(JSON.stringify(a)),'netsec',a.deadlineAt+1000)?.status).toBe('expired');
 });
 it('rejects forged bank versions and broken question IDs',()=>{
  const a=createAttempt('cloud',makePracticeExam('cloud',()=>0.33),BASE);
  expect(safeAttempt({...a,version:'other'},'cloud',BASE)).toBeNull();
  expect(safeAttempt({...a,questionIds:['invalid',...a.questionIds.slice(1)]},'cloud',BASE)).toBeNull();
  expect(safeAttempt({...a,deadlineAt:a.deadlineAt+10000},'cloud',BASE)).toBeNull();
 });
 it('grades official-domain weights from answers, not a saved score',()=>{
  let a=createAttempt('cloud',makePracticeExam('cloud',()=>0.31),BASE);
  for(const q of questionsForAttempt(a))a=setExamAnswer(a,q.id,q.correct,BASE+1);
  const result=toResult(completeAttempt(a,BASE+1000));
  expect(result.score).toBe(100);
  expect(result.answered).toBe(30);
  expect(safeHistory([{...result,score:0}])[0].score).toBe(100);
 });
});
