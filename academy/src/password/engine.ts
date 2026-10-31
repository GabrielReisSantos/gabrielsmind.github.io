/** Bounded, entirely local password-auditing exercise. No shell or network access. */
export const SAVE_KEY='cyberlab-password-audit-v26';
export const HASHES={
 'demo-analyst':'c2ae27a77e88cc9ede656b6106bd05d98f08250e4e27ea899862e6397abc11fb',
 'svc-reports':'4d19cf40bd05a0ab40943ea8232c11fe0cfc24829efaa769ec5004888b3ff54b',
 'guest-demo':'699a9ab56475e33e34368e7838ddd4f677de98148474263ecec0f9ba2d89c475'
} as const;
export type Identity=keyof typeof HASHES;
export const WORDLIST=['northstar','orbit2026','welcome1','admin','audit','sun','coffee','summer2026'] as const;
export type Stage='scope'|'identify'|'benchmark'|'dictionary'|'rules'|'mask'|'john'|'defense';
export const STAGES:{id:Stage;title:string;objective:string;concept:string;try:string;hints:string[];manual:string}[]=[
 {id:'scope',title:'Confirm authorization & inspect files',objective:'Read the authorized scope and the supplied synthetic hashes.',concept:'An offline password audit requires authorized material, a known origin, and a clearly bounded scope. A digest is not a password.',try:'cat scope.txt  →  cat hashes.txt',hints:['Type cat scope.txt','Then inspect the supplied hashes with cat hashes.txt'],manual:'Methodology · extract and format hashes (PDF pp. 7–8)'},
 {id:'identify',title:'Establish the hash type',objective:'Use provenance and a format reference before choosing a hash mode.',concept:'A 64-character hexadecimal digest is not proof of SHA-256. The application provenance determines the interpretation.',try:'cat provenance.txt  →  hashcat -m 1400 --example-hashes',hints:['Inspect provenance.txt','Use the Hashcat format example for mode 1400'],manual:'Core knowledge · identification caveat (PDF p. 7)'},
 {id:'benchmark',title:'Estimate cost before attacking',objective:'Run a synthetic hash-rate baseline and calculate a small mask keyspace.',concept:'Keyspace / guesses per second estimates worst-case exhaustive time; average time can be shorter. Browser benchmarks are not hardware benchmarks.',try:'hashcat -b -m 1400  →  keyspace ?l?l?d?d',hints:['Benchmark the format with hashcat -b -m 1400','Then calculate keyspace ?l?l?d?d'],manual:'Cracking methodology · evaluate speed and resources (PDF pp. 7–8)'},
 {id:'dictionary',title:'Test a focused wordlist',objective:'Run a straight dictionary attack against the synthetic SHA-256 fixtures.',concept:'Wordlists target human password reuse and predictable choices. The exercise performs real browser SHA-256 comparisons against a tiny local list.',try:'hashcat -m 1400 -a 0 hashes.txt shortlist.txt',hints:['-m selects the hash type; 1400 is raw SHA-256','-a 0 chooses a straight attack'],manual:'Basic playbook · dictionary (PDF pp. 9, 14)'},
 {id:'rules',title:'Test a one-character variation',objective:'Apply a documented append-character rule to a known wordlist.',concept:'A rule creates candidates; it does not recover a password by itself. Our demo rule has the Hashcat expression $!.',try:'hashcat -m 1400 -a 0 hashes.txt shortlist.txt -r rules/append-bang.rule',hints:['Start with the straight wordlist command','Append -r rules/append-bang.rule'],manual:'Rules and masks · append-character rule (PDF pp. 70–72)'},
 {id:'mask',title:'Use a bounded custom mask',objective:'Generate a constrained set of candidates instead of a huge blind keyspace.',concept:'Mask ?1?1?1?d?d with -1 sun means 3³ × 10² = 2,700 candidates. The browser checks those candidates locally using SHA-256.',try:'hashcat -m 1400 -a 3 hashes.txt -1 sun ?1?1?1?d?d',hints:['-a 3 selects a mask attack','-1 sun supplies characters for each ?1 slot'],manual:'Hashcat cheat sheet · masks and custom charsets (PDF pp. 14, 81)'},
 {id:'john',title:'Reinforce with John the Ripper',objective:'Type the corresponding John wordlist command and compare the result.',concept:'Hashcat and John use different format naming. The program here mimics command syntax, not a real John process.',try:'john --format=raw-sha256 --wordlist=shortlist.txt hashes.txt',hints:['John uses --format=raw-sha256','The wordlist option is --wordlist=shortlist.txt'],manual:'John the Ripper cheat sheet (PDF p. 12)'},
 {id:'defense',title:'Fix the underlying password risk',objective:'Inspect the policy, switch the password-storage design, rotate weak credentials, and retest.',concept:'Changing SHA-256 to a slow KDF is not a substitute for rotating weak or disclosed passwords. Offline guessing does not generate live DC authentication events.',try:'policy inspect → policy set kdf argon2id → policy rotate all → policy test',hints:['First inspect the synthetic application policy','Improve storage and rotate credentials—both are necessary','Finish with policy test'],manual:'Derived defensive exercise · extends the book’s methodology'}
];
export type Signal='scope'|'hashes'|'provenance'|'example'|'benchmark'|'keyspace'|'dictionary'|'rules'|'mask'|'john'|'inspectPolicy'|'kdf'|'rotation'|'retest';
export type Entry={command:string;output:string;success:boolean;stage:Stage|null};
export type State={signals:Signal[];history:Entry[];commands:string[];completed:Stage[];kdf:'raw-sha256'|'argon2id';rotated:boolean;verified:boolean;recovered:Identity[]};
const stageSignals:Record<Stage,Signal[]>={scope:['scope','hashes'],identify:['provenance','example'],benchmark:['benchmark','keyspace'],dictionary:['dictionary'],rules:['rules'],mask:['mask'],john:['john'],defense:['inspectPolicy','kdf','rotation','retest']};
export const createState=():State=>({signals:[],history:[],commands:[],completed:[],kdf:'raw-sha256',rotated:false,verified:false,recovered:[]});
const add=<T extends string>(values:T[],value:T):T[]=>values.includes(value)?values:[...values,value];
function activeStage(s:State):Stage|null{return STAGES.find(stage=>!s.completed.includes(stage.id))?.id??null;}
function requiredStatus(s:State):Stage[]{return STAGES.filter(stage=>stageSignals[stage.id].every(flag=>s.signals.includes(flag))).map(stage=>stage.id);}
export function stageIndex(s:State):number{return STAGES.findIndex(stage=>!s.completed.includes(stage.id));}
export function completion(s:State):number{return s.completed.length;}
export function grade(s:State,analysis:string):{pass:boolean;missing:string[]}{
 const missing:string[]=[];for(const step of STAGES)if(!s.completed.includes(step.id))missing.push(step.title);
 if(!s.verified||!s.rotated||s.kdf!=='argon2id')missing.push('Fresh password-policy retest');
 if(analysis.trim().length<100)missing.push('A written analysis of at least 100 characters');
 return {pass:missing.length===0,missing};
}
function hex(bytes:ArrayBuffer):string{return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
export async function sha256(value:string):Promise<string>{return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));}
async function tryCandidates(candidates:readonly string[]):Promise<{ids:Identity[];hits:{id:Identity;candidate:string}[];tested:number}>{
 const found:Identity[]=[];const hits:{id:Identity;candidate:string}[]=[];const remaining=new Map(Object.entries(HASHES) as [Identity,string][]);
 for(const candidate of candidates){const digest=await sha256(candidate);for(const [id,target] of remaining){if(digest===target){found.push(id);hits.push({id,candidate});remaining.delete(id);}}if(!remaining.size)break;}
 return {ids:found,hits,tested:candidates.length};
}
export function maskKeyspace(mask:string):number|null{
 if(!/^(?:\?l|\?d){1,8}$/.test(mask))return null;
 const items=mask.match(/\?[ld]/g)??[];const size=items.reduce((n,c)=>n*(c==='?l'?26:10),1);return Number.isSafeInteger(size)?size:null;
}
function normalize(input:string):string{return input.trim().replace(/\s+/g,' ');}
function matchHashcat(raw:string,mode:'dictionary'|'rules'|'mask'):boolean{
 const tokens=raw.split(' ');if(tokens[0]!=='hashcat'||tokens.includes('--username'))return false;
 const index=(flag:string)=>tokens.indexOf(flag);
 const has=(flag:string,value:string)=>{const at=index(flag);return at>=0&&tokens[at+1]===value;};
 if(!has('-m','1400')||!has('-a',mode==='mask'?'3':'0')||!tokens.includes('hashes.txt'))return false;
 const permitted=mode==='dictionary'?['hashcat','-m','1400','-a','0','hashes.txt','shortlist.txt']:
  mode==='rules'?['hashcat','-m','1400','-a','0','hashes.txt','shortlist.txt','-r','rules/append-bang.rule']:
  ['hashcat','-m','1400','-a','3','hashes.txt','-1','sun','?1?1?1?d?d'];
 if(tokens.some(t=>!permitted.includes(t)))return false;
 if(mode==='dictionary')return tokens.length===7&&tokens.includes('shortlist.txt');
 if(mode==='rules')return tokens.length===9&&tokens.includes('shortlist.txt')&&has('-r','rules/append-bang.rule');
 return tokens.length===9&&has('-1','sun')&&tokens.includes('?1?1?1?d?d');
}
const eligible=[...WORDLIST];
function maskCandidates():string[]{const out:string[]=[];for(const a of 'sun')for(const b of 'sun')for(const c of 'sun')for(let n=0;n<100;n++)out.push(`${a}${b}${c}${String(n).padStart(2,'0')}`);return out;}
export async function execute(state:State,input:string):Promise<{state:State;entry:Entry}>{
 const command=normalize(input),stage=activeStage(state);
 if(!command||command.length>220||/[|;&`<>\\\r\n]/.test(command)){
  return {state,entry:{command,output:'Command rejected: enter one supported training command (no shell operators).',success:false,stage}};
 }
 let next={...state,signals:[...state.signals],completed:[...state.completed],history:[...state.history],commands:[...state.commands],recovered:[...state.recovered]};
 let output='';let signal:Signal|null=null;
 const wrongStage=(needed:Stage)=>`This operation is part of ${STAGES.find(s=>s.id===needed)?.title}. Complete the current step first (${stage?STAGES.find(s=>s.id===stage)?.title:'session finished'}).`;
 const accept=(forStage:Stage,flag:Signal,message:string)=>{if(stage!==forStage){output=wrongStage(forStage);return;}signal=flag;output=message;};
 const list=Object.values(HASHES).join('\n');
 if(command==='help')output='TRAINING COMMANDS (no real shell): cat scope.txt | cat hashes.txt | cat provenance.txt | hashcat -m 1400 --example-hashes | hashcat -b -m 1400 | keyspace ?l?l?d?d | hashcat ... | john ... | policy inspect | policy set kdf argon2id | policy rotate all | policy test. Use the current objective and hints for full syntax.';
 else if(command==='cat scope.txt')accept('scope','scope','SCOPE: ACME-DEMO synthetic application records only. Offline password auditing for training. No external target, network request, real account, or credential dump.');
 else if(command==='cat hashes.txt')accept('scope','hashes',`hashes.txt (synthetic fixtures; raw 64-hex digests, one per line):\n${list}`);
 else if(command==='cat provenance.txt')accept('identify','provenance','Source: fictional legacy ACME-DEMO application database. Passwords stored as unsalted raw SHA-256 hex. Digest lines correspond to demo-analyst, svc-reports, guest-demo in that order. This is deliberately insecure. Known source format—not inferred from digest length.');
 else if(command==='hashcat -m 1400 --example-hashes')accept('identify','example','Mode 1400: SHA2-256 (raw). Example digests contain 64 hex characters. Format alone is not conclusive; provenance matters. Reference lookup is simulated.');
 else if(command==='hashcat -b -m 1400')accept('benchmark','benchmark','SYNTHETIC BENCHMARK ONLY: raw SHA-256 = 1,000,000 guesses/s (illustrative, not measured). Do not extrapolate to another device or to Argon2id.');
 else if(command.startsWith('keyspace ')){
  const mask=command.slice(9);const result=maskKeyspace(mask);
  if(result===null)output='Supported educational masks are ?l and ?d, 1–8 positions. Example: keyspace ?l?l?d?d';
  else if(mask!=='?l?l?d?d')output=`Keyspace: ${result.toLocaleString()} candidates. Now compute the requested ?l?l?d?d mask.`;
  else accept('benchmark','keyspace',`26² × 10² = ${result.toLocaleString()} guesses. Worst-case at the fictional 1,000,000 guesses/s: ${(result/1_000_000).toFixed(4)} seconds. Real rates vary drastically.`);
 }
 else if(matchHashcat(command,'dictionary')){
  if(stage!=='dictionary')output=wrongStage('dictionary');else{const result=await tryCandidates(eligible);for(const id of result.ids)next.recovered=add(next.recovered,id);signal='dictionary';output=`BROWSER SHA-256: ${result.tested} local wordlist candidates checked. Matched: ${result.hits.map(hit=>`${hit.id} → ${hit.candidate}`).join(', ')||'none'}. (All identities are fictional; no real Hashcat process.)`;}
 }
 else if(matchHashcat(command,'rules')){
  if(stage!=='rules')output=wrongStage('rules');else{const candidates=eligible.map(w=>w+'!');const result=await tryCandidates(candidates);for(const id of result.ids)next.recovered=add(next.recovered,id);signal='rules';output=`BROWSER SHA-256: ${result.tested} candidates transformed by append (!) rule. Matched: ${result.hits.map(hit=>`${hit.id} → ${hit.candidate}`).join(', ')||'none'}. Rule expression: $!.`;}
 }
 else if(matchHashcat(command,'mask')){
  if(stage!=='mask')output=wrongStage('mask');else{const candidates=maskCandidates();const result=await tryCandidates(candidates);for(const id of result.ids)next.recovered=add(next.recovered,id);signal='mask';output=`BROWSER SHA-256: ${result.tested.toLocaleString()} bounded candidates generated (?1=s,u,n; ?d=0–9). Matched: ${result.hits.map(hit=>`${hit.id} → ${hit.candidate}`).join(', ')||'none'}. No GPU, shell or network used.`;}
 }
 else if(command==='john --format=raw-sha256 --wordlist=shortlist.txt hashes.txt'){
  if(stage!=='john')output=wrongStage('john');else{const result=await tryCandidates(eligible);signal='john';output=`JOHN SYNTAX SIMULATOR + BROWSER SHA-256: ${result.tested} candidates checked. Matched: ${result.hits.map(hit=>`${hit.id} → ${hit.candidate}`).join(', ')||'none'}. The real John binary and its potfile are not present.`;}
 }
 else if(command==='policy inspect')accept('defense','inspectPolicy',`ACME-DEMO credential policy: ${next.kdf==='raw-sha256'?'unsalted raw SHA-256':'planned Argon2id with per-user salt'}; ${next.rotated?'fictional credentials rotated':'weak credentials still in use'}. Offline guessing emits no Windows logon events.`);
 else if(command==='policy set kdf argon2id'){
  if(stage!=='defense')output=wrongStage('defense');else{next.kdf='argon2id';next.verified=false;signal='kdf';output='SIMULATED CONTROL: password-storage design marked Argon2id with unique per-user salts. This lab does NOT implement Argon2id hashing. Weak old credentials still require rotation.';}
 }
 else if(command==='policy rotate all'){
  if(stage!=='defense')output=wrongStage('defense');else{next.rotated=true;next.verified=false;signal='rotation';output='SIMULATED CONTROL: all synthetic identities assigned new high-entropy credentials (not displayed or persisted). Existing sessions must be revoked in a real environment; that is outside this standalone case.';}
 }
 else if(command==='policy test'){
  if(stage!=='defense')output=wrongStage('defense');else if(next.kdf!=='argon2id'||!next.rotated)output=`RETEST FAILED: ${next.kdf!=='argon2id'?'modern salted password hashing not configured; ':''}${!next.rotated?'weak known credentials not rotated;':''} both controls are required.`;
  else{next.verified=true;signal='retest';output='SIMULATED RETEST PASS: application policy calls for salted Argon2id, weak credentials rotated. This verifies configuration flags, not actual Argon2id execution or live authentication.';}
 }
 else output='Unknown or unsupported command. Use help, then type the command for your current exercise. File and command names are synthetic.';
 const success=signal!==null;
 if(signal){next.signals=add(next.signals,signal);next.completed=requiredStatus(next);}
 const entry={command,output,success,stage};next.history.push(entry);
 if(next.history.length>55)next.history=next.history.slice(-55);
 if(success)next.commands.push(command);
 if(next.commands.length>40)next.commands=next.commands.slice(-40);
 return {state:next,entry};
}
/** Only known actions are replayed. No command output/claimed completion is trusted from storage. */
export async function restore(input:unknown):Promise<{state:State;notes:string;mode:'guided'|'independent'}>{
 const record=input&&typeof input==='object'&&!Array.isArray(input)?input as Record<string,unknown>:{};
 if(record.version!==1||!Array.isArray(record.commands))return {state:createState(),notes:'',mode:'guided'};
 let state=createState();let previousStage=-1;
 for(const raw of record.commands.slice(0,40)){
  if(typeof raw!=='string'||raw.length>220)continue;
  const result=await execute(state,raw);
  // Do not restore a sequence if it requires skipping past a prior required stage.
  if(!result.entry.success)continue;
  const index=STAGES.findIndex(s=>s.id===result.entry.stage);
  if(index<previousStage)continue;
  previousStage=index;
  state=result.state;
 }
 return {state,notes:typeof record.notes==='string'?record.notes.slice(0,2400):'',mode:record.mode==='independent'?'independent':'guided'};
}
export function savePayload(s:State,notes:string,mode:'guided'|'independent'):{version:1;commands:string[];notes:string;mode:string}{return {version:1,commands:s.commands.slice(0,40),notes:notes.slice(0,2400),mode};}
export function report(s:State,notes:string):string{return `# CyberLab · Password Auditing Session\n\n**Environment:** ACME-DEMO synthetic, authorized and offline\n**Completion:** ${s.completed.length}/${STAGES.length} checkpoints\n**Policy:** ${s.kdf} · Rotated: ${s.rotated} · Retested: ${s.verified}\n\n## Investigation and rationale\n\n${notes.replace(/\r/g,'').slice(0,2400)||'Not supplied.'}\n\n## Verified simulator checkpoints\n\n${STAGES.map(st=>`- [${s.completed.includes(st.id)?'x':' '}] ${st.title}`).join('\n')}\n\n## Commands executed (synthetic inputs only)\n\n\`\`\`text\n${s.commands.join('\n')}\n\`\`\`\n\n## Scope & limitations\n\nThis is a browser-only educational exercise with synthetic SHA-256 fixtures. Hashcat/John are not executed. SHA-256 candidate comparisons are real WebCrypto operations, but benchmarks and Argon2id remediation are modeled. No real credentials or third-party systems were accessed.\n`;}
