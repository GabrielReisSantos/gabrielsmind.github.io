/** Browser-local learning backup. This is not a trusted credential vault or an exam transcript. */
export const MAX_BACKUP_BYTES=2_000_000;
export const MAX_RECORDS=200;
const MAX_KEY_LENGTH=150;
const MAX_RAW_VALUE=12_000;
export const BACKUP_NAME='cyberlab-progress-v2.5.json';
export type Backup={format:'cyberlab-local-backup';version:1;exportedAt:string;records:Record<string,string>};
export type BackupStorage=Pick<Storage,'length'|'key'|'getItem'|'setItem'|'removeItem'>;
const isLearningKey=(key:string)=>key.startsWith('cyberlab-')&&key.length<MAX_KEY_LENGTH;
const rawAllowed=(key:string,value:string)=>/^(?:cyberlab-coding-v15-draft-)/.test(key)&&value.length<=MAX_RAW_VALUE || (value.length<=160 && /^cyberlab-(?:difficulty|v7|challenge|v11-detail-|v11-map-mode|coding-v15-(?:track|lesson)|crypto-v16-last)/.test(key));
const byteLength=(text:string)=>new TextEncoder().encode(text).byteLength;
export function validateBackup(input:unknown):Record<string,string>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Not a CyberLab backup');
 const b=input as Partial<Backup>;
 if(b.format!=='cyberlab-local-backup'||b.version!==1||!b.records||typeof b.records!=='object'||Array.isArray(b.records))throw Error('Unsupported backup format');
 const entries=Object.entries(b.records);
 if(entries.length>MAX_RECORDS)throw Error('Backup contains too many records');
 for(const [key,value] of entries){
  if(!isLearningKey(key)||typeof value!=='string'||value.length>MAX_BACKUP_BYTES)throw Error(`Invalid record: ${key.slice(0,40)}`);
  try{JSON.parse(value);}catch{if(!rawAllowed(key,value))throw Error(`Invalid JSON in ${key}`);}
 }
 if(byteLength(JSON.stringify(b))>MAX_BACKUP_BYTES)throw Error('Backup exceeds the 2 MB import limit');
 return Object.fromEntries(entries);
}
export function createBackup(storage:BackupStorage,now=new Date()):Backup{
 const records:Record<string,string>={};
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);
  if(key&&isLearningKey(key)){const value=storage.getItem(key);if(value!==null)records[key]=value;}
 }
 const b:Backup={format:'cyberlab-local-backup',version:1,exportedAt:now.toISOString(),records};
 validateBackup(b);
 return b;
}
/** Snapshot every touched key before writing. Attempt reverse rollback if any write fails. */
export function importBackup(storage:BackupStorage,records:Record<string,string>):void{
 // Re-validate even when the caller already inspected the imported file.
 const checked=validateBackup({format:'cyberlab-local-backup',version:1,records,exportedAt:new Date(0).toISOString()});
 const original=new Map<string,string|null>();
 for(const key of Object.keys(checked))original.set(key,storage.getItem(key));
 const touched:string[]=[];
 try{
  for(const [key,value] of Object.entries(checked)){touched.push(key);storage.setItem(key,value);}
 }catch(error){
  let rollbackFailed=false;
  for(const key of touched.reverse()){
   try{const prior=original.get(key);if(prior===null||prior===undefined)storage.removeItem(key);else storage.setItem(key,prior);}catch{rollbackFailed=true;}
  }
  throw Error(rollbackFailed?'Import failed and some records could not be restored. Restore a previous backup before continuing.':`Import stopped and earlier values were restored. ${String(error)}`);
 }
}
