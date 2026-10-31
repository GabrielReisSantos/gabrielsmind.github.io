export type PracticeRecord={id:string;attempts:number;independent:number;streak:number;dueAt:number;lastAt:number;assisted:boolean};
const intervals=[0,24,72,168,336];
export function recordPractice(old:PracticeRecord|undefined,id:string,now:number,success:boolean,assisted:boolean):PracticeRecord{
 const streak=success&&!assisted?Math.min((old?.streak??0)+1,4):0;
 return {id,attempts:(old?.attempts??0)+1,independent:(old?.independent??0)+(success&&!assisted?1:0),streak,dueAt:now+intervals[streak]*3600000,lastAt:now,assisted};
}
export function readPractice():PracticeRecord[]{try{const parsed=JSON.parse(localStorage.getItem('cyberlab-pki-v17-practice')??'[]');return Array.isArray(parsed)?parsed.filter(x=>x&&typeof x.id==='string'&&Number.isFinite(x.dueAt)&&Number.isFinite(x.streak)&&Number.isFinite(x.attempts)):[];}catch{return [];}}
export function savePractice(records:PracticeRecord[]){try{localStorage.setItem('cyberlab-pki-v17-practice',JSON.stringify(records));window.dispatchEvent(new Event('cyberlab:progress'));}catch{/* storage optional */}}
