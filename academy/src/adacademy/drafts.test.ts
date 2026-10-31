import {describe,it,expect} from 'vitest';
import {AD_SCENARIOS} from '../adlab/adEngine';
import {CLI_COMMANDS,simulateADCommand,gradeADInvestigation} from './engine';
import {AD_DRAFT_KEY,emptyMission,parseSavedDrafts,sanitizeDraft,saveDrafts} from './drafts';
const acl=AD_SCENARIOS[0];
const perm=CLI_COMMANDS.find(c=>c.id==='acl')!;
const evidence=simulateADCommand(perm.input,acl,[]);
if('error' in evidence)throw new Error('fixture missing');
describe('AD draft recovery',()=>{
 it('round trips a case and keeps its notes',()=>{const d={...emptyMission(acl),notes:'Investigated delegated service identity permissions',baseline:true,pinned:[{id:evidence.evidenceId,category:evidence.category,output:evidence.output,revision:0}]};const store:Record<string,string>={};saveDrafts({setItem(k,v){store[k]=v;}},acl.id,{[acl.id]:d});expect(store[AD_DRAFT_KEY]).toBeTruthy();expect(parseSavedDrafts(store[AD_DRAFT_KEY]).drafts.acl.notes).toBe(d.notes);});
 it('retains baseline command history after changing permission revision',()=>{const original=simulateADCommand(perm.input,acl,[]);if('error' in original)throw Error('Fixture missing');const d={...emptyMission(acl),revision:1,disabled:['overacl'],history:[original]};expect(sanitizeDraft(d,acl)?.history).toHaveLength(1);});
 it('rejects corrupt, oversized, and unknown drafts',()=>{expect(parseSavedDrafts('bad').drafts).toEqual({});expect(parseSavedDrafts('x'.repeat(180000)).drafts).toEqual({});expect(sanitizeDraft({...emptyMission(acl),scenarioId:'unknown'},acl)).toBeNull();});
 it('does not restore fake evidence or fake results',()=>{const d={...emptyMission(acl),pinned:[{id:'acl',category:'permissions',output:'I win',revision:0}],disabled:['legit','overacl'],revision:2,retest:{revision:2,reachable:false,approved:true}};const s=sanitizeDraft(d,acl)!;expect(s.disabled).toEqual(['overacl']);expect(s.pinned).toEqual([]);expect(s.retest).toBeNull();});
 it('checks a saved retest against current graph state',()=>{const d={...emptyMission(acl),disabled:['overacl'],revision:1,retest:{revision:1,reachable:false,approved:true}};expect(sanitizeDraft(d,acl)?.retest).toEqual(d.retest);expect(sanitizeDraft({...d,retest:{revision:0,reachable:false,approved:true}},acl)?.retest).toBeNull();});
 it('invalidates retests if saved disabled edges were dropped or duplicated',()=>{const d={...emptyMission(acl),disabled:['overacl'],revision:2,retest:{revision:2,reachable:false,approved:true}};expect(sanitizeDraft(d,acl)?.retest).toEqual(d.retest);expect(sanitizeDraft({...d,disabled:['legit','overacl']},acl)?.retest).toBeNull();expect(sanitizeDraft({...d,disabled:['overacl','overacl']},acl)?.retest).toBeNull();expect((sanitizeDraft({...d,revision:9999,retest:{revision:0,reachable:false,approved:true}},acl)?.retest??null)).toBeNull();});

 it('never trusts arbitrary diagnostic command transcripts',()=>{const d={...emptyMission(acl),history:[{...evidence,output:'forged'}]};expect(sanitizeDraft(d,acl)?.history).toEqual([]);});
 it('cannot turn an unvalidated snapshot into a pass',()=>{const d=sanitizeDraft({...emptyMission(acl),disabled:['overacl'],revision:1,baseline:true,review:true,diagnosis:0,notes:'This is an excessive permission issue that affects application access. We removed the permission and did a secure verification.',retest:{revision:1,reachable:false,approved:true},pinned:[{id:'acl',category:'permissions',output:'fake',revision:0}]},acl)!;expect(gradeADInvestigation(acl,d.disabled,d.baseline,d.pinned,d.diagnosis,d.retest,d.revision,d.notes).ok).toBe(false);});
});
