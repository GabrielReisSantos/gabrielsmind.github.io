import {describe,it,expect} from 'vitest';
import {AD_SCENARIOS,getPath,validateAD} from './adEngine';
describe('synthetic AD attack-path logic',()=>{
 for(const s of AD_SCENARIOS){it(`${s.id}: remove excessive rights but protect legitimate administration`,()=>{
  expect(getPath(s,[])?.some(e=>e.conditional)).toBe(true);
  const disable=s.edges.filter(e=>e.weak).map(e=>e.id);
  expect(getPath(s,disable)).toBeNull();
  expect(getPath(s,disable,s.legitSource,s.target)).not.toBeNull();
  expect(validateAD(s,disable,true,s.artifacts.slice(0,2).map(a=>a.id),s.answer).complete).toBe(true);
  expect(validateAD(s,disable,false,s.artifacts.slice(0,2).map(a=>a.id),s.answer).complete).toBe(false);
  expect(validateAD(s,disable,true,[s.artifacts[0].id],s.answer).complete).toBe(false);
  expect(validateAD(s,[],true,s.artifacts.map(a=>a.id),s.answer).complete).toBe(false);
  expect(validateAD(s,[...disable,s.edges.find(e=>!e.weak)!.id],true,s.artifacts.map(a=>a.id),s.answer).complete).toBe(false);
 });}
});
