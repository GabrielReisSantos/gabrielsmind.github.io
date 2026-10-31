import {describe,it,expect} from 'vitest';
import {NETWORK_QUESTIONS} from './knowledge';
describe('CCNA concept-check question integrity',()=>{
 it('includes 24 original questions',()=>expect(NETWORK_QUESTIONS).toHaveLength(24));
 it('covers all six core domains',()=>expect(new Set(NETWORK_QUESTIONS.map(q=>q.domain)).size).toBe(6));
 it('all have valid answers and explanations',()=>expect(NETWORK_QUESTIONS.every(q=>q.options[q.correct]&&q.why.length>30)).toBe(true));
});
