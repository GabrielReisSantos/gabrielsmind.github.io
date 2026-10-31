import {useSyncExternalStore} from 'react';
import {initialNative,restoreNative,updateNative,NATIVE_STORAGE,type NativeEnterprise} from './nativeEngine';
import type {Topology} from '../threeD/topologyEngine';
import type {LabConfig} from '../ngfw/engine';
let snapshot:NativeEnterprise|null=null;
const listeners=new Set<()=>void>();
const read=():NativeEnterprise=>{try{
 const raw=localStorage.getItem(NATIVE_STORAGE);
 if(raw)return restoreNative(JSON.parse(raw) as unknown);
 // Backwards-compatible initial migration: reflect the v2.2 allow/deny preference.
 const legacy=JSON.parse(localStorage.getItem('cyberlab-enterprise-v22')??'null') as {wsToApp443?:unknown}|null;
 const base=initialNative();
 if(legacy?.wsToApp443===false)base.firewall.security[0].action='deny';
 return base;
}catch{return initialNative();}};
export function getNative(){if(snapshot===null)snapshot=read();return snapshot;}
const emit=()=>{for(const fn of listeners)fn();};
export function patchNative(patch:{topology?:Topology;firewall?:LabConfig}){
 const next=updateNative(getNative(),patch);if(next===snapshot)return;
 snapshot=next;
 try{localStorage.setItem(NATIVE_STORAGE,JSON.stringify(next));}catch{/* in-memory */}
 emit();
}
export function resetNative(){snapshot=initialNative();try{localStorage.setItem(NATIVE_STORAGE,JSON.stringify(snapshot));}catch{/* in-memory */}emit();}
export function setNativeAccess(allow:boolean){const s=getNative(),c=structuredClone(s.firewall),rule=c.security.find(r=>r.id==='enterprise-allow-https');if(!rule)return;if(rule.action===(allow?'allow':'deny')&&rule.enabled)return;rule.action=allow?'allow':'deny';rule.enabled=true;patchNative({firewall:c});}
let wired=false;
function subscribe(fn:()=>void){listeners.add(fn);if(!wired&&typeof window!=='undefined'){
 window.addEventListener('storage',e=>{if(e.key!==NATIVE_STORAGE&&e.key!==null)return;const next=read();if(JSON.stringify(next)!==JSON.stringify(snapshot)){snapshot=next;emit();}});
 window.addEventListener('cyberlab:enterprise-reload',()=>{snapshot=read();emit();});wired=true;
 }return()=>{listeners.delete(fn);};}
export function useNative(){return useSyncExternalStore(subscribe,getNative,initialNative);}
