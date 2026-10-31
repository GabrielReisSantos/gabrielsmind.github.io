import {describe,it,expect} from 'vitest';
import {changeEnterprise,initialEnterprise} from '../enterprise/engine';
import {initialNative,updateNative} from '../enterprise/nativeEngine';
import {assess,assessmentCurrent,collectEvidence,initialExplorer,inspectSystems,restoreExplorer,runProbe,GUEST_HTTPS} from './engine';

describe('v2.9 Systems Explorer — deterministic, layered enterprise simulation',()=>{
 it('starts with available business traffic, a real excessive ACL and blocked guest path',()=>{
  const s=inspectSystems(initialEnterprise(),initialNative(),initialExplorer());
  expect(s.helpdeskReset).toBe(true);expect(s.business).toBe(true);
  expect(s.guestTopologyOpen).toBe(false);expect(s.guestFirewallOpen).toBe(false);
 });
 it('requires pinned incident evidence and retest at the current configuration revision',()=>{
  let e=initialEnterprise(),n=initialNative(),s=initialExplorer();
  s=runProbe(s,inspectSystems(e,n,s),'identity');s=collectEvidence(s,s.timeline.at(-1)!.id);
  e=changeEnterprise(e,'helpdeskReset',false,'Enterprise Console');
  const safe=inspectSystems(e,n,s);
  s=assess(s,safe);expect(s.assessment?.passed).toBe(false);
  s=runProbe(s,safe,'identity');s=runProbe(s,safe,'business');s=runProbe(s,safe,'guest');
  s=assess(s,safe);expect(s.assessment?.passed).toBe(true);
  n=updateNative(n,{firewall:{...n.firewall,security:n.firewall.security.map(r=>r.id==='enterprise-allow-https'?{...r,action:'deny'}:r)}});
  expect(assessmentCurrent(s,inspectSystems(e,n,s))).toBe(null);
 });
 it('recognizes defense in depth: one guest layer open is not end-to-end reachability',()=>{
  const e=initialEnterprise(),original=initialNative(),s=initialExplorer();
  const t={...original.topology,rules:original.topology.rules.map(r=>r.id==='native-guest-deny'?{...r,action:'allow' as const}:r)};
  const partiallyOpen=updateNative(original,{topology:t});
  const partial=inspectSystems(e,partiallyOpen,s);
  expect(partial.guestTopologyOpen).toBe(true);expect(partial.guestFirewallOpen).toBe(false);expect(partial.guestExposed).toBe(false);
  const rule={id:'explorer-guest-https',name:'Guest HTTPS exception',from:'untrust' as const,to:'dmz' as const,destination:GUEST_HTTPS.dst,app:'ssl' as const,service:'application-default' as const,action:'allow' as const,enabled:true,profile:false};
  const both=updateNative(partiallyOpen,{firewall:{...partiallyOpen.firewall,security:[rule,...partiallyOpen.firewall.security]}});
  expect(inspectSystems(e,both,s).guestExposed).toBe(true);
 });
 it('bounds and validates persistence and never trusts a fabricated evidence ID',()=>{
  let s=runProbe(initialExplorer(),inspectSystems(initialEnterprise(),initialNative(),initialExplorer()),'identity');
  expect(restoreExplorer({...s,pinned:['EV-9999']})).toEqual(initialExplorer());
  s=collectEvidence(s,s.timeline[0].id);
  expect(restoreExplorer(JSON.parse(JSON.stringify(s))).pinned).toEqual(s.pinned);
 });
});
