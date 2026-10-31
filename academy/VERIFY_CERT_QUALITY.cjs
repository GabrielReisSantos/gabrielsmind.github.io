/** Standalone certification engine QA: no React or npm packages required. */
const assert = require('node:assert/strict');
const prefix=process.argv[2]||'./.certification-verify';
const {QUESTIONS,TRACKS,questionsFor}=require(`${prefix}/blueprints.js`);
const {makePracticeExam}=require(`${prefix}/exam.js`);
const {auditQuestions,DISTRACTOR_NOTES}=require(`${prefix}/quality.js`);
const {createAttempt,setExamAnswer,safeAttempt,completeAttempt,toResult,remainingSeconds,safeHistory}=require(`${prefix}/attempts.js`);
const {updateReview,dueQuestions}=require(`${prefix}/review.js`);
let assertions=0;
const check=(a,b)=>{assert.deepEqual(a,b);assertions++;};
check(auditQuestions(),[]);
check(QUESTIONS.length,108);
for(const t of TRACKS){const qs=questionsFor(t.id);check(qs.length,36);check(t.domains.reduce((s,d)=>s+d.weight,0),100);const selected=makePracticeExam(t.id,()=>0.397);check(selected.length,30);check(new Set(selected.map(q=>q.id)).size,30);}
for(const q of QUESTIONS){check(q.options.length,4);check(typeof q.study,'string');check(q.why.length>=50,true);check(new Set(q.options).size,4);}
for(const [id,notes] of Object.entries(DISTRACTOR_NOTES)){const q=QUESTIONS.find(q=>q.id===id);check(Boolean(q),true);for(const k of Object.keys(notes))check(Number(k)!==q.correct,true);}
const now=1793360000000;
for(const t of TRACKS){let a=createAttempt(t.id,makePracticeExam(t.id,()=>0.45),now);check(remainingSeconds(a,now+1000),2699);check(safeAttempt(a,t.id,now)?.id,a.id);for(const id of a.questionIds){const q=QUESTIONS.find(q=>q.id===id);a=setExamAnswer(a,id,q.correct,now);}const result=toResult(completeAttempt(a,now+10));check(result.score,100);check(safeHistory([{...result,score:0}])[0].score,100);check(safeAttempt({...a,version:'broken'},t.id,now),null);check(completeAttempt({...a,answers:{}},now+2700000).status,'expired');}
let r={};const q=QUESTIONS[0];r=updateReview(r,q,q.correct,now);check(r[q.id].streak,1);r=updateReview(r,q,q.correct,now+1000);check(r[q.id].streak,1);check(dueQuestions(q.track,r,now+86400000).length,0);r=updateReview(r,q,q.correct,now+86401000);check(r[q.id].streak,2);
console.log(`Certification v1.9.3 quality gate: ${assertions} assertions passed`);
