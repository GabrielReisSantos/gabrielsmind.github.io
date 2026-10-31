import {setNativeAccess,resetNative} from './nativeStore';
import {useSyncExternalStore} from 'react';
import {changeEnterprise,ENTERPRISE_STORAGE,initialEnterprise,restoreEnterprise,type EnterpriseKey,type EnterpriseOrigin,type EnterpriseState} from './engine';
let current:EnterpriseState|null=null;
const listeners=new Set<()=>void>();
function readDisk():EnterpriseState{
 try{return restoreEnterprise(JSON.parse(localStorage.getItem(ENTERPRISE_STORAGE)??'null') as unknown);}catch{return initialEnterprise();}
}
export function snapshotEnterprise():EnterpriseState{if(!current)current=readDisk();return current;}
function notify(){for(const fn of listeners)fn();}
export function changeSharedEnterprise(key:EnterpriseKey,value:boolean,origin:EnterpriseOrigin){
 const old=snapshotEnterprise();const next=changeEnterprise(old,key,value,origin);
 if(key==='wsToApp443')setNativeAccess(value);
 if(next===old)return;
 current=next;
 try{localStorage.setItem(ENTERPRISE_STORAGE,JSON.stringify(next));}catch{/* Memory-only fallback if storage is restricted */}
 notify();
}
export function resetSharedEnterprise(){resetNative();current=initialEnterprise();try{localStorage.setItem(ENTERPRISE_STORAGE,JSON.stringify(current));}catch{/* in-memory fallback */}notify();}
let storageListenerInstalled=false;
function subscribe(listener:()=>void){
 listeners.add(listener);
 if(!storageListenerInstalled&&typeof window!=='undefined'){
  window.addEventListener('storage',e=>{
   if(e.key!==ENTERPRISE_STORAGE&&e.key!==null)return;
   // Rehydrate on cross-tab updates and on progress-backup import/clear.
   const updated=readDisk();
   if(JSON.stringify(updated)!==JSON.stringify(current)){current=updated;notify();}
  });
  window.addEventListener('cyberlab:enterprise-reload',()=>{current=readDisk();notify();});
  storageListenerInstalled=true;
 }
 return ()=>{listeners.delete(listener);};
}
export function useEnterprise():EnterpriseState{return useSyncExternalStore(subscribe,snapshotEnterprise,initialEnterprise);}
