import {useRef,useState} from 'react';
import {Download,Upload,AlertTriangle} from 'lucide-react';
import {BACKUP_NAME,MAX_BACKUP_BYTES,createBackup,importBackup,validateBackup} from './backupEngine';
export {validateBackup} from './backupEngine';
import './learning.css';
export default function ProgressBackup(){
 const input=useRef<HTMLInputElement>(null);
 const [notice,setNotice]=useState('');
 const [pending,setPending]=useState<Record<string,string>|null>(null);
 const download=()=>{try{
  const backup=createBackup(localStorage);
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  if(blob.size>MAX_BACKUP_BYTES)throw Error('Progress exceeds the 2 MB backup limit. Export important notes separately.');
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=BACKUP_NAME;document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setNotice(`Exported ${Object.keys(backup.records).length} locally saved records.`);
 }catch(e){setNotice(`Backup failed: ${String(e)}`);}};
 const select=async(file?:File)=>{setPending(null);if(!file)return;if(file.size>MAX_BACKUP_BYTES){setNotice('File too large for local learning backup.');return;}
  try{const candidate=validateBackup(JSON.parse(await file.text()) as unknown);setPending(candidate);setNotice(`Ready to import ${Object.keys(candidate).length} records. Existing progress with matching names will be replaced.`);}catch(e){setNotice(`Import rejected: ${String(e)}`);}
 };
 const apply=()=>{if(!pending)return;try{importBackup(localStorage,pending);setPending(null);window.location.reload();}catch(e){setNotice(`Storage error: ${String(e)}`);}};
 return <section className="learn-backup"><div><h3>Your progress, your browser</h3><p>Export your local training progress and investigation notes before clearing browser data or changing devices. Files may contain notes you wrote: keep them private.</p></div><div className="learn-backup-actions"><button onClick={download}><Download size={17}/> Export progress</button><button onClick={()=>input.current?.click()}><Upload size={17}/> Select backup</button><input ref={input} type="file" accept=".json,application/json" className="learn-file-input" aria-label="Select CyberLab progress backup" onChange={e=>{void select(e.target.files?.[0]);e.currentTarget.value='';}}/>{pending&&<button className="learn-import-confirm" onClick={apply}>Confirm import & reload</button>}</div><p role="status">{notice||'Storage is local to this browser and origin; no account or server sync is enabled.'}</p><small><AlertTriangle size={14}/> Import replaces matching records only, with rollback attempted if storage rejects a write. This backup is not an official certification transcript.</small></section>;
}
