/** Cross-module enterprise contract for UR-001, not a live directory or firewall.
 * Source-of-truth shared by AD Academy, NGFW, 3D Range and Unified Cyber Range.
 * Individual standalone scenario engines remain intentionally isolated. */
export type EnterpriseKey='helpdeskReset'|'wsToApp443';
export type EnterpriseOrigin='AD Academy'|'NGFW Simulator'|'3D Network Range'|'Unified Cyber Range'|'Enterprise Console';
export type EnterpriseChange={revision:number;key:EnterpriseKey;from:boolean;to:boolean;origin:EnterpriseOrigin};
export type EnterpriseState={version:1;revision:number;helpdeskReset:boolean;wsToApp443:boolean;changes:EnterpriseChange[]};
export const ENTERPRISE_STORAGE='cyberlab-enterprise-v22';
export const initialEnterprise=():EnterpriseState=>({version:1,revision:0,helpdeskReset:true,wsToApp443:true,changes:[]});
const isBool=(v:unknown):v is boolean=>typeof v==='boolean';
export function restoreEnterprise(input:unknown):EnterpriseState{
 const base=initialEnterprise();
 if(!input||typeof input!=='object'||Array.isArray(input))return base;
 const v=input as Partial<EnterpriseState>;
 const revision=v.revision;
 if(v.version!==1||typeof revision!=='number'||!Number.isSafeInteger(revision)||revision < 0||!isBool(v.helpdeskReset)||!isBool(v.wsToApp443)||!Array.isArray(v.changes)||v.changes.length>50)return base;
 const validKeys:EnterpriseKey[]=['helpdeskReset','wsToApp443'];
 const validOrigins:EnterpriseOrigin[]=['AD Academy','NGFW Simulator','3D Network Range','Unified Cyber Range','Enterprise Console'];
 if(!v.changes.every(c=>c&&Number.isSafeInteger(c.revision)&&c.revision>0&&c.revision<=revision&&validKeys.includes(c.key)&&isBool(c.from)&&isBool(c.to)&&validOrigins.includes(c.origin)))return base;
 return {version:1,revision,helpdeskReset:v.helpdeskReset,wsToApp443:v.wsToApp443,changes:v.changes.map(c=>({...c}))};
}
export function changeEnterprise(old:EnterpriseState,key:EnterpriseKey,value:boolean,origin:EnterpriseOrigin):EnterpriseState{
 if(old[key]===value)return old;
 const revision=old.revision+1;
 return {...old,[key]:value,revision,changes:[...old.changes,{revision,key,from:old[key],to:value,origin}].slice(-30)};
}
export function enterprisePaths(s:EnterpriseState){
 return {
  canResetServiceAccount:s.helpdeskReset,
  canReachReportsFromWS01:s.wsToApp443,
  potentialAbusePath:s.helpdeskReset&&s.wsToApp443,
 };
}
