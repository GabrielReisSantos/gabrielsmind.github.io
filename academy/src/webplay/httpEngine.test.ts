import {describe,it,expect} from 'vitest';
import {WEB_CASES,handleHttp,evaluateWebChallenge,type WebObservation} from './httpEngine';
describe('in-memory HTTP security lessons',()=>{
 for(const c of WEB_CASES){it(`${c.id}: baseline, finding, patch and evidence requirements`,()=>{
  const vulnerable=handleHttp(c.id,c.probe,false);
  const repaired=handleHttp(c.id,c.probe,true);
  const normal=handleHttp(c.id,c.normal,true);
  expect(vulnerable.finding).toBe(true);
  expect(repaired.finding).toBe(false);
  expect(normal.normal).toBe(true);
  const history:WebObservation[]=[
   {caseId:c.id,patched:false,request:c.normal,response:handleHttp(c.id,c.normal,false)},
   {caseId:c.id,patched:false,request:c.probe,response:vulnerable},
   {caseId:c.id,patched:true,request:c.normal,response:normal},
   {caseId:c.id,patched:true,request:c.probe,response:repaired}
  ];
  expect(evaluateWebChallenge(c.id,history,c.correctCause,[1]).complete).toBe(true);
  expect(evaluateWebChallenge(c.id,history,c.correctCause,[]).complete).toBe(false);
  expect(evaluateWebChallenge(c.id,history,-1,[1]).complete).toBe(false);
  expect(evaluateWebChallenge(c.id,history.slice(0,3),c.correctCause,[1]).complete).toBe(false);
 });}
 it('refuses external URL-like inputs',()=>{
  const c=WEB_CASES[0];expect(handleHttp(c.id,{...c.normal,url:'https://example.com/'},false).status).toBe(400);
 });
 it('never transforms an XSS marker into executing code',()=>{
  const c=WEB_CASES.find(x=>x.id==='xss')!;const r=handleHttp('xss',c.probe,true);expect(r.body).toContain('&lt;script&gt;');expect(r.body).not.toContain('<script>');
 });
});
