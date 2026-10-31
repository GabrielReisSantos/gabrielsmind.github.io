import {describe,expect,it} from 'vitest';
import {NETWORK_QUESTIONS} from '../foundations/knowledge';
import {QUESTIONS} from '../certification/blueprints';
import {readLearningProgress,readSavedLocation} from './progress';
import {CASES,createState,execute,savePayload,STORAGE_KEY} from '../secrets/engine';
const source=(data:Record<string,string>)=>({getItem:(k:string)=>data[k]??null});
describe('honest learner metrics and resume',()=>{
 it('counts correct answers separately from attempted',()=>{
  const result=readLearningProgress(source({
   'cyberlab-ccna-answers-v4':JSON.stringify({[NETWORK_QUESTIONS[0].id]:NETWORK_QUESTIONS[0].correct,[NETWORK_QUESTIONS[1].id]:-1}),
   'cyberlab-cert-answers-v3':JSON.stringify({[QUESTIONS[0].id]:{choice:QUESTIONS[0].correct,correct:true},[QUESTIONS[1].id]:{choice:-1,correct:false}}),
  }));
  expect(result.ccnaReviewed).toBe(2);expect(result.ccnaCorrect).toBe(1);
  expect(result.certAttempted).toBe(2);expect(result.certCorrect).toBe(1);
  const revised=readLearningProgress(source({'cyberlab-cert-review-v1':JSON.stringify({[QUESTIONS[0].id]:{latestCorrect:false},[QUESTIONS[2].id]:{latestCorrect:true}}),'cyberlab-cert-answers-v3':JSON.stringify({[QUESTIONS[0].id]:{choice:QUESTIONS[0].correct,correct:true}})}));
  expect(revised.certAttempted).toBe(2);expect(revised.certCorrect).toBe(1);
 });
 it('does not treat partial checklists as completed units',()=>{
  const r=readLearningProgress(source({'cyberlab-oscp-v4-progress':JSON.stringify({checks:{'report-writing-for-penetration-testers-1':[0]}})}));
  expect(r.oscpReviewed).toBe(0);
 });
 it('counts only replay-validated Secrets Storage Atlas investigations',()=>{
  const c=CASES[0];let s=createState();for(const cmd of [c.command,`classify ${c.risk}`,`fix ${c.repair}`,'retest'])s=execute(s,c.id,cmd).state;
  expect(readLearningProgress(source({[STORAGE_KEY]:JSON.stringify(savePayload(s))})).secretsValidated).toBe(1);
  expect(readLearningProgress(source({[STORAGE_KEY]:JSON.stringify({version:1,selected:c.id,mode:'guided',commands:{},completed:CASES.map(x=>x.id)})})).secretsValidated).toBe(0);
 });
 it('rejects invalid resume records',()=>{
  expect(readSavedLocation(source({'cyberlab-v11-last-activity':JSON.stringify({page:'admin',at:100})}))).toBeNull();
  expect(readSavedLocation(source({'cyberlab-v11-last-activity':JSON.stringify({page:'world',at:100,detail:'campus'})}))).toEqual({page:'world',at:100,detail:'campus'});
 });
 it('survives corrupt storage and keeps modes separate',()=>{
  const r=readLearningProgress(source({'cyberlab-v8-solved-beginner':'["campus"]','cyberlab-v8-solved-advanced':'["segments"]','cyberlab-ccna-answers-v4':'corrupt'}),'advanced');
  expect(r.topologyValidated).toBe(1);expect(r.ccnaCorrect).toBe(0);
 });
});
