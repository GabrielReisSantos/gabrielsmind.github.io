/** PKI and network behavior are intentionally separated: actual demo X.509 artifacts use WebCrypto,
 * simulated TLS, PAN-OS-style policy and secrets flows do not execute network connections.
 * The command interpreter accepts a limited, exact documented subset of OpenSSL-like syntax. */
import {createLabCA,makePair,makeCSR,makeCACSR,issueCertificate,privatePEM,type Issued,type LabCA} from '../crypto/pki';
export type Fault='none'|'missing-intermediate'|'wrong-host'|'expired'|'untrusted'|'revoked';
export type InspectionMode='off'|'forward-proxy'|'inbound-inspection';
export type KeyIdentity={key:CryptoKeyPair;csr?:string;cert?:Issued};
export type Token={id:string;version:number;scope:'inventory:read'|'inventory:write';revoked:boolean};
export type PkiEvent={command:string;ok:boolean;code:string;output:string};
export type AdvancedState={root?:LabCA;intermediate?:KeyIdentity;server?:KeyIdentity;client?:KeyIdentity;files:Record<string,string>;fault:Fault;serverChain:boolean;rootTrusted:boolean;mtls:boolean;clockDays:number;inspection:InspectionMode;forwardTrusted:boolean;inboundKey:boolean;tokens:Token[];clientVersion:number|null;audit:PkiEvent[]};
export type Outcome={ok:boolean;code:string;output:string;security:boolean};
export const createAdvancedState=():AdvancedState=>({files:{'intermediate.ext':'basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign,cRLSign\n','server.ext':'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=serverAuth\n','client.ext':'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=clientAuth\n'},fault:'none',serverChain:false,rootTrusted:false,mtls:false,clockDays:0,inspection:'off',forwardTrusted:false,inboundKey:false,tokens:[],clientVersion:null,audit:[]});
const split=(line:string)=>line.match(/"[^"]*"|'[^']*'|\S+/g)?.map(s=>s.replace(/^['"]|['"]$/g,''))??[];
const flag=(a:string[],k:string)=>{const i=a.indexOf(k);return i<0?'':a[i+1]??''};
const has=(a:string[],k:string)=>a.includes(k);
const fail=(code:string,output:string):Outcome=>({ok:false,code,output,security:false});
const ok=(code:string,output:string,security=true):Outcome=>({ok:true,code,output,security});
const hostname='app.cyberlab.test';
export const commands={
 root:'openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout root.key -out root.crt -subj "/CN=CyberLab Root CA" -days 365',
 intKey:'openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out intermediate.key',
 intCsr:'openssl req -new -key intermediate.key -subj "/CN=CyberLab Intermediate CA" -out intermediate.csr',
 intCert:'openssl x509 -req -in intermediate.csr -CA root.crt -CAkey root.key -out intermediate.crt -days 180 -extfile intermediate.ext',
 serverKey:'openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out server.key',
 serverCsr:'openssl req -new -key server.key -subj "/CN=app.cyberlab.test" -addext "subjectAltName=DNS:app.cyberlab.test" -out server.csr',
 serverCert:'openssl x509 -req -in server.csr -CA intermediate.crt -CAkey intermediate.key -out server.crt -days 30 -copy_extensions copy -extfile server.ext',
 clientKey:'openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out client.key',
 clientCsr:'openssl req -new -key client.key -subj "/CN=ops-client" -out client.csr',
 clientCert:'openssl x509 -req -in client.csr -CA intermediate.crt -CAkey intermediate.key -out client.crt -days 30 -extfile client.ext',
 verify:'openssl verify -CAfile root.crt -untrusted intermediate.crt -verify_hostname app.cyberlab.test server.crt',
 verifyClient:'openssl verify -purpose sslclient -CAfile root.crt -untrusted intermediate.crt client.crt',
 trust:'lab trust root.crt',chain:'lab server-chain intermediate.crt',
 inspect:'openssl s_client -connect app.cyberlab.test:443 -servername app.cyberlab.test -showcerts',
 mtls:'lab mtls on',
 fwForward:'lab ngfw mode forward-proxy',fwTrust:'lab ngfw forward-trust on',
 fwInbound:'lab ngfw mode inbound-inspection',fwInboundKey:'lab ngfw inbound-key server.key',
 fwProbe:'lab ngfw inspect app.cyberlab.test',
 secret:'secret issue inventory:read',api:'api GET /assets',rotate:'secret rotate inventory',sync:'api client-sync inventory',revoke:'secret revoke inventory'
} as const;
export async function validateChain(s:AdvancedState,client=false,explicitTrust=false,fullChainFromFile=false){
 const now=Date.now()+s.clockDays*86400000;
 const leaf=client?s.client?.cert:s.server?.cert;
 const i=s.intermediate?.cert,root=s.root?.cert;
 if(!leaf||!i||!root||!s.root||!s.intermediate)return {ok:false,reason:'missing certificates',signature:false,validity:false,trust:false,hostname:false,eku:false};
 const verify=async(key:CryptoKey,cert:Issued)=>crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,cert.signature as BufferSource,cert.tbs as BufferSource);
 const signature=await verify(s.intermediate.key.publicKey,leaf)&&await verify(s.root.keys.publicKey,i)&&await verify(s.root.keys.publicKey,root);
 const validity=[leaf,i,root].every(c=>now>=c.notBefore&&now<=c.notAfter);
 const trust=(s.rootTrusted||explicitTrust)&&s.fault!=='untrusted';
 const hostOK=client?true:s.fault!=='wrong-host'&&leaf.dns===hostname;
 const chainOK=(s.serverChain||client||fullChainFromFile)&&(s.fault!=='missing-intermediate'||fullChainFromFile);
 const notRevoked=s.fault!=='revoked';
 const notExpired=s.fault!=='expired'&&validity;
 const result=signature&&notExpired&&trust&&hostOK&&chainOK&&notRevoked;
 return {ok:result,reason:!signature?'invalid signature':!notExpired?'certificate expired':!trust?'untrusted root':!hostOK?'hostname mismatch':!chainOK?'missing intermediate':!notRevoked?'revoked by simulated status':'verified',signature,validity:notExpired,trust,hostname:hostOK,eku:true};
}
const standardKey=(a:string[],out:string)=>a[0]==='openssl'&&a[1]==='genpkey'&&flag(a,'-algorithm')==='EC'&&flag(a,'-pkeyopt')==='ec_paramgen_curve:P-256'&&flag(a,'-out')===out;
function serialize(s:AdvancedState){return {fault:s.fault,chain:s.serverChain,rootTrusted:s.rootTrusted,mtls:s.mtls,inspection:s.inspection,forwardTrusted:s.forwardTrusted,inboundKey:s.inboundKey,tokenVersions:s.tokens.map(t=>t.version)};}
export async function execute(s:AdvancedState,cmd:string):Promise<Outcome>{
 const input=cmd.trim(),a=split(input);if(!input)return fail('empty','Type a command.');
 let r:Outcome;
 try {r=await dispatch(s,a);}catch(error){r=fail('error',error instanceof Error?error.message:String(error));}
 s.audit.push({command:input,ok:r.ok,code:r.code,output:r.output.slice(0,1200)});
 if(s.audit.length>200)s.audit.shift();return r;
}
async function dispatch(s:AdvancedState,a:string[]):Promise<Outcome>{
 if(a[0]==='help')return ok('help',Object.entries(commands).map(([k,v])=>`${k}: ${v}`).join('\n'));
 if(a[0]==='openssl'&&a[1]==='req'&&has(a,'-x509')){
  if(flag(a,'-keyout')!=='root.key'||flag(a,'-out')!=='root.crt'||flag(a,'-pkeyopt')!=='ec_paramgen_curve:P-256'||!has(a,'-nodes')||flag(a,'-subj')!=='/CN=CyberLab Root CA'||flag(a,'-days')!=='365'||flag(a,'-newkey')!=='ec')return fail('syntax','Create the lab root with P-256, root.key, root.crt, CN and -nodes.');
  s.root=await createLabCA('CyberLab Root CA');s.files['root.key']=await privatePEM(s.root.keys.privateKey);s.files['root.crt']=s.root.cert.pem;return ok('root','Real self-signed root X.509 created. Root pathLenConstraint=1; OS trust is NOT configured.');
 }
 if(standardKey(a,'intermediate.key')){s.intermediate={key:await makePair()};s.files['intermediate.key']=await privatePEM(s.intermediate.key.privateKey);return ok('int-key','Real P-256 intermediate private key generated in browser memory.');}
 if(a[0]==='openssl'&&a[1]==='req'&&has(a,'-new')&&flag(a,'-key')==='intermediate.key'&&flag(a,'-out')==='intermediate.csr'&&flag(a,'-subj')==='/CN=CyberLab Intermediate CA'){
  if(!s.intermediate)return fail('dependency','Generate intermediate.key first.');s.intermediate.csr=await makeCACSR('CyberLab Intermediate CA',s.intermediate.key);s.files['intermediate.csr']=s.intermediate.csr;return ok('int-csr','Real PKCS#10 intermediate CSR signed.');
 }
 if(a[0]==='openssl'&&a[1]==='x509'&&has(a,'-req')&&flag(a,'-in')==='intermediate.csr'&&flag(a,'-CA')==='root.crt'&&flag(a,'-CAkey')==='root.key'&&flag(a,'-extfile')==='intermediate.ext'&&flag(a,'-out')==='intermediate.crt'&&flag(a,'-days')==='180'){
  if(!s.root||!s.intermediate?.csr)return fail('dependency','Generate root CA and intermediate CSR first.');
  s.intermediate.cert=await issueCertificate('CyberLab Intermediate CA',s.intermediate.key,{name:s.root.cert.subject,key:s.root.keys.privateKey},180,true,undefined,0);s.files['intermediate.crt']=s.intermediate.cert.pem;return ok('int-cert','Real X.509 Intermediate CA certificate issued; CA:TRUE, pathLen:0, signed by root.');
 }
 for(const [name,output] of [['server','server.key'],['client','client.key']] as const){if(standardKey(a,output)){
  const pair={key:await makePair()};s[name]=pair;s.files[output]=await privatePEM(pair.key.privateKey);return ok(`${name}-key`,`Real ${name} keypair generated; private key remains in session memory.`);
 }}
 if(a[0]==='openssl'&&a[1]==='req'&&has(a,'-new')&&flag(a,'-key')==='server.key'&&flag(a,'-out')==='server.csr'&&flag(a,'-addext')==='subjectAltName=DNS:app.cyberlab.test'&&flag(a,'-subj')==='/CN=app.cyberlab.test'){
  if(!s.server)return fail('dependency','Generate server.key.');s.server.csr=await makeCSR(hostname,s.server.key,hostname);s.files['server.csr']=s.server.csr;return ok('server-csr','Real server CSR with DNS Subject Alternative Name.');
 }
 if(a[0]==='openssl'&&a[1]==='req'&&has(a,'-new')&&flag(a,'-key')==='client.key'&&flag(a,'-out')==='client.csr'&&flag(a,'-subj')==='/CN=ops-client'){
  if(!s.client)return fail('dependency','Generate client.key.');s.client.csr=await makeCACSR('ops-client',s.client.key);s.files['client.csr']=s.client.csr;return ok('client-csr','Real signed client CSR created.');
 }
 if(a[0]==='openssl'&&a[1]==='x509'&&has(a,'-req')&&flag(a,'-CA')==='intermediate.crt'&&flag(a,'-CAkey')==='intermediate.key'&&s.intermediate?.cert){
  if(flag(a,'-in')==='server.csr'&&flag(a,'-out')==='server.crt'&&flag(a,'-extfile')==='server.ext'&&flag(a,'-copy_extensions')==='copy'&&flag(a,'-days')==='30'){
   if(!s.server?.csr)return fail('dependency','Create server CSR first.');s.server.cert=await issueCertificate(hostname,s.server.key,{name:s.intermediate.cert.subject,key:s.intermediate.key.privateKey},30,false,hostname);s.files['server.crt']=s.server.cert.pem;return ok('server-cert','Real TLS server leaf signed by intermediate with serverAuth EKU and DNS SAN.');
  }
  if(flag(a,'-in')==='client.csr'&&flag(a,'-out')==='client.crt'&&flag(a,'-extfile')==='client.ext'&&flag(a,'-days')==='30'){
   if(!s.client?.csr)return fail('dependency','Create client CSR first.');s.client.cert=await issueCertificate('ops-client',s.client.key,{name:s.intermediate.cert.subject,key:s.intermediate.key.privateKey},30,false,undefined,0,'client');s.files['client.crt']=s.client.cert.pem;return ok('client-cert','Real TLS client leaf signed by intermediate; clientAuth EKU, not serverAuth.');
  }
 }
 if(a[0]==='lab'&&a[1]==='trust'&&a[2]==='root.crt'){
  if(!s.root)return fail('dependency','Create root CA.');s.rootTrusted=true;return ok('trust','Trust installed ONLY in simulated browser client, NOT in OS trust store.');
 }
 if(a[0]==='lab'&&a[1]==='server-chain'&&a[2]==='intermediate.crt'){
  if(!s.intermediate?.cert)return fail('dependency','Issue intermediate first.');s.serverChain=true;return ok('chain','Server now presents leaf + intermediate in simulated TLS handshake.');
 }
 if(a[0]==='lab'&&a[1]==='fault'&&a[2]==='set'&&['missing-intermediate','wrong-host','expired','untrusted','revoked'].includes(a[3])){
  s.fault=a[3] as Fault;return ok('fault',`Injected ${s.fault} (simulated only).`);
 }
 if(a.join(' ')==='lab fault clear'){s.fault='none';return ok('clear','Fault cleared. Existing state unchanged.');}
 if(a[0]==='lab'&&a[1]==='clock'&&a[2]==='--days'&&/^\d{1,3}$/.test(a[3]??'')){
  s.clockDays=Number(a[3]);return ok('clock',`Simulated wall-clock advanced ${s.clockDays} days; real certificate dates not modified.`);
 }
 if(a[0]==='openssl'&&a[1]==='verify'&&a[a.length-1]==='server.crt'&&flag(a,'-CAfile')==='root.crt'&&flag(a,'-untrusted')==='intermediate.crt'&&flag(a,'-verify_hostname')===hostname){
  const r=await validateChain(s,false,true,true);return r.ok?ok('verify','server.crt: OK (teaching subset; chain signatures, dates, hostname, trust).'):fail('verify',`Verification failed: ${r.reason}.`);
 }
 if(a[0]==='openssl'&&a[1]==='verify'&&a[a.length-1]==='client.crt'&&flag(a,'-purpose')==='sslclient'&&flag(a,'-CAfile')==='root.crt'&&flag(a,'-untrusted')==='intermediate.crt'){
  const r=await validateChain(s,true,true,true);return r.ok?ok('verify-client','client.crt: OK (clientAuth EKU modeled).'):fail('verify-client',`Client verification failed: ${r.reason}.`);
 }
 if(a[0]==='openssl'&&a[1]==='s_client'&&flag(a,'-connect')==='app.cyberlab.test:443'&&flag(a,'-servername')===hostname){
  const r=await validateChain(s);return r.ok?ok('probe',`SIMULATED s_client (no socket): TLSv1.3; SNI=${hostname}; chain leaf+intermediate; verification: OK; certificate-authenticated handshake modeled.`):fail('probe',`SIMULATED s_client (no socket): handshake rejected — ${r.reason}.\nStage: ${r.reason==='hostname mismatch'?'certificate name verification':r.reason==='missing intermediate'?'chain construction':'certificate validation'}.`);
 }
 if(a.join(' ')==='lab mtls on'){s.mtls=true;return ok('mtls-on','Synthetic service requires a client certificate; TLS server authentication still required.');}
 if(a[0]==='lab'&&a[1]==='mtls'&&a[2]==='connect'){
  const server=await validateChain(s),client=await validateChain(s,true);
  return server.ok&&(!s.mtls||client.ok)?ok('mtls',`SIMULATED mutual TLS accepted; server=${server.reason}; client=${s.mtls?client.reason:'not requested'}`):fail('mtls',`SIMULATED handshake denied: server=${server.reason}, client=${s.mtls?client.reason:'not required'}`);
 }
 if(a[0]==='lab'&&a[1]==='ngfw'&&a[2]==='mode'&&['off','forward-proxy','inbound-inspection'].includes(a[3])){
  s.inspection=a[3] as InspectionMode;return ok('fw-mode',`NGFW decryption mode: ${s.inspection}. Synthetic policy only.`);
 }
 if(a.join(' ')==='lab ngfw forward-trust on'){s.forwardTrusted=true;return ok('fw-trust','Client trusts simulated Forward Trust CA; Forward Untrust remains deliberately untrusted.');}
 if(a.join(' ')==='lab ngfw inbound-key server.key'){
  if(!s.server)return fail('dependency','Create server key first.');s.inboundKey=true;return ok('fw-key','Simulated inbound-inspection server private key configured. Never upload real production keys into browser training.');
 }
 if(a[0]==='lab'&&a[1]==='ngfw'&&a[2]==='inspect'){
  const upstream=await validateChain(s);const mode=s.inspection;
  if(mode==='off')return ok('fw-inspect','No decrypt policy: TLS payload opaque to firewall; metadata-only logging (not malware-content inspection).',false);
  if(mode==='forward-proxy'){
   if(!s.forwardTrusted)return fail('fw-inspect','Client does not trust Forward Trust CA; forward proxy certificate rejected.');
   if(!upstream.ok)return fail('fw-inspect',`Upstream certificate ${upstream.reason}; simulated Forward Untrust must NOT be imported into client trust store.`);
   return ok('fw-inspect','Forward proxy: synthetic client↔NGFW TLS and NGFW↔server TLS, inspection visible, traffic re-encrypted.');
  }
  if(!s.inboundKey)return fail('fw-inspect','Inbound inspection requires the matching server certificate private key in this model.');
  if(!upstream.ok)return fail('fw-inspect',`Inbound inspection blocked by upstream certificate condition: ${upstream.reason}.`);
  return ok('fw-inspect','Inbound inspection: server private key configured; content inspection modeled for inbound TLS (NOT real decryption).');
 }
 if(a[0]==='secret'&&a[1]==='issue'&&a[2]==='inventory:read'){
  const v=Math.max(0,...s.tokens.map(t=>t.version))+1;s.tokens.push({id:'inventory',version:v,scope:'inventory:read',revoked:false});return ok('token',`Issued synthetic inventory:read credential v${v}. Actual token bytes not exposed or persisted.`);
 }
 if(a.join(' ')==='api GET /assets'){
  const token=s.tokens.find(t=>t.version===s.clientVersion&&!t.revoked);
  return token?ok('api','HTTP/1.1 200 OK\n[{"id":"srv01","type":"server"},{"id":"fw01","type":"ngfw"}]'):fail('api','HTTP/1.1 401 Unauthorized\nClient has no active synchronized credential.');
 }
 if(a.join(' ')==='api POST /assets')return fail('forbidden','HTTP/1.1 403 Forbidden\nThe client must not use inventory:read to write.');
 if(a.join(' ')==='secret rotate inventory'){
  const active=s.tokens.filter(t=>!t.revoked);if(!active.length)return fail('token','No active token to rotate.');
  const v=Math.max(...s.tokens.map(t=>t.version))+1;s.tokens.push({id:'inventory',version:v,scope:'inventory:read',revoked:false});return ok('rotate',`New version v${v} active; old remains temporarily valid for zero-downtime consumer migration. Sync client then revoke old.`);
 }
 if(a.join(' ')==='api client-sync inventory'){
  const active=s.tokens.filter(t=>!t.revoked);if(!active.length)return fail('api','No valid token available.');s.clientVersion=active.at(-1)!.version;return ok('sync',`Client now uses inventory token v${s.clientVersion}. No credential value printed.`);
 }
 if(a.join(' ')==='secret revoke inventory'){
  const latest=s.tokens.at(-1);if(!latest)return fail('token','No tokens.');
  const old=s.tokens.find(t=>t.version===latest.version-1);if(!old)return fail('token','No older token to revoke; first rotate, then sync.');old.revoked=true;return ok('revoke',`Revoked stale v${old.version}; current client v${s.clientVersion??'unset'}.`);
 }
 if(a.join(' ')==='secret audit inventory'){
  const current=s.tokens.find(t=>t.version===s.clientVersion&&!t.revoked);
  const stale=s.tokens.some(t=>t.version!==s.clientVersion&&!t.revoked);
  return current&&!stale?ok('audit','Secrets lifecycle verified: consumer uses current scoped token and no stale credential remains.'):fail('audit',`Audit incomplete: active consumer=${!!current}; stale active token=${stale}.`);
 }
 if(a[0]==='lab'&&a[1]==='status')return ok('status',JSON.stringify(serialize(s),null,2));
 return fail('unsupported','Unsupported or incorrect command. This is an isolated training interpreter, not an OS shell. Type help for supported examples.');
}
