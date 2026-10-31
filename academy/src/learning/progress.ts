/** Public, browser-only learning records. Counts deliberately distinguish activity from success. */
import {CODING_LESSONS} from '../foundations/coding/lessons';
import {CRYPTO_LESSONS} from '../foundations/crypto/lessons';
import {ADVANCED_DRILLS} from '../foundations/pkiadvanced/lessons';
import {NETWORK_QUESTIONS} from '../foundations/knowledge';
import {QUESTIONS} from '../certification/blueprints';
import {ALL_UNITS} from '../pentest/blueprint';
import {SCENARIOS,restorePracticeState,reportChecklist} from '../pentest/practice/scenarioEngine';
import {restore as restoreV14,grade as gradeV14,CASE_ID as V14_CASE} from '../investigation2/engine';
import {restore as restoreSecrets,completedCount as countSecrets,STORAGE_KEY as SECRETS_KEY} from '../secrets/engine';
export const DESTINATIONS=['foundation','ngfw','troubleshoot','studio','certification','pentest','missions','webplay','adlab','purple','unified','correlation','world','incident','practice','investigation2','passwords','secrets','missionroom','explorer','campaign'] as const;
export type DestinationId = typeof DESTINATIONS[number];
export type SavedLocation={page:DestinationId;detail?:string;at:number};
export type StorageReader=Pick<Storage,'getItem'>;
const ACTIVITY='cyberlab-v11-last-activity';
const safeParse=(reader:StorageReader,key:string):unknown=>{try{return JSON.parse(reader.getItem(key)??'null') as unknown;}catch{return null;}};
const record=(value:unknown):Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
const strings=(value:unknown):string[]=>Array.isArray(value)?[...new Set(value.filter((item):item is string=>typeof item==='string'))]:[];
export type LearningProgress={
 ccnaDrills:number;ccnaReviewed:number;ccnaCorrect:number;ccnaTotal:number;
 codingPracticed:number;codingPythonExecuted:number;codingReference:number;cryptoPracticed:number;cryptoIndependent:number;pkiAdvancedIndependent:number;
 oscpReviewed:number;oscpTotal:number;oscpValidated:number;
 certAttempted:number;certCorrect:number;certTotal:number;
 topologyValidated:number;ngfwValidated:number;troubleshootValidated:number;passwordAuditValidated:number;secretsValidated:number;
 webValidated:number;adValidated:number;incidentValidated:number;practiceValidated:number;investigation2Validated:number;
};
export function readLearningProgress(reader:StorageReader,mode='beginner'):LearningProgress{
 const suffix=mode==='beginner'?'':'-'+mode;
 const codePractice=safeParse(reader,'cyberlab-coding-v15-progress');
 const codingRecords=Array.isArray(codePractice)?codePractice.filter((v):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)):[];
 const codingLessons=CODING_LESSONS.filter(l=>codingRecords.some(r=>r.id===l.id));
 const ccna=record(safeParse(reader,'cyberlab-ccna-answers-v4'));
 const cert=record(safeParse(reader,'cyberlab-cert-answers-v3'));
 const certReview=record(safeParse(reader,'cyberlab-cert-review-v1'));
 const oscp=record(safeParse(reader,'cyberlab-oscp-v4-progress'));
 const checks=record(oscp.checks);
 const ccnaAttempted=NETWORK_QUESTIONS.filter(q=>Number.isInteger(ccna[q.id]));
 const certAttempted=QUESTIONS.filter(q=>cert[q.id]!==undefined||certReview[q.id]!==undefined);
 const ccnaCorrect=ccnaAttempted.filter(q=>ccna[q.id]===q.correct).length;
 const certCorrect=certAttempted.filter(q=>{
  const r=record(certReview[q.id]);if(typeof r.latestCorrect==='boolean')return r.latestCorrect;
  const a=record(cert[q.id]);return a.choice===q.correct && a.correct===true;
 }).length;
 const reviewed=ALL_UNITS.filter(u=>{
  const arr=checks[u.id];return Array.isArray(arr)&&arr.length===u.objectives.length&&u.objectives.every((_,i)=>arr.includes(i));
 }).length;
 return {
  ccnaDrills:strings(safeParse(reader,'cyberlab-ccna-drills-v4')).length,
  codingPracticed:codingLessons.length,
  cryptoPracticed:CRYPTO_LESSONS.filter(l=>{const rows=safeParse(reader,'cyberlab-crypto-v16-completed');return Array.isArray(rows)&&rows.some(r=>r&&typeof r==='object'&&(r as {id?:unknown}).id===l.id);}).length,
  cryptoIndependent:CRYPTO_LESSONS.filter(l=>{const rows=safeParse(reader,'cyberlab-crypto-v16-completed');return Array.isArray(rows)&&rows.some(r=>r&&typeof r==='object'&&(r as {id?:unknown}).id===l.id&&(r as {mode?:unknown}).mode==='independent');}).length,
  pkiAdvancedIndependent:ADVANCED_DRILLS.filter(l=>{const rows=safeParse(reader,'cyberlab-pki-v17-practice');return Array.isArray(rows)&&rows.some(r=>r&&typeof r==='object'&&(r as {id?:unknown}).id===l.id&&Number((r as {independent?:unknown}).independent)>0);}).length,
  codingPythonExecuted:codingLessons.filter(l=>l.language==='python'&&codingRecords.some(r=>r.id===l.id&&r.kind==='executed')).length,
  codingReference:codingLessons.filter(l=>l.language==='csharp'&&codingRecords.some(r=>r.id===l.id&&r.kind==='reference')).length,
  ccnaReviewed:ccnaAttempted.length,ccnaCorrect,ccnaTotal:NETWORK_QUESTIONS.length,
  oscpReviewed:reviewed,oscpTotal:ALL_UNITS.length,oscpValidated:strings(oscp.solved).length,
  certAttempted:certAttempted.length,certCorrect,certTotal:QUESTIONS.length,
  passwordAuditValidated:(()=>{const raw=record(safeParse(reader,'cyberlab-password-audit-v26'));const commands=raw.commands;const must=['cat scope.txt','cat hashes.txt','cat provenance.txt','hashcat -m 1400 --example-hashes','hashcat -b -m 1400','keyspace ?l?l?d?d','hashcat -m 1400 -a 0 hashes.txt shortlist.txt','hashcat -m 1400 -a 0 hashes.txt shortlist.txt -r rules/append-bang.rule','hashcat -m 1400 -a 3 hashes.txt -1 sun ?1?1?1?d?d','john --format=raw-sha256 --wordlist=shortlist.txt hashes.txt','policy inspect','policy set kdf argon2id','policy rotate all','policy test'];return Array.isArray(commands)&&must.every((c,i)=>commands[i]===c)&&typeof raw.notes==='string'&&raw.notes.trim().length>=100?1:0;})(),
  secretsValidated:countSecrets(restoreSecrets(safeParse(reader,SECRETS_KEY))),
  topologyValidated:strings(safeParse(reader,'cyberlab-v8-solved-'+mode)).length,
  ngfwValidated:strings(safeParse(reader,'cyberlab-ngfw-solved-v2')).length,
  troubleshootValidated:strings(safeParse(reader,'cyberlab-troubleshoot-v5'+suffix)).length,
  webValidated:strings(safeParse(reader,'cyberlab-v06-http-solved'+suffix)).length,
  adValidated:strings(safeParse(reader,'cyberlab-v06-ad-solved'+suffix)).length,
  incidentValidated:strings(safeParse(reader,'cyberlab-v12-incident-solved-'+mode)).length,
  practiceValidated:SCENARIOS.filter(s=>reportChecklist(s,restorePracticeState(s,safeParse(reader,`cyberlab-v13-practice-${mode}-${s.id}`))).complete).length,
  investigation2Validated:Number(gradeV14(restoreV14(safeParse(reader,`cyberlab-v14-${V14_CASE}-${mode}`))).pass),
 };
}
export function readSavedLocation(reader:StorageReader):SavedLocation|null{
 const parsed=record(safeParse(reader,ACTIVITY));
 if(!DESTINATIONS.includes(parsed.page as DestinationId))return null;
 if(typeof parsed.at!=='number'||!Number.isFinite(parsed.at)||parsed.at<=0)return null;
 return {page:parsed.page as DestinationId,at:parsed.at,detail:typeof parsed.detail==='string'?parsed.detail.slice(0,120):undefined};
}
export function storeLocation(page:DestinationId,detail?:string){
 try{
  const value:SavedLocation={page,at:Date.now()};
  const prior=localStorage.getItem('cyberlab-v11-detail-'+page);
  if(detail){value.detail=detail;localStorage.setItem('cyberlab-v11-detail-'+page,detail);}
  else if(prior)value.detail=prior.slice(0,120);
  localStorage.setItem(ACTIVITY,JSON.stringify(value));
  window.dispatchEvent(new Event('cyberlab:progress'));
 }catch{/* storage blocked */}
}
export function savedDetail(page:DestinationId):string|undefined{try{const detail=localStorage.getItem('cyberlab-v11-detail-'+page);if(detail)return detail;const last=readSavedLocation(localStorage);return last?.page===page?last.detail:undefined;}catch{return undefined;}}
export const EXERCISE_TOTALS={ccnaDrills:4,troubleshoot:8,world:4,web:5,ad:3} as const;
