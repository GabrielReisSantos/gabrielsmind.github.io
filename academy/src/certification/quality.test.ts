import {describe,it,expect} from 'vitest';
import {QUESTIONS} from './blueprints';
import {auditQuestions,objectiveNumbers,DISTRACTOR_NOTES} from './quality';
describe('certification content quality',()=>{
 it('maps every question to its declared datasheet objective',()=>expect(auditQuestions()).toEqual([]));
 it('has an unambiguous mapping for corrected FW-05',()=>expect(objectiveNumbers(QUESTIONS.find(q=>q.id==='FW-05')!)).toEqual(['2.3']));
 it('keeps curated distractor notes tied to non-answer choices',()=>{for(const [id,notes] of Object.entries(DISTRACTOR_NOTES)){const q=QUESTIONS.find(q=>q.id===id)!;expect(q).toBeDefined();for(const [index,text] of Object.entries(notes)){expect(Number(index)).not.toBe(q.correct);expect(text?.length??0).toBeGreaterThan(35);}}});
});
