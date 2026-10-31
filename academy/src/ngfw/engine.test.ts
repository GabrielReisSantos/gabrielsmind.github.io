import {describe,expect,it} from 'vitest';
import {CASES,TRAFFIC,REPLY,evaluate,freshConfig,isResolved,scenarioConfig} from './engine';
const traffic=(id:string)=>TRAFFIC.find(x=>x.id===id)!;
describe('NGFW deterministic teaching model',()=>{
 it('allows outbound HTTPS with source NAT and an installed session',()=>{
   const r=evaluate(traffic('outbound'),freshConfig(),[]);
   expect(r.verdict).toBe('allow'); expect(r.matchedNat).toBe('Trust outbound SNAT');
   expect(r.session?.translated.src).toBe('198.51.100.5');
 });
 it('uses an existing session for repeated packets and reverse replies',()=>{
   const first=evaluate(traffic('outbound'),freshConfig(),[]);
   const second=evaluate(traffic('outbound'),freshConfig(),[first.session!]);
   const reverse=evaluate(REPLY,freshConfig(),[first.session!]);
   expect(second.sessionHit).toBe(true);expect(reverse.verdict).toBe('allow');
   expect(reverse.translated).toContain('10.10.10.15');
 });
 it('drops out-of-state return ACK',()=>expect(evaluate(REPLY,freshConfig(),[]).actionSource).toBe('state'));
 it('DNAT uses pre-NAT address and post-NAT zone in policy',()=>{
   const r=evaluate(traffic('inbound'),freshConfig(),[]);
   expect(r.verdict).toBe('allow'); expect(r.zones?.to).toBe('dmz');
   expect(r.matchedRule).toBe('Allow published HTTPS');
   expect(r.session?.translated.dst).toBe('10.20.20.10');
 });
 it('disabled DNAT does not accidentally permit traffic via intrazone-default',()=>{
   const r=evaluate(traffic('inbound'),scenarioConfig('dnat'),[]);
   expect(r.verdict).toBe('deny');
   expect(r.reason).toContain('no matching destination NAT');
 });
 it('application classification precedes application-aware policy re-evaluation',()=>{
   const r=evaluate(traffic('outbound'),freshConfig(),[]);
   const appIndex=r.steps.findIndex(s=>s.id==='appid');
   const policyIndex=r.steps.findIndex((s,i)=>i>appIndex&&s.id==='security');
   expect(appIndex).toBeGreaterThanOrEqual(0);
   expect(policyIndex).toBeGreaterThan(appIndex);
 });
 it('denies unwanted SSH and nonstandard service',()=>{
   expect(evaluate(traffic('ssh'),freshConfig(),[]).verdict).toBe('deny');
   expect(evaluate(traffic('nonstandard'),freshConfig(),[]).verdict).toBe('deny');
 });
 it('allows intrazone DNS without explicit rule',()=>expect(evaluate(traffic('dns'),freshConfig(),[]).verdict).toBe('allow'));
 it('does not inspect synthetic threat without decryption and enabled prevention',()=>{
   expect(evaluate(traffic('threat'),freshConfig(),[]).verdict).toBe('allow');
   const c=freshConfig();c.decrypt=true;c.threatPrevention=true;
   expect(evaluate(traffic('threat'),c,[]).actionSource).toBe('profile');
   c.threatPrevention=false;
   expect(evaluate(traffic('threat'),c,[]).verdict).toBe('allow');
 });
 it('each broken troubleshooting case fails until the targeted fix',()=>{
   for(const problem of CASES){
     const c=scenarioConfig(problem.id);
     const t=traffic(problem.traffic);
     const before=evaluate(t,c,[]);
     expect(isResolved(problem.id,c,before)).toBe(false);
     const fixed=freshConfig();if(problem.id==='profile'){fixed.decrypt=true;}
     const after=evaluate(t,fixed,[]);
     expect(isResolved(problem.id,fixed,after)).toBe(true);
   }
 });
});
