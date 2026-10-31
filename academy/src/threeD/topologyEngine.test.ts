import {describe,it,expect} from 'vitest';
import {SCENES,sceneById} from './sceneEngine';
import {addCable,editCable,editNat,editPort,editRoute,editRule,evaluate,freePorts,makeTopology,moveRule,removeCable,renderScene} from './topologyEngine';
const seed=(id:string)=>makeTopology(sceneById(id));
const fix=(id:string)=>{const t=seed(id);switch(id){case 'campus':return editPort(t,'sw1','eth1',{allowedVlans:[10,20,30,99]});case 'segments':return moveRule(t,'specific-https',-1);case 'public-dmz':return editNat(t,{translated:'10.40.10.20'});case 'oscp-network':return editRoute(t,'r-lab',{via:'router'});default:throw Error(id);}};
describe('3D physical topology drives packet forwarding',()=>{
 for(const s of SCENES){it(`${s.id}: baseline fails, scoped repair succeeds, isolation remains`,()=>{
  expect(evaluate(seed(s.id)).positive.pass).toBe(false);
  expect(evaluate(fix(s.id)).secure).toBe(true);
  expect(renderScene(s,fix(s.id)).links).toHaveLength(fix(s.id).cables.length);
 });}
 it('interface shutdown / cable disable / physical removal each affect packet behavior',()=>{
  const t=fix('oscp-network'),c=t.cables.find(l=>l.from==='gateway'&&l.to==='router')!;
  expect(evaluate(editCable(t,c.id,false)).positive.pass).toBe(false);
  expect(evaluate(editPort(t,c.from,c.fromPort,{adminUp:false})).positive.pass).toBe(false);
  expect(evaluate(removeCable(t,c.id)).positive.pass).toBe(false);
 });
 it('disconnecting and reconnecting on original interfaces restores the actual path',()=>{
  const t=fix('campus'),c=t.cables[1],gone=removeCable(t,c.id);
  expect(freePorts(gone,c.from).some(p=>p.id===c.fromPort)).toBe(true);
  const wired=addCable(gone,c.from,c.fromPort,c.to,c.toPort);
  expect(evaluate(wired).secure).toBe(true);
 });
 it('wildcard allow-all is unsafe, unlike moving the specific allow ahead of deny',()=>{
  const t=seed('segments');expect(evaluate(editRule(t,'broad-deny',{action:'allow'})).secure).toBe(false);
  expect(evaluate(moveRule(t,'specific-https',-1)).secure).toBe(true);
 });
 it('address mismatches, route changes and DNAT changes are evaluated at packet forwarding time',()=>{
  const t=fix('oscp-network');expect(evaluate(editPort(t,'gateway','eth1',{ipCidr:'172.30.250.1/30'})).positive.pass).toBe(false);
  expect(evaluate(editRoute(t,'r-lab',{via:'db'})).positive.pass).toBe(false);
  expect(evaluate(editNat(fix('public-dmz'),{translated:'10.40.10.99'})).positive.pass).toBe(false);
 });
});
