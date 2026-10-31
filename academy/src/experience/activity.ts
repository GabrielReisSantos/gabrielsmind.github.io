/** Observed onboarding actions, not manually ticked achievements. */
export const ACTIVITY_KEY='cyberlab-v25-onboarding-actions';
export const ACTIVITY_IDS=['ad.open','ad.graph-select','ad.graph-zoom','ad.command','ad.evidence','ad.retest'] as const;
export type ActivityId=typeof ACTIVITY_IDS[number];
export function parseActivity(raw:string|null):ActivityId[]{if(!raw||raw.length>2000)return [];try{const v:unknown=JSON.parse(raw);return Array.isArray(v)?ACTIVITY_IDS.filter(id=>v.includes(id)):[];}catch{return [];}}
export function getActivity():ActivityId[]{try{return parseActivity(localStorage.getItem(ACTIVITY_KEY));}catch{return [];}}
export function recordActivity(id:ActivityId){try{const old=getActivity();if(old.includes(id))return;localStorage.setItem(ACTIVITY_KEY,JSON.stringify([...old,id]));window.dispatchEvent(new Event('cyberlab:activity'));}catch{/* no storage: learning still works */}}
