/** Mission Room: read-only projections of the existing unified range state.
 * All outcomes are computed from unified/engine and authoritative native forwarding,
 * never from click count, presentation flags or hand-authored activity logs. */
import {evaluateRule,gradeRange,type RangeState} from '../unified/engine';

export type MissionPhase='inspect'|'reproduce'|'evidence'|'detection'|'contain'|'retest';
export const PHASES=[
 {id:'inspect',title:'Inspect',sub:'Map permissions and traffic',hint:'Run “ad acl svc-reports” and “network trace app01” to identify what the Helpdesk account can do and which path can reach the app.'},
 {id:'reproduce',title:'Reproduce',sub:'Observe the abuse path',hint:'Run “simulate normal”, then “attack reset svc-reports” and “attack login app01”. Look for reset event 4724 and privileged logon 4624.'},
 {id:'evidence',title:'Investigate',sub:'Pin decisive evidence',hint:'In the telemetry feed, pin the attack-origin account reset (4724) and suspicious service account logon (4624). Compare them with the legitimate baseline.'},
 {id:'detection',title:'Detect',sub:'Separate attack from normal',hint:'Write a rule combining event_id and actor or target. It must match the suspicious behavior without matching the legitimate baseline.'},
 {id:'contain',title:'Remediate',sub:'Fix identity and preserve service',hint:'Remove the delegated reset permission, rotate the credential, update the legitimate service, revoke hostile sessions and keep guest isolation and approved traffic.'},
 {id:'retest',title:'Verify',sub:'Prove the repair',hint:'Run “verify attack”, “verify service” and “verify monitoring” after your final changes. Any later configuration change invalidates verification.'},
] as const satisfies ReadonlyArray<{id:MissionPhase;title:string;sub:string;hint:string}>;
export type SystemHealth={id:string;label:string;description:string;ok:boolean;severity:'critical'|'warning'|'ok'};
export function missionProgress(s:RangeState){
 const rule=evaluateRule(s),baseGrade=gradeRange(s);
 const commands=new Set(s.commands.filter(c=>c.success).map(c=>c.command));
 const resetEvidence=s.events.some(e=>s.pinned.includes(e.id)&&e.kind==='attack'&&e.eventId==='4724');
 const loginEvidence=s.events.some(e=>s.pinned.includes(e.id)&&e.kind==='attack'&&e.eventId==='4624');
 const stages:Record<MissionPhase,boolean>={
  inspect:commands.has('ad acl svc-reports')&&commands.has('network trace app01'),
  reproduce:s.baselineRun&&s.events.some(e=>e.kind==='attack'&&e.eventId==='4724')&&s.events.some(e=>e.kind==='attack'&&e.eventId==='4624'),
  evidence:resetEvidence&&loginEvidence,
  detection:rule.valid&&rule.truePositives.length>0&&rule.falsePositives.length===0,
  contain:!s.aclReset&&s.credentialVersion>1&&s.appCredentialVersion===s.credentialVersion&&s.stolenVersion!==s.credentialVersion&&!s.sessionActive&&s.networkAllowed&&s.guestIsolated,
  retest:baseGrade.complete&&s.networkAllowed,
 };
 const completed=PHASES.filter(p=>stages[p.id]).length;
 const firstUnfinished=PHASES.find(p=>!stages[p.id])?.id??'retest';
 return {stages,completed,total:PHASES.length,firstUnfinished,rule,grade:baseGrade,complete:completed===PHASES.length};
}
export function systemHealth(s:RangeState):SystemHealth[]{
 return [
 {id:'identity',label:'Directory access',description:s.aclReset?'Helpdesk can reset privileged service account':'Unnecessary reset delegation removed',ok:!s.aclReset,severity:s.aclReset?'critical':'ok'},
 {id:'transport',label:'Network path',description:s.networkAllowed?'WS01 → APP01 allowed on HTTPS':`Blocked at ${s.networkStage}`,ok:s.networkAllowed,severity:s.networkAllowed?'ok':'warning'},
 {id:'credentials',label:'Service credential',description:s.appCredentialVersion!==s.credentialVersion?'Scheduler uses stale credentials':`Directory and scheduler aligned (v${s.credentialVersion})`,ok:s.appCredentialVersion===s.credentialVersion,severity:s.appCredentialVersion===s.credentialVersion?'ok':'warning'},
 {id:'session',label:'Untrusted session',description:s.sessionActive?'Attacker still has an active session':'No hostile session active',ok:!s.sessionActive,severity:s.sessionActive?'critical':'ok'},
 {id:'monitoring',label:'Audit visibility',description:Object.values(s.audits).every(Boolean)?'All three sources enabled':'At least one telemetry source is disabled',ok:Object.values(s.audits).every(Boolean),severity:Object.values(s.audits).every(Boolean)?'ok':'warning'},
 {id:'guest',label:'Guest isolation',description:s.guestIsolated?'Guest cannot reach reporting service':'Guest network can reach reporting service',ok:s.guestIsolated,severity:s.guestIsolated?'ok':'critical'},
 ];
}
