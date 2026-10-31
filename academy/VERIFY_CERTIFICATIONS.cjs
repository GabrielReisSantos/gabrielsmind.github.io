/** Runs against CommonJS output compiled from src/certification pure TS source. */
const assert=require('node:assert/strict');
const path=require('node:path');
const dir=process.argv[2]||'.certification-verify';
const {TRACKS,QUESTIONS,questionsFor}=require(path.resolve(dir,'blueprints.js'));
const {makePracticeExam,PRACTICE_QUESTION_COUNT,PRACTICE_DURATION_SECONDS}=require(path.resolve(dir,'exam.js'));
let assertions=0;
function check(test,message){assert.ok(test,message);assertions++;}
check(QUESTIONS.length===108,'Expected 108 original questions');
check(new Set(QUESTIONS.map(q=>q.id)).size===QUESTIONS.length,'Question IDs must be unique');
check(new Set(QUESTIONS.map(q=>q.stem.toLowerCase())).size===QUESTIONS.length,'Duplicate question stems');
check(PRACTICE_QUESTION_COUNT===30,'Practice exam should contain 30 questions');
check(PRACTICE_DURATION_SECONDS===45*60,'Practice exam duration should be 45 minutes');
for(const track of TRACKS){
 const pool=questionsFor(track.id);
 check(pool.length===36,`${track.id}: 36 bank questions`);
 check(track.domains.reduce((s,d)=>s+d.weight,0)===100,`${track.id}: blueprint weight total`);
 for(const d of track.domains)check(questionsFor(track.id,d.id).length>0,`${track.id}/${d.id}: nonempty`);
 for(let trial=0;trial<40;trial++){
  let n=0;
  const selected=makePracticeExam(track.id,()=>((++n*.61803398875+trial*.117)%1));
  check(selected.length===30,`${track.id}: exam size`);
  check(new Set(selected.map(q=>q.id)).size===30,`${track.id}: exam ID uniqueness`);
  for(const d of track.domains){
   const m=selected.filter(q=>q.domain===d.id).length;
   check(m>=1,`${track.id}/${d.id}: represented`);
   check(Math.abs(m/30-d.weight/100)<=.05,`${track.id}/${d.id}: proportional weighting`);
  }
 }
}
for(const q of QUESTIONS){
 check(q.options.length===4,`${q.id}: four options`);
 check(new Set(q.options).size===4,`${q.id}: option uniqueness`);
 check(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,`${q.id}: valid answer`);
 check(q.why.length>=30,`${q.id}: explanation`);
 check(Boolean(q.study.trim()),`${q.id}: objective reference`);
 check(TRACKS.find(t=>t.id===q.track)?.domains.some(d=>d.id===q.domain),`${q.id}: valid domain`);
}
console.log(`PASS: ${assertions} certification bank and randomized exam assertions.`);
for(const t of TRACKS)console.log(`${t.short}: ${questionsFor(t.id).length} questions; ${t.domains.length} domains.`);
