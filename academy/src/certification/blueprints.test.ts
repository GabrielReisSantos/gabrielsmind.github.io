import {describe,it,expect} from 'vitest';
import {QUESTIONS,TRACKS,questionsFor} from './blueprints';
describe('certification blueprint integrity',()=>{
 it('matches the exam weight totals from each uploaded datasheet',()=>{for(const t of TRACKS)expect(t.domains.reduce((a,d)=>a+d.weight,0),t.name).toBe(100);});
 it('has unique track and domain identifiers',()=>{expect(new Set(TRACKS.map(t=>t.id)).size).toBe(3);expect(new Set(TRACKS.flatMap(t=>t.domains.map(d=>d.id))).size).toBe(14);});
 it('covers all 14 published high-level domains with original practice questions',()=>{for(const t of TRACKS)for(const d of t.domains)expect(questionsFor(t.id,d.id).length,`${t.id}/${d.id}`).toBeGreaterThan(0);});
 it('has valid four-option questions, correct answers, and explanations',()=>{for(const q of QUESTIONS){expect(q.options).toHaveLength(4);expect(q.correct).toBeGreaterThanOrEqual(0);expect(q.correct).toBeLessThan(4);expect(q.why.length).toBeGreaterThan(30);expect(TRACKS.find(t=>t.id===q.track)?.domains.some(d=>d.id===q.domain)).toBe(true);}});
 it('provides at least 30 original questions per certification',()=>{for(const t of TRACKS)expect(questionsFor(t.id).length,t.name).toBeGreaterThanOrEqual(30);});
 it('does not reuse question identifiers',()=>expect(new Set(QUESTIONS.map(q=>q.id)).size).toBe(QUESTIONS.length));
});
