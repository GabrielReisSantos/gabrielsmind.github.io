import {describe,it,expect} from 'vitest';
import {initialState,executeCommand,pinEvent,setRule,setDiagnosis,setExplanation,serializeRange,restoreRange,applyEnterpriseConfig} from '../unified/engine';
import {missionProgress,systemHealth} from './missionLogic';
const run=(commands:string[])=>commands.reduce(executeCommand,initialState());
const evidence=(s:ReturnType<typeof initialState>)=>s.events.filter(e=>e.kind==='attack'&&(e.eventId==='4724'||e.eventId==='4624')).reduce((v,e)=>pinEvent(v,e.id),s);
describe('Mission Room uses causal evidence and the unified state',()=>{
 it('never completes from click counts or normal activity alone',()=>{const s=run(['ad acl svc-reports','network trace app01','simulate normal']);const p=missionProgress(s);expect(p.stages.inspect).toBe(true);expect(p.stages.reproduce).toBe(false);expect(p.complete).toBe(false);});
 it('requires identity abuse, pinned evidence and precise detection',()=>{let s=run(['ad acl svc-reports','network trace app01','simulate normal','attack reset svc-reports','attack login app01']);expect(missionProgress(s).stages.reproduce).toBe(true);expect(missionProgress(s).stages.evidence).toBe(false);s=evidence(s);s=setRule(s,'event_id=4724 actor=lina.helpdesk target=svc-reports');expect(missionProgress(s).stages.evidence).toBe(true);expect(missionProgress(s).stages.detection).toBe(true);});
 it('bad fixes have business and telemetry consequences',()=>{const s=run(['attack reset svc-reports','attack login app01','fix rotate-credential','audit logon off']);const h=systemHealth(s);expect(h.find(x=>x.id==='credentials')?.ok).toBe(false);expect(h.find(x=>x.id==='monitoring')?.ok).toBe(false);expect(h.find(x=>x.id==='session')?.ok).toBe(false);});
 it('cannot mark contained after blanket firewall block even if upstream grade passes',()=>{let s=run(['simulate normal','attack reset svc-reports','attack login app01','fix remove-reset-acl','fix rotate-credential','fix sync-application','fix revoke-sessions']);s=applyEnterpriseConfig(s,{helpdeskReset:false,wsToApp443:false});expect(missionProgress(s).stages.contain).toBe(false);});
 it('can finish only with validated current revision and preserved legitimate access',()=>{
  let s=run(['ad acl svc-reports','network trace app01','simulate normal','attack reset svc-reports','attack login app01']);
  s=evidence(s);s=setRule(s,'event_id=4724 actor=lina.helpdesk target=svc-reports');s=setDiagnosis(s,'excessive-reset-rights');s=setExplanation(s,'Helpdesk has unnecessary reset delegation that lets a non-admin compromise the reports service account and enter APP01.');
  for(const c of ['fix remove-reset-acl','fix rotate-credential','fix sync-application','fix revoke-sessions','verify attack','verify service','verify monitoring'])s=executeCommand(s,c);
  expect(missionProgress(s).complete).toBe(true);
  const replay=restoreRange(serializeRange(s));expect(missionProgress(replay).complete).toBe(true);
  const changed=applyEnterpriseConfig(s,{helpdeskReset:false,wsToApp443:false});expect(missionProgress(changed).complete).toBe(false);
 });
});
