/** Challenge difficulty contracts: predictable, offline, and independently testable. */
export type Difficulty='beginner'|'intermediate'|'advanced'|'exam';
export type DifficultyProfile={id:Difficulty;title:string;summary:string;minDiagnostics:number;minMissionArtifacts:number;hints:'inline'|'limited'|'none';showGuidedTools:boolean;showImmediateFeedback:boolean;timeLimitSeconds:number|null;needsNotes:boolean;hintPenalty:number;wrongAttemptPenalty:number};
export const DIFFICULTIES:readonly DifficultyProfile[]=[
 {id:'beginner',title:'Beginner',summary:'Guided investigation, visible explanations and unlimited hints.',minDiagnostics:2,minMissionArtifacts:2,hints:'inline',showGuidedTools:true,showImmediateFeedback:true,timeLimitSeconds:null,needsNotes:false,hintPenalty:0,wrongAttemptPenalty:0},
 {id:'intermediate',title:'Intermediate',summary:'Independent testing; one clue per stage at a score penalty.',minDiagnostics:2,minMissionArtifacts:2,hints:'limited',showGuidedTools:true,showImmediateFeedback:true,timeLimitSeconds:null,needsNotes:false,hintPenalty:10,wrongAttemptPenalty:5},
 {id:'advanced',title:'Advanced',summary:'Minimal scaffolding, no hints, and stronger evidence requirements.',minDiagnostics:3,minMissionArtifacts:3,hints:'none',showGuidedTools:false,showImmediateFeedback:false,timeLimitSeconds:null,needsNotes:true,hintPenalty:0,wrongAttemptPenalty:10},
 {id:'exam',title:'Exam simulation',summary:'Timed attempt, no hints, no live answer feedback; evidence-based validation.',minDiagnostics:3,minMissionArtifacts:3,hints:'none',showGuidedTools:false,showImmediateFeedback:false,timeLimitSeconds:15*60,needsNotes:true,hintPenalty:0,wrongAttemptPenalty:15},
];
export function profileFor(mode:Difficulty):DifficultyProfile{return DIFFICULTIES.find(p=>p.id===mode)??DIFFICULTIES[0];}
export function isDifficulty(input:unknown):input is Difficulty{return typeof input==='string'&&DIFFICULTIES.some(p=>p.id===input);}
export type GradeInput={mode:Difficulty;diagnostics:number;hypothesisCorrect:boolean;observedFailure:boolean;observedSuccess:boolean;secureRepair:boolean;hintsUsed:number;wrongSubmissions:number;notes:string;expired:boolean};
export type Grade={complete:boolean;score:number;checks:Record<'diagnostics'|'cause'|'baseline'|'retest'|'repair'|'notes'|'time',boolean>};
export function gradeTroubleshoot(input:GradeInput):Grade{
 const policy=profileFor(input.mode);
 const checks={diagnostics:input.diagnostics>=policy.minDiagnostics,cause:input.hypothesisCorrect,baseline:input.observedFailure,retest:input.observedSuccess,repair:input.secureRepair,notes:!policy.needsNotes||input.notes.trim().length>=40,time:!input.expired};
 const complete=Object.values(checks).every(Boolean);
 const score=complete?Math.max(60,100-input.hintsUsed*policy.hintPenalty-input.wrongSubmissions*policy.wrongAttemptPenalty):0;
 return {complete,score,checks};
}
export function stageEvidenceReady(mode:Difficulty,required:string[],all:string[],pinned:string[]):boolean{
 const p=profileFor(mode);
 if(!required.every(x=>pinned.includes(x)))return false;
 return [...new Set(all.filter(x=>pinned.includes(x)))].length>=Math.min(p.minMissionArtifacts,new Set(all).size);
}
export function remainingSeconds(started:number|null,now:number,limit:number|null):number|null{
 if(!started||limit===null)return null;
 return Math.max(0,Math.ceil((started+limit*1000-now)/1000));
}
export function examResultLabel(ready:boolean,mode:Difficulty,submitted:boolean):string{
 if(mode==='exam'&&!submitted)return 'Verification results hidden until submission';
 return ready?'Evidence gates satisfied':'More evidence required';
}
