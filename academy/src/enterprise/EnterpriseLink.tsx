import {forwardNative} from './nativeEngine';
import {useNative,setNativeAccess} from './nativeStore';
import {useEnterprise,changeSharedEnterprise,resetSharedEnterprise} from './store';
import {type EnterpriseOrigin} from './engine';
import './enterprise.css';
type Focus='identity'|'firewall'|'network'|'all';
const FIELDS=[{key:'helpdeskReset' as const,label:'Helpdesk → svc-reports',detail:'Delegated ResetPassword permission on service identity',on:'EXCESSIVE',off:'RESTRICTED'},{key:'wsToApp443' as const,label:'WS01 → APP01 · TCP/443',detail:'Native forwarding outcome · quick toggle for scoped NGFW rule',on:'ALLOW',off:'DENY'}];
export default function EnterpriseLink({focus,origin}:{focus:Focus;origin:EnterpriseOrigin}){
 const s=useEnterprise(),native=useNative(),verdict=forwardNative(native),networkAllowed=verdict.allowed,ngfwRule=native.firewall.security.find(r=>r.id==='enterprise-allow-https'),ngfwRuleAllowed=ngfwRule?.enabled&&ngfwRule.action==='allow',path={potentialAbusePath:s.helpdeskReset&&networkAllowed};
 const items=focus==='identity'?FIELDS.slice(0,1):focus==='network'||focus==='firewall'?FIELDS.slice(1):FIELDS;
 return <section className="el-card" aria-label="Cross-module enterprise controls"><div className="el-header"><div><span>CONNECTED ENTERPRISE · V2.3</span><h2>Shared mission configuration</h2></div><strong>AD REV {s.revision} · NETWORK REV {native.revision}</strong></div>
  <p>These controls modify the <b>same fictional enterprise</b> used by UR-001. Other exercises in this workbench remain independent.</p>
  <div className="el-controls">{items.map(item=><div className="el-control" key={item.key}><div><strong>{item.label}</strong><small>{item.detail}</small></div><button type="button" aria-label={`${item.label}: ${(item.key==='helpdeskReset'?s.helpdeskReset:ngfwRuleAllowed)?'disable':'enable'}`} aria-pressed={item.key==='helpdeskReset'?s.helpdeskReset:!!ngfwRuleAllowed} className={(item.key==='helpdeskReset'?s.helpdeskReset:ngfwRuleAllowed)?'el-enabled':'el-disabled'} onClick={()=>item.key==='helpdeskReset'?changeSharedEnterprise('helpdeskReset',!s.helpdeskReset,origin):setNativeAccess(!ngfwRuleAllowed)}>{(item.key==='helpdeskReset'?s.helpdeskReset:ngfwRuleAllowed)?item.on:item.off}</button></div>)}</div>
  <div className="el-graph" role="img" aria-label={`Helpdesk password-reset delegation ${s.helpdeskReset?'present':'restricted'}; WS01 to APP01 HTTPS ${networkAllowed?'allowed':'denied'}`}>
   <div className="el-graph-row"><span>IDENTITY</span><b>Helpdesk</b><i className={s.helpdeskReset?'el-risk':'el-safe'}>{s.helpdeskReset?'ResetPassword →':'No delegation ×'}</i><b>svc-reports</b></div>
   <div className="el-graph-row"><span>NETWORK</span><b>WS01</b><i className={networkAllowed?'el-risk':'el-safe'}>{networkAllowed?'NGFW allows →':'NGFW denies ×'}</i><b>APP01:443</b></div>
  </div>
  <div className="el-path"><strong>Native forwarding verdict · {verdict.stage}</strong><small>{verdict.reason}</small><span>{path.potentialAbusePath?'AD permission + network reachability expose APP01':'At least one prerequisite is blocked'}</span><small>{s.helpdeskReset?'Risky AD delegation':'Least-privilege AD delegation'} · {networkAllowed?'WS01 HTTPS allowed':'WS01 HTTPS denied'}</small></div>
  {s.changes.length>0&&<details className="el-history"><summary>Shared configuration history ({s.changes.length})</summary><ul>{s.changes.slice(-6).reverse().map(c=><li key={c.revision}>R{c.revision} · {c.origin}: {c.key==='helpdeskReset'?'ResetPassword ACL':'WS01 → APP01'} → {c.to?'enabled':'disabled'}</li>)}</ul></details>}
  <div className="el-actions"><a href="#unified">Open Unified Cyber Range</a><button type="button" onClick={resetSharedEnterprise}>Reset shared controls</button></div>
  <small className="el-scope">No real PAN-OS, Active Directory, network traffic, or external requests. The native enterprise scene and rulebase feed UR-001; standalone certification cases remain isolated.</small>
 </section>;
}
