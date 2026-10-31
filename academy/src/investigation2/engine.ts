/** CyberLab Investigation Engine 2.0.
 * Deterministic fictional enterprise. Nothing here invokes a shell, fetch, or network API.
 */
export type CommandId='help'|'scope'|'nmap -sV 10.10.10.20'|'curl -I http://10.10.10.20'|'show web access'|'show firewall logs'|'show processes'|'show integrity'|'show upload policy'|'show firewall policy'|'show forensic timeline'|'test normal'|'test attack-path'|'test segmentation';
export type Category='guide'|'scope'|'recon'|'baseline'|'web'|'firewall'|'host'|'integrity'|'policy'|'correlation'|'verify';
export type RootCause='upload-egress'|'dns'|'nat'|'vendor-callback';
export type Impact='controlled-outbound'|'database-exfil'|'domain-admin'|'no-impact';
export type Control='artifact-upload-egress'|'dns-reset'|'block-all'|'logging-only';
export type ChangeId='quarantine-artifact'|'validate-uploads'|'allowlist-egress'|'egress-proxy'|'disable-uploads'|'block-all-egress'|'suppress-log'|'reset-dns';
export type Evidence={id:string;command:CommandId;category:Category;revision:number;sequence:number;output:string;pinned:boolean};
export type Change={id:ChangeId;revision:number;sequence:number;label:string};
export type Event=({type:'command';sequence:number;evidence:Evidence}|{type:'change';sequence:number;change:Change});
export type Config={rogueArtifact:boolean;uploadValidated:boolean;uploadServiceEnabled:boolean;egress:'any'|'allowlist'|'proxy'|'none';dnsCorrect:boolean;logging:boolean};
export type Claims={root:RootCause|'';impact:Impact|'';control:Control|'';summary:string;technical:string;limitations:string;before:string[];after:string[]};
export type CaseState={version:1;revision:number;config:Config;events:Event[];diagnosis:RootCause|'';notes:string;claims:Claims;submitted:boolean};
export const CASE_ID='CASE-001';
export const CASE_TITLE='Suspicious traffic from WEBSRV1';
export const SCOPE='Fictional lab: 10.10.10.20 (WEBSRV1), DMZ firewall and 10.20.10.5 (DB1). All addresses and events are synthetic. No live commands.';
export const ORIGINAL:Config={rogueArtifact:true,uploadValidated:false,uploadServiceEnabled:true,egress:'any',dnsCorrect:true,logging:true};
export const DIAGNOSES:{id:RootCause;label:string}[]=[
 {id:'dns',label:'DNS poisoning redirected the application to an attacker endpoint'},
 {id:'upload-egress',label:'Unsafe upload handling introduced a server-side artifact, followed by unrestricted outbound connectivity'},
 {id:'nat',label:'A destination-NAT change sent traffic to the wrong internal web server'},
 {id:'vendor-callback',label:'The observed outbound connection was a verified vendor update'}
];
export const IMPACTS:{id:Impact;label:string}[]=[
 {id:'controlled-outbound',label:'A server-side artifact enabled unexpected outbound communication from the DMZ host; no DB access is demonstrated'},
 {id:'database-exfil',label:'Evidence establishes complete database theft from DB1'},
 {id:'domain-admin',label:'Evidence establishes an attacker-controlled domain administrator account'},
 {id:'no-impact',label:'The evidence demonstrates only a harmless application log message'}
];
export const CONTROLS:{id:Control;label:string}[]=[
 {id:'artifact-upload-egress',label:'Quarantine the artifact, validate uploads, and narrow outbound traffic while preserving approved services'},
 {id:'dns-reset',label:'Reset all DNS records without changing file handling or egress permissions'},
 {id:'block-all',label:'Disable every outbound connection regardless of business impact'},
 {id:'logging-only',label:'Suppress noisy logs and leave the server configuration untouched'}
];
export const REPAIRS:{id:ChangeId;label:string;description:string}[]=[
 {id:'quarantine-artifact',label:'Quarantine unauthorized artifact',description:'Remove the discovered server-side executable from the simulated webroot'},
 {id:'validate-uploads',label:'Harden upload validation',description:'Reject executable extensions and prevent execution in upload storage'},
 {id:'allowlist-egress',label:'Restrict DMZ egress to approved destinations',description:'Preserve the authorized vendor endpoint but block unknown outbound hosts'},
 {id:'egress-proxy',label:'Route DMZ egress through an allowlisted proxy',description:'Alternative narrow control with the same authorized destination requirements'},
 {id:'disable-uploads',label:'Disable all customer uploads',description:'Stops an approved business workflow — should not pass'},
 {id:'block-all-egress',label:'Block every DMZ outbound connection',description:'Breaks the required vendor update — should not pass'},
 {id:'suppress-log',label:'Turn off firewall traffic logging',description:'Cosmetic change; does not remove the weakness'},
 {id:'reset-dns',label:'Reset DNS to expected values',description:'Irrelevant to the observed compromise; DNS is already correct'}
];
export const COMMANDS: {id:CommandId;description:string;category:Category}[]=[
 {id:'help',description:'Show available simulated commands',category:'guide'},
 {id:'scope',description:'Display authorized assets and rules',category:'scope'},
 {id:'nmap -sV 10.10.10.20',description:'Inspect a synthetic service inventory',category:'recon'},
 {id:'curl -I http://10.10.10.20',description:'Test baseline HTTP response',category:'baseline'},
 {id:'show web access',description:'View synthetic upload and access events',category:'web'},
 {id:'show firewall logs',description:'Review DMZ egress and database-deny events',category:'firewall'},
 {id:'show processes',description:'Inspect the web process tree',category:'host'},
 {id:'show integrity',description:'Compare files against the authorized manifest',category:'integrity'},
 {id:'show upload policy',description:'Inspect application upload controls',category:'policy'},
 {id:'show firewall policy',description:'Inspect outbound and segmentation rules',category:'policy'},
 {id:'show forensic timeline',description:'Correlate web, host, and firewall events (requires pinned triage evidence)',category:'correlation'},
 {id:'test normal',description:'Retest web, uploads and vendor updates',category:'verify'},
 {id:'test attack-path',description:'Retest the modeled upload/execution/egress chain',category:'verify'},
 {id:'test segmentation',description:'Check the DB isolation boundary',category:'verify'}
];
const known=(x:string):x is CommandId=>COMMANDS.some(c=>c.id===x);
export const startCase=():CaseState=>({version:1,revision:0,config:{...ORIGINAL},events:[],diagnosis:'',notes:'',claims:{root:'',impact:'',control:'',summary:'',technical:'',limitations:'',before:[],after:[]},submitted:false});
export const normal=(c:Config)=>({http:c.dnsCorrect,uploads:c.uploadServiceEnabled,vendor:c.egress!=='none'});
export const exposure=(c:Config)=>({artifact:c.rogueArtifact,unsafeUpload:c.uploadServiceEnabled&&!c.uploadValidated,unknownEgress:c.egress==='any'});
export const safe=(c:Config)=>{const n=normal(c),e=exposure(c);return n.http&&n.uploads&&n.vendor&&!e.artifact&&!e.unsafeUpload&&!e.unknownEgress&&c.logging;};
export function commandOutput(command:CommandId,c:Config,events:Event[]):string{
 const n=normal(c),e=exposure(c);
 switch(command){
 case 'help':return COMMANDS.map(x=>`${x.id.padEnd(27)} ${x.description}`).join('\n');
 case 'scope':return `SCOPE: ${SCOPE}\nEXCLUSIONS: Production assets, external targets, real network/host access.\nOBJECTIVE: Determine cause, constrain impact, preserve approved service.`;
 case 'nmap -sV 10.10.10.20':return 'SYNTHETIC SERVICE INVENTORY\n10.10.10.20 (WEBSRV1)\n22/tcp open ssh OpenSSH (training fixture)\n80/tcp open http Apache/PHP (training fixture)\n443/tcp open https TLS reverse proxy (training fixture)\nNote: service detection is modeled; no packets were sent.';
 case 'curl -I http://10.10.10.20':return n.http?'HTTP/1.1 200 OK\nServer: training-web\nContent-Type: text/html\nX-CyberLab: synthetic-response':'curl: (6) could not resolve training host; DNS policy mismatch';
 case 'show web access':return 'HISTORICAL ACCESS.LOG (IMMUTABLE INCIDENT EVIDENCE)\n10:22:57 GET /index.php 200\n10:23:04 POST /api/uploads 201 src=198.51.100.47 file=assets/cache.php\n10:23:05 GET /uploads/assets/cache.php 200 src=198.51.100.47\n10:24:19 GET /health 200\nNo claim of a real intrusion; fixture timestamps only.';
 case 'show firewall logs':return 'HISTORICAL FIREWALL TRAFFIC (IMMUTABLE INCIDENT EVIDENCE)\n10:23:08 src=10.10.10.20 dst=198.51.100.9 tcp/443 action=allow app=ssl\n10:23:14 src=10.10.10.20 dst=10.20.10.5 tcp/3306 action=deny\n10:25:00 src=10.10.10.20 dst=203.0.113.10 tcp/443 action=allow vendor-update\nThese historical events do not disappear after remediation.';
 case 'show processes':return 'HISTORICAL PROCESS SNAPSHOT\nwww-data  221 php-fpm: pool www\n  └─ www-data  395 /bin/sh -c curl -s https://198.51.100.9/checkin\n     └─ www-data 396 curl -s https://198.51.100.9/checkin\nProcess origin correlated with request at 10:23:05. Synthetic snapshot.';
 case 'show integrity':return `CURRENT FILE-INTEGRITY CHECK · rev ${getRevision(events)}\n${e.artifact?'ALERT uploads/assets/cache.php unexpected executable PHP artifact':'OK uploads/assets/cache.php quarantined / absent'}\nTrusted upload directory write permitted: ${c.uploadServiceEnabled}\nExecutable-type upload validation: ${c.uploadValidated?'enabled':'disabled'}`;
 case 'show upload policy':return `CURRENT APPLICATION CONFIGURATION\nAllowed uploads: ${c.uploadServiceEnabled?'images and documents':'none'}\nExecutable-extension rejection: ${c.uploadValidated?'enabled':'DISABLED'}\nExecution from upload store: ${c.uploadValidated?'denied':'permitted by fixture'}\nApproved image upload: ${n.uploads?'working':'BROKEN'}`;
 case 'show firewall policy':return `CURRENT FIREWALL POLICY\nDMZ -> Internet: ${c.egress==='any'?'allow any destination':c.egress==='none'?'deny all':c.egress==='proxy'?'authorized egress proxy only':'allowlist 203.0.113.10 only'}\nDMZ -> DB1 tcp/3306: DENY (protected)\nTraffic logging: ${c.logging?'enabled':'disabled'}\nApproved vendor update: ${n.vendor?'working':'BROKEN'}`;
 case 'show forensic timeline':return 'CORRELATED INCIDENT TIMELINE (EVIDENCE FROM THREE SOURCES)\n10:23:04 Web access: POST /api/uploads file=assets/cache.php\n10:23:05 Web access: GET /uploads/assets/cache.php\n10:23:06 Host telemetry: php-fpm -> shell -> curl\n10:23:08 Firewall: outbound SSL to 198.51.100.9 ALLOWED\n10:23:14 Firewall: direct DB1 attempt DENIED\nInference: upload-path abuse produced code execution and unexpected outbound traffic. DB compromise is NOT established.';
 case 'test normal':return `CURRENT RETEST · REVISION ${getRevision(events)}\nHTTP /health: ${n.http?'PASS':'FAIL'}\nApproved image upload: ${n.uploads?'PASS':'FAIL'}\nApproved vendor update (203.0.113.10): ${n.vendor?'PASS':'FAIL'}\nRESULT: ${n.http&&n.uploads&&n.vendor?'PASS':'FAIL — business functionality degraded'}`;
 case 'test attack-path':return `CURRENT RETEST · REVISION ${getRevision(events)}\nUnauthorized artifact absent: ${!e.artifact?'PASS':'FAIL'}\nExecutable upload rejected: ${!e.unsafeUpload?'PASS':'FAIL'}\nUnapproved egress (198.51.100.9) denied: ${!e.unknownEgress?'PASS':'FAIL'}\nRESULT: ${!e.artifact&&!e.unsafeUpload&&!e.unknownEgress?'PASS':'FAIL — exploitable path remains'}`;
 case 'test segmentation':return `CURRENT RETEST · REVISION ${getRevision(events)}\nWEBSRV1 -> DB1 tcp/3306: DENY (expected)\nTraffic audit logging: ${c.logging?'PASS':'FAIL — disabled'}\nRESULT: ${c.logging?'PASS — independent security boundary preserved':'FAIL — security telemetry degraded'}`;
 }
}
function getRevision(events:Event[]){return events.reduce((r,e)=>e.type==='change'?Math.max(r,e.change.revision):r,0);}
export function available(state:CaseState,cmd:CommandId):boolean{
 if(cmd!=='show forensic timeline')return true;
 const pinned=(command:CommandId)=>state.events.some(e=>e.type==='command'&&e.evidence.pinned&&e.evidence.command===command&&e.evidence.revision===0);
 return pinned('show web access')&&pinned('show firewall logs')&&pinned('show processes');
}
export function execute(state:CaseState,input:string):{state:CaseState;error?:string}{
 const command=input.trim().replace(/\s+/g,' ');
 if(!known(command))return {state,error:'Unsupported simulated command. Type help for the exact fixture commands. No command was executed.'};
 if(!available(state,command))return {state,error:'Timeline locked: pin historical web-access, process, and firewall evidence first.'};
 if(state.events.length>=180)return {state,error:'This case reached its 180-event safety limit; export or reset the case.'};
 const sequence=state.events.length+1;
 const evidence:Evidence={id:`EV-${String(sequence).padStart(3,'0')}`,command,category:COMMANDS.find(c=>c.id===command)!.category,sequence,revision:state.revision,output:commandOutput(command,state.config,state.events),pinned:false};
 return {state:{...state,events:[...state.events,{type:'command',sequence,evidence}],submitted:false}};
}
export function pin(state:CaseState,id:string):CaseState{return {...state,events:state.events.map(e=>e.type==='command'&&e.evidence.id===id?{...e,evidence:{...e.evidence,pinned:true}}:e)};}
export function evidence(state:CaseState):Evidence[]{return state.events.filter((e):e is Extract<Event,{type:'command'}>=>e.type==='command').map(e=>e.evidence);}
export const hasEvidence=(s:CaseState,cmd:CommandId,rev:number)=>evidence(s).some(e=>e.pinned&&e.command===cmd&&e.revision===rev);
export const triageReady=(s:CaseState)=>['show web access','show firewall logs','show processes','show integrity','show forensic timeline'].every(cmd=>hasEvidence(s,cmd as CommandId,0));
export function setDiagnosis(s:CaseState,d:RootCause):CaseState{return triageReady(s)?{...s,diagnosis:d,submitted:false}:s;}
export function change(s:CaseState,action:ChangeId):CaseState{
 if(s.diagnosis!=='upload-egress'||!triageReady(s)||s.events.length>=180)return s;
 const c={...s.config};
 switch(action){
 case 'quarantine-artifact': c.rogueArtifact=false; break;
 case 'validate-uploads':c.uploadValidated=true;break;
 case 'allowlist-egress':c.egress='allowlist';break;
 case 'egress-proxy':c.egress='proxy';break;
 case 'disable-uploads':c.uploadServiceEnabled=false;break;
 case 'block-all-egress':c.egress='none';break;
 case 'suppress-log':c.logging=false;break;
 case 'reset-dns':c.dnsCorrect=true;break;
 }
 if(JSON.stringify(c)===JSON.stringify(s.config))return s;
 const sequence=s.events.length+1,revision=s.revision+1;
 const record:Change={id:action,revision,sequence,label:REPAIRS.find(x=>x.id===action)!.label};
 return {...s,revision,config:c,events:[...s.events,{type:'change',sequence,change:record}],submitted:false,claims:{...s.claims,after:[]}};
}
export function setClaims(s:CaseState,claims:Partial<Claims>):CaseState{
 const updated={...s.claims,...claims};
 updated.summary=String(updated.summary).slice(0,4000);updated.technical=String(updated.technical).slice(0,6000);updated.limitations=String(updated.limitations).slice(0,3000);
 return {...s,claims:updated,submitted:false};
}
export function cite(s:CaseState,phase:'before'|'after',id:string):CaseState{
 const e=evidence(s).find(x=>x.id===id&&x.pinned);if(!e||e.revision!==(phase==='before'?0:s.revision))return s;
 return setClaims(s,{[phase]:s.claims[phase].includes(id)?s.claims[phase].filter(x=>x!==id):[...s.claims[phase],id]});
}
export function grade(s:CaseState){
 const early=triageReady(s),diagnosis=early&&s.diagnosis==='upload-egress';
 const after=s.revision>0&&['test normal','test attack-path','test segmentation'].every(x=>hasEvidence(s,x as CommandId,s.revision));
 const guard=after&&safe(s.config);
 const actualBefore=evidence(s).filter(e=>e.pinned&&e.revision===0&&s.claims.before.includes(e.id));
 const actualAfter=evidence(s).filter(e=>e.pinned&&e.revision===s.revision&&s.claims.after.includes(e.id));
 const reference= ['show web access','show firewall logs','show processes'].every(x=>actualBefore.some(e=>e.command===x)) && ['test normal','test attack-path','test segmentation'].every(x=>actualAfter.some(e=>e.command===x));
 const claims=s.claims.root==='upload-egress'&&s.claims.impact==='controlled-outbound'&&s.claims.control==='artifact-upload-egress';
 const notes=s.claims.summary.trim().length>=80&&s.claims.technical.trim().length>=100&&s.claims.limitations.trim().length>=40;
 const checks={triage:early,diagnosis,retest:guard,claims,evidence:reference,report:notes};
 return {checks,score:Object.values(checks).filter(Boolean).length,total:6,pass:Object.values(checks).every(Boolean)};
}
export function submit(s:CaseState):CaseState{return {...s,submitted:true};}
export function journal(s:CaseState){return s.events.map(ev=>ev.type==='command'?{sequence:ev.sequence,title:`${ev.evidence.command} (${ev.evidence.id})`,detail:ev.evidence.output,revision:ev.evidence.revision}: {sequence:ev.sequence,title:`Repair: ${ev.change.label}`,detail:`Configuration revision ${ev.change.revision}`,revision:ev.change.revision});}
export function exportReport(s:CaseState):string{
 const g=grade(s),x=s.claims;
 const pinned=evidence(s).filter(e=>e.pinned);
 const plain=(text:string)=>text.replace(/```/g,'[fence removed]');
 return `# CyberLab ${CASE_ID} — investigation report\n\n**Scope:** ${SCOPE}\n**Status:** ${g.pass?'Modeled conditions satisfied':'INCOMPLETE — not validated'}\n**Score:** ${g.score}/${g.total} structural gates (self-assessment only)\n\n## Executive summary\n${plain(x.summary)||'Not provided'}\n\n## Diagnosis\nSelected hypothesis: ${x.root||'Not selected'}\n\n## Technical evidence and analysis\n${plain(x.technical)||'Not provided'}\n\n## Observed impact\n${x.impact||'Not selected'}\n\n## Remediation and retest\n${x.control||'Not selected'}\n\n## Limitations\n${plain(x.limitations)||'Not provided'}\n\n## Evidence citations\nBefore: ${x.before.join(', ')||'none'}\nAfter: ${x.after.join(', ')||'none'}\n\n## Evidence register\n${pinned.map(e=>`### ${e.id} · ${e.command} · revision ${e.revision}\n\n\`\`\`text\n${plain(e.output)}\n\`\`\``).join('\n\n')}\n\n## Configuration and investigation timeline\n${journal(s).map(e=>`- ${e.sequence}. [rev ${e.revision}] ${e.title}`).join('\n')}\n\n## Analyst notes\n${plain(s.notes)}\n\n---\nThis is entirely fictional browser-only material. The scorer validates structured facts, evidence IDs, and bounded model invariants; it does not semantically validate prose or prove real-world pentesting skill.\n`;
}
/** State can be restored only by replaying commands/changes; imported results are not trusted. */
export function restore(raw:unknown):CaseState{
 const fresh=startCase();if(!raw||typeof raw!=='object'||Array.isArray(raw))return fresh;
 const s=raw as Partial<CaseState>;
 if(s.version!==1||!Array.isArray(s.events)||s.events.length>180||!Number.isSafeInteger(s.revision))return fresh;
 let result=fresh;
 for(const [idx,ev] of s.events.entries()){
  const e=ev as Event,seq=idx+1;
  if(e.sequence!==seq)return fresh;
  if(e.type==='command'){
   const ob=e.evidence;if(!ob||ob.sequence!==seq||ob.revision!==result.revision||ob.id!==`EV-${String(seq).padStart(3,'0')}`||!known(ob.command)||!available(result,ob.command))return fresh;
   const next=execute(result,ob.command);if(next.error||next.state===result)return fresh;
   const actual=evidence(next.state).at(-1)!;
   if(actual.output!==ob.output||actual.category!==ob.category||typeof ob.pinned!=='boolean')return fresh;
   result=ob.pinned?pin(next.state,ob.id):next.state;
  }else if(e.type==='change'){
   const ch=e.change;if(!ch||ch.sequence!==seq||ch.revision!==result.revision+1||!REPAIRS.some(x=>x.id===ch.id))return fresh;
   // Replaying a valid change requires contemporaneous triage and diagnosis.
   result={...result,diagnosis:'upload-egress'};
   const next=change(result,ch.id);if(next.revision!==ch.revision||next===result)return fresh;
   result=next;
  }else return fresh;
 }
 if(result.revision!==s.revision||JSON.stringify(result.config)!==JSON.stringify(s.config))return fresh;
 const claim=s.claims;
 if(claim&&typeof claim==='object'){
  const root=DIAGNOSES.some(x=>x.id===claim.root)?claim.root:'';
  const impact=IMPACTS.some(x=>x.id===claim.impact)?claim.impact:'';
  const control=CONTROLS.some(x=>x.id===claim.control)?claim.control:'';
  const before=Array.isArray(claim.before)?claim.before.filter((id):id is string=>typeof id==='string'&&evidence(result).some(x=>x.id===id&&x.pinned&&x.revision===0)):[];
  const after=Array.isArray(claim.after)?claim.after.filter((id):id is string=>typeof id==='string'&&evidence(result).some(x=>x.id===id&&x.pinned&&x.revision===result.revision)):[];
  result=setClaims(result,{root,impact,control,before,after,summary:typeof claim.summary==='string'?claim.summary:'',technical:typeof claim.technical==='string'?claim.technical:'',limitations:typeof claim.limitations==='string'?claim.limitations:''});
 }
 result={...result,diagnosis:DIAGNOSES.some(x=>x.id===s.diagnosis)?s.diagnosis!:'',notes:typeof s.notes==='string'?s.notes.slice(0,12000):'',submitted:s.submitted===true};
 return result;
}
