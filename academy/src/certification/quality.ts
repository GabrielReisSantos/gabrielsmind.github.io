import {QUESTIONS,TRACKS,type Question} from './blueprints';
/** Validate objective references against the supplied datasheet's numbered hierarchy. */
export function objectiveNumbers(question:Question):string[]{return [...question.study.matchAll(/\b\d+\.\d+(?:\.\d+)?\b/g)].map(m=>m[0]);}
export function auditQuestions():string[]{
 const errors:string[]=[];
 for(const q of QUESTIONS){
  const domain=TRACKS.find(t=>t.id===q.track)?.domains.find(d=>d.id===q.domain);
  if(!domain){errors.push(`${q.id}: unknown domain`);continue;}
  const prefix=q.domain.split('-')[1]+'.';const numbers=objectiveNumbers(q);
  if(!numbers.length)errors.push(`${q.id}: missing objective number`);
  if(numbers.some(n=>!n.startsWith(prefix)))errors.push(`${q.id}: references an objective in another domain`);
  if(numbers.some(n=>!domain.objectives.some(text=>{const head=text.match(/^\d+\.\d+(?:\.\d+)?/ )?.[0];return head&&(n===head||n.startsWith(head+'.'));})))errors.push(`${q.id}: objective is absent from supplied blueprint`);
 }
 return errors;
}
/** Hand-reviewed explanations for plausible but wrong choices. Other questions remain marked for editorial review. */
export const DISTRACTOR_NOTES:Record<string,Partial<Record<number,string>>>= {
 'FW-05':{0:'The provided symptom is missing central logs; replacing certificates first has no supporting evidence.',2:'Disabling local logs removes evidence without repairing forwarding.',3:'Changing all default routes is unnecessarily disruptive; check the configured log destination and network path first.'},
 'FW-01':{0:'NAT changes destination addressing, not the way the security policy destination is automatically rewritten.',2:'The browser trust store is unrelated to forwarding to a translated internal address.',3:'The CLI prompt does not affect route resolution.'},
 'FW-03':{0:'HA path monitoring checks reachability, not whether each security policy is correct.',2:'GRE and IPSec remain distinct encapsulation/tunnel mechanisms.',3:'Routing and forwarding are not bypassed when path monitoring is configured.'},
 'FW-06':{1:'An intrazone allow policy does not establish appropriate forward-trust certificate handling.',2:'DNS reachability does not replace the client trust requirements of a TLS inspection proxy.',3:'Disabling user authentication is neither required nor a safe decryption design.'},
 'NS-02':{0:'Certificate checks are not a replacement for URL or security policy enforcement.',2:'Decryption creates inspection visibility; it does not guarantee detection.',3:'The management certificate is not the universal certificate used to authenticate external websites.'},
 'NS-08':{0:'A successful commit confirms configuration acceptance, not the intended traffic outcome.',1:'Testing one allowed flow misses regression risks to other security boundaries.',3:'Rule count can remain unchanged even if the wrong rules are modified.'},
 'CL-05':{0:'A publicly readable bucket is a posture exposure; compromise is not established without evidence of exploitation.',2:'Exposure alone does not demonstrate malware.',3:'A DNS query is not what makes this storage configuration publicly readable.'},
 'CL-08':{1:'IaC linting runs before deployment and does not establish what a live workload is doing.',2:'Inventory identifies assets, not active suspicious behavior.',3:'Periodic scans can expose weaknesses but cannot substitute for runtime event telemetry.'}
};
