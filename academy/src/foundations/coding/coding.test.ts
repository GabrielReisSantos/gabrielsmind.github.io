import {describe,expect,it} from 'vitest';
import {CODING_LESSONS} from './lessons';
import {initialApiState,mockApi,normalizeCSharp,parseHttpRequest,validateApiLesson,validateCSharpReference,codingSavedIds} from './engine';
describe('Coding Foundations',()=>{
 it('has six exercises per learning path with unique IDs',()=>{
  expect(new Set(CODING_LESSONS.map(l=>l.id)).size).toBe(18);
  for(const t of ['python','csharp','api'])expect(CODING_LESSONS.filter(l=>l.language===t)).toHaveLength(6);
 });
 it('checks genuine API request shape and state transitions',()=>{
  let state=initialApiState();
  for(const lesson of CODING_LESSONS.filter(l=>l.language==='api')){
   const req=parseHttpRequest(lesson.solution);
   const run=mockApi(req,state);state=run.state;
   expect(validateApiLesson(lesson.id,req,run.result)).toBe(true);
   expect(`${run.result.status} ${run.result.statusText}`).toBe(lesson.expected);
  }
  expect(state.notes).toHaveLength(1);expect(state.assets[1].location).toBe('DMZ');
 });
 it('enforces correct content type, JSON, and auth',()=>{
  const state=initialApiState();
  expect(mockApi(parseHttpRequest('GET /api/private HTTP/1.1'),state).result.status).toBe(401);
  expect(mockApi(parseHttpRequest('POST /api/notes HTTP/1.1\nContent-Type: application/json\n\n{bad'),state).result.status).toBe(400);
  expect(mockApi(parseHttpRequest('POST /api/notes HTTP/1.1\nContent-Type: application/json\n\n{}'),state).result.status).toBe(422);
  expect(mockApi(parseHttpRequest('GET /api/nope HTTP/1.1'),state).result.status).toBe(404);
  expect(()=>parseHttpRequest('DELETE /api/assets HTTP/1.1')).toThrow();
 });
 it('C# typing exercises compare reference syntax only',()=>{
  for(const l of CODING_LESSONS.filter(l=>l.language==='csharp')){
   expect(validateCSharpReference(l,l.solution)).toBe(true);
   expect(validateCSharpReference(l,l.solution.replace('Console','console'))).toBe(l.id==='cs-05'||l.id==='cs-06');
  }
  expect(normalizeCSharp('string  host = "a b";')).toBe(normalizeCSharp('string host="a b" ;'));
 });
 it('rejects fabricated progress IDs',()=>{
  expect(codingSavedIds(['py-01','py-01','unknown',2],CODING_LESSONS.map(l=>l.id))).toEqual(['py-01']);
 });
});
