/** Bounded, versioned browser-only mission drafts. Never restore arbitrary commands, marks or privileges.
 * Drafts are local study aids, not tamper-resistant evidence of competence. */
import {AD_SCENARIOS,getPath,type ADScenario} from '../adlab/adEngine';
import {CLI_COMMANDS,simulateADCommand,type Pinned,type CLIResult} from './engine';
export const AD_DRAFT_KEY='cyberlab-v25-ad-drafts';
export type MissionDraft={scenarioId:string;disabled:string[];revision:number;baseline:boolean;history:CLIResult[];pinned:Pinned[];diagnosis:number|null;notes:string;selectedEdge:string|null;retest:{revision:number;reachable:boolean;approved:boolean}|null;review:boolean};
export function emptyMission(s:ADScenario):MissionDraft{return {scenarioId:s.id,disabled:[],revision:0,baseline:false,history:[],pinned:[],diagnosis:null,notes:'',selectedEdge:null,retest:null,review:false};}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const str=(v:unknown,max:number)=>typeof v==='string'?v.slice(0,max):'';
// The synthetic scenario has a tiny bounded permission graph. Historical logs can be
// validated against each permitted edit-state without replaying arbitrary commands.
function knownConfigs(s:ADScenario):string[][]{const weak=s.edges.filter(e=>e.weak).map(e=>e.id);if(weak.length>8)return [[],weak];return Array.from({length:1<<weak.length},(_,mask)=>weak.filter((_,i)=>Boolean(mask&(1<<i))));}
function validEvidence(raw:unknown,s:ADScenario,disabled:string[],rev:number):Pinned|null{
 if(!obj(raw)||!Number.isSafeInteger(raw.revision)||Number(raw.revision)<0||Number(raw.revision)>rev)return null;
 const at=Number(raw.revision),id=str(raw.id,40),fixture=CLI_COMMANDS.find(c=>c.id===id);
 if(!fixture||fixture.category==='reference'||typeof raw.output!=='string'||raw.output.length>5000||raw.category!==fixture.category)return null;
 // Only accept output whose fixture can be independently reproduced for a known revision.
 const choices=at===0?[[]]:at===rev?[disabled]:knownConfigs(s);
 const expected=choices.map(config=>simulateADCommand(fixture.input,s,config)).find(output=>!('error' in output)&&output.output===raw.output);
 if(!expected||'error' in expected)return null;
 return {id,category:fixture.category,revision:at,output:expected.output};
}
export function sanitizeDraft(raw:unknown,s:ADScenario):MissionDraft|null{
 if(!obj(raw)||raw.scenarioId!==s.id)return null;
 const base=emptyMission(s);
 const rawDisabled=Array.isArray(raw.disabled)?raw.disabled:[];
 const disabled=[...new Set(rawDisabled.filter((v):v is string=>typeof v==='string'&&s.edges.some(e=>e.weak&&e.id===v)))];
 const revisionIsValid=Number.isSafeInteger(raw.revision)&&Number(raw.revision)>=disabled.length&&Number(raw.revision)<=500;
 const revision=revisionIsValid?Number(raw.revision):0;
 if(disabled.length>revision)return null;
 // If an invalid or duplicate edit was dropped while restoring the snapshot, its
 // stored retest no longer describes the validated topology. Invalidate the retest,
 // even if the claimed verdict happens to match the repaired graph by coincidence.
 const configurationUnchanged=Array.isArray(raw.disabled)&&rawDisabled.length===disabled.length&&rawDisabled.every((id,i)=>id===disabled[i]);
 const pinned=Array.isArray(raw.pinned)?raw.pinned.slice(0,30).map(v=>validEvidence(v,s,disabled,revision)).filter((x):x is Pinned=>x!==null):[];
 const history=Array.isArray(raw.history)?raw.history.slice(-18).map(entry=>{
  if(!obj(entry)||typeof entry.cmd!=='string'||entry.cmd.length>320)return null;
  const cmd=entry.cmd as string;const fixture=CLI_COMMANDS.find(c=>c.input.toLowerCase()===cmd.toLowerCase().trim());
  if(!fixture)return null;
  const response=knownConfigs(s).map(config=>simulateADCommand(fixture.input,s,config)).find(result=>!('error' in result)&&result.output===entry.output);
  if(!response||'error' in response)return null;
  return response;
 }).filter((x):x is CLIResult=>x!==null):[];
 const diagnosis=Number.isInteger(raw.diagnosis)&&Number(raw.diagnosis)>=0&&Number(raw.diagnosis)<s.diagnoses.length?Number(raw.diagnosis):null;
 const selectedEdge=typeof raw.selectedEdge==='string'&&s.edges.some(e=>e.id===raw.selectedEdge)?raw.selectedEdge:null;
 const notes=str(raw.notes,5000);
 // Recalculate retest from current validated topology rather than trusting saved verdict booleans.
 const retest=configurationUnchanged&&revisionIsValid&&obj(raw.retest)&&raw.retest.revision===revision&&raw.retest.reachable===!!getPath(s,disabled)&&raw.retest.approved===!!getPath(s,disabled,s.legitSource,s.target)?{revision,reachable:!!getPath(s,disabled),approved:!!getPath(s,disabled,s.legitSource,s.target)}:null;
 return {...base,disabled,revision,baseline:raw.baseline===true,pinned,history,diagnosis,selectedEdge,notes,retest,review:raw.review===true};
}
export function parseSavedDrafts(raw:string|null):{active:string;drafts:Record<string,MissionDraft>}{
 const fallback={active:AD_SCENARIOS[0].id,drafts:{} as Record<string,MissionDraft>};
 if(!raw||raw.length>170000)return fallback;
 try{const parsed:unknown=JSON.parse(raw);if(!obj(parsed)||parsed.version!==1||!obj(parsed.drafts))return fallback;
  const drafts:Record<string,MissionDraft>={};for(const s of AD_SCENARIOS){const item=sanitizeDraft(parsed.drafts[s.id],s);if(item)drafts[s.id]=item;}
  const active=typeof parsed.active==='string'&&AD_SCENARIOS.some(s=>s.id===parsed.active)?parsed.active:fallback.active;
  return {active,drafts};
 }catch{return fallback;}
}
export function saveDrafts(store:Pick<Storage,'setItem'>,active:string,drafts:Record<string,MissionDraft>){
 const safe:Record<string,MissionDraft>={};for(const s of AD_SCENARIOS){const value=sanitizeDraft(drafts[s.id],s);if(value)safe[s.id]=value;}
 store.setItem(AD_DRAFT_KEY,JSON.stringify({version:1,active,drafts:safe}));
}
