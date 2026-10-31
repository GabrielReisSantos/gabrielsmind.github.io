import {createLabCA,fingerprint,issueCertificate,makeCSR,makePair,privatePEM,publicPEM,verifyIssued,type Issued,type LabCA} from './pki';
export type LabEvent={at:string;command:string;output:string;event:string;success:boolean};
type LabKey={keys:CryptoKeyPair;pub?:string;csr?:string;dns?:string;subject?:string;cert?:Issued;privateFile:string;publicFile?:string};
type Secret={value:string;scope:string;version:number;revoked:boolean};
export type LabState={ca?:LabCA;keys:Record<string,LabKey>;text:Record<string,string>;aes?:CryptoKey;cipher?:{iv:Uint8Array;value:Uint8Array;text:string};signature?:{key:string;value:Uint8Array;message:string};secrets:Record<string,Secret>;events:LabEvent[]};
export type Result={ok:boolean;event:string;output:string;lessonPass?:boolean};
export const newLab=():LabState=>({keys:{},text:{'message.txt':'approve limited inventory access','settings.json':'{"DATABASE_URL":"postgres://admin:CYBERLAB_FAKE_PASSWORD@db.lab"}','safe.json':'{"DATABASE_URL":"${DATABASE_URL}"}'},secrets:{},events:[]});
const b64=(v:Uint8Array)=>btoa(Array.from(v).map(x=>String.fromCharCode(x)).join(''));
const enc=new TextEncoder();const dec=new TextDecoder();
const hex=(v:Uint8Array)=>Array.from(v).map(x=>x.toString(16).padStart(2,'0')).join('');
const random=(length:number)=>crypto.getRandomValues(new Uint8Array(length));
function args(cmd:string){return (cmd.match(/(?:[^\s"]+|"[^"]*")+/g)??[]).map(v=>v.startsWith('"')&&v.endsWith('"')?v.slice(1,-1):v);}
const has=(a:string[],x:string)=>a.includes(x);
const after=(a:string[],x:string)=>{const i=a.indexOf(x);return i<0?'':a[i+1]??'';};
const dnsPattern=/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;
const log=(s:LabState,cmd:string,result:Result):Result=>{s.events.push({at:new Date().toISOString(),command:cmd,output:result.output.slice(0,3000),event:result.event,success:result.ok});return result;};
export const downloadArtifact=(s:LabState,name:string)=>s.text[name];
export async function runCommand(s:LabState,command:string):Promise<Result>{
 const c=command.trim();if(!c)return {ok:false,event:'empty',output:'Type a command first.'};
 const a=args(c);const fail=(event:string,output:string)=>log(s,c,{ok:false,event,output});const done=(event:string,output:string)=>log(s,c,{ok:true,event,output});
 try{
  if(a[0]==='help')return done('help','Supported: openssl req, genpkey, pkey, x509, verify, dgst, rand; lab nginx; tls handshake; webcrypto aes-key/encrypt/decrypt/ecdh; secret create/use/rotate/revoke/audit/scan.\nOnly restricted training operations are supported. No host shell commands run.');
  if(a[0]==='openssl'&&a[1]==='req'&&has(a,'-x509')){
   if(a[2]!=='-x509'||!has(a,'-newkey')||after(a,'-newkey')!=='ec'||after(a,'-pkeyopt')!=='ec_paramgen_curve:P-256'||after(a,'-keyout')!=='root.key'||after(a,'-out')!=='root.crt'||!has(a,'-nodes'))return fail('ca','Use the root CA command with -newkey ec -pkeyopt ec_paramgen_curve:P-256, root.key, root.crt and -nodes.');
   const cn=after(a,'-subj').replace(/^\/CN=/,'');if(!cn||!after(a,'-subj').startsWith('/CN='))return fail('ca','Specify a /CN= subject.');
   const ca=await createLabCA(cn);s.ca=ca;s.keys={};s.signature=undefined;for(const f of ['server.key','server.pub','server.csr','server.crt'])delete s.text[f];s.text['root.crt']=ca.cert.pem;s.text['root.key']=await privatePEM(ca.keys.privateKey);
   return done('ca','Created a real self-signed X.509 P-256 ECDSA CA certificate and PKCS#8 private key (in browser memory).\nFiles: root.crt, root.key\n'+ca.cert.pem.split('\n').slice(0,3).join('\n')+'\nTraining CA is NOT trusted by your OS/browser.');
  }
  if(a[0]==='openssl'&&a[1]==='genpkey'){
   if(after(a,'-algorithm')!=='EC'||after(a,'-pkeyopt')!=='ec_paramgen_curve:P-256'||after(a,'-out')!=='server.key')return fail('key','Use: openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out server.key');
   const keys=await makePair();s.keys.server={keys,privateFile:'server.key'};s.text['server.key']=await privatePEM(keys.privateKey);delete s.text['server.pub'];delete s.text['server.csr'];delete s.text['server.crt'];
   return done('key','Generated real P-256 ECDSA private/public key pair using WebCrypto. Private PKCS#8 key stored in volatile browser memory; nothing was sent to a server.');
  }
  if(a[0]==='openssl'&&a[1]==='pkey'){
   if(after(a,'-in')!=='server.key'||!has(a,'-pubout')||after(a,'-out')!=='server.pub')return fail('public','Use server.key -pubout -out server.pub');
   const k=s.keys.server;if(!k)return fail('public','Missing server.key. Generate it first.');k.pub=await publicPEM(k.keys.publicKey);s.text['server.pub']=k.pub;
   return done('public',`Exported SPKI public key to server.pub. Safe to distribute a public key:\n${k.pub}`);
  }
  if(a[0]==='openssl'&&a[1]==='req'&&has(a,'-new')){
   if(after(a,'-key')!=='server.key'||after(a,'-out')!=='server.csr')return fail('csr','Use server.key and -out server.csr');
   const k=s.keys.server;if(!k)return fail('csr','Generate server.key first.');const subject=after(a,'-subj').replace(/^\/CN=/,'');const dns=after(a,'-addext').replace(/^subjectAltName=DNS:/,'');
   if(!after(a,'-subj').startsWith('/CN=')||!after(a,'-addext').startsWith('subjectAltName=DNS:')||!dnsPattern.test(dns))return fail('csr','Use a CN and subjectAltName=DNS:training.cyberlab.test');
   k.csr=await makeCSR(subject,k.keys,dns);k.subject=subject;k.dns=dns;s.text['server.csr']=k.csr;
   return done('csr',`Created a real DER-encoded, ECDSA-signed PKCS#10 CSR with DNS SAN ${dns}.\n${k.csr}`);
  }
  if(a[0]==='openssl'&&a[1]==='x509'&&has(a,'-req')){
   if(after(a,'-in')!=='server.csr'||after(a,'-CA')!=='root.crt'||after(a,'-CAkey')!=='root.key'||after(a,'-out')!=='server.crt'||after(a,'-copy_extensions')!=='copy')return fail('issue','Use server.csr signed by root.crt/root.key, output server.crt; include -copy_extensions copy to preserve SAN.');
   const days=Number(after(a,'-days'));if(!Number.isInteger(days)||days<1||days>397)return fail('issue','Choose -days between 1 and 397.');
   const ca=s.ca,k=s.keys.server;if(!ca||!k?.csr||!k.dns||!k.subject)return fail('issue','First create the root CA, server.key and server.csr.');
   k.cert=await issueCertificate(k.subject,k.keys,{name:ca.cert.subject,key:ca.keys.privateKey},days,false,k.dns);s.text['server.crt']=k.cert.pem;
   return done('issue',`Issued a real, CA-signed X.509 TLS leaf certificate. DNS SAN: ${k.dns}, valid ${days} day(s).\n${k.cert.pem}`);
  }
  if(a[0]==='openssl'&&a[1]==='x509'&&has(a,'-text')){
   if(after(a,'-in')!=='server.crt'||!has(a,'-noout'))return fail('inspect','Use -in server.crt -text -noout.');
   const cert=s.keys.server?.cert;if(!cert)return fail('inspect','Issue server.crt first.');
   return done('inspect',`X.509 v3\nIssuer: CN=${cert.issuer}\nSubject: CN=${cert.subject}\nSubject Alternative Name: DNS:${cert.dns}\nPublic Key: EC P-256\nSignature Algorithm: ecdsa-with-SHA256\nExtended Key Usage: TLS Web Server Authentication\nBasic Constraints: CA:FALSE\nNot Before: ${new Date(cert.notBefore).toISOString()}\nNot After : ${new Date(cert.notAfter).toISOString()}\nSHA256 Fingerprint: ${await fingerprint(cert)}`);
  }
  if(a[0]==='openssl'&&a[1]==='verify'){
   if(after(a,'-CAfile')!=='root.crt'||a[a.length-1]!=='server.crt')return fail('verify','Use -CAfile root.crt and server.crt.');
   const hostname=after(a,'-verify_hostname');if(!hostname)return fail('verify','Supply -verify_hostname; issuer verification alone does not check the hostname.');
   if(!s.ca||!s.keys.server?.cert)return fail('verify','Issue the certificate first.');
   const r=await verifyIssued(s.keys.server.cert,s.ca,hostname,true);
   return log(s,c,{ok:r.ok,event:r.ok?'verify':'verify-rejected',output:`signature=${r.signatureOK}, trust=${r.trusted}, time=${r.dateOK}, hostname=${r.dnsOK}\n${r.ok?'server.crt: OK':'Verification FAILED (training subset of X.509 checks, not a full PKIX path validator).'}`});
  }
  if(a[0]==='lab'&&a[1]==='nginx'){
   const host=after(a,'--host');if(after(a,'--cert')!=='server.crt'||after(a,'--key')!=='server.key'||!s.keys.server?.cert||!s.ca)return fail('deploy','Need issued server.crt, matching server.key and root CA.');
   const r=await verifyIssued(s.keys.server.cert,s.ca,host,true);if(!r.ok)return fail('deploy',`Certificate unsuitable for ${host}: hostname=${r.dnsOK}, signature=${r.signatureOK}`);
   return done('deploy',`SIMULATED NGINX CONFIGURATION (not installed):\nserver {\n  listen 443 ssl;\n  server_name ${host};\n  ssl_certificate /etc/nginx/tls/server.crt;\n  ssl_certificate_key /etc/nginx/tls/server.key;\n  ssl_protocols TLSv1.2 TLSv1.3;\n}\nPlace certificates outside web root and restrict private-key permissions. Never deploy lab keys.`);
  }
  if(a[0]==='tls'&&a[1]==='handshake'){
   const host=after(a,'--host');if(after(a,'--trust')!=='root.crt'||!s.ca||!s.keys.server?.cert)return fail('handshake','Load a root CA and an issued server certificate; use --trust root.crt.');
   const vr=await verifyIssued(s.keys.server.cert,s.ca,host,true);if(!vr.ok)return log(s,c,{ok:false,event:'handshake-rejected',output:`Handshake STOPPED: certificate validation failed (trusted=${vr.trusted}, hostname=${vr.dnsOK}, signature=${vr.signatureOK}, time=${vr.dateOK}). A hostname mismatch must not be ignored.`});
   // Real ECDH agreement to demonstrate shared secret; NOT TLS 1.3 key schedule or wire protocol.
   const client=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);const server=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);
   const clientSecret=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:server.publicKey},client.privateKey,256));const serverSecret=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:client.publicKey},server.privateKey,256));
   return done('handshake',`TLS 1.3 CONCEPTUAL WALKTHROUGH — NOT an actual TLS connection:\n1 ClientHello: supported versions, key_share, SNI=${host}\n2 ServerHello: selected cipher suite, ephemeral key share\n3 EncryptedExtensions, Certificate, CertificateVerify, Finished\n4 Client checks trust anchor, DNS SAN, validity, certificate signature\n5 Client Finished; protected application data\nWebCrypto ECDH demo: client/server derived same secret=${hex(clientSecret)===hex(serverSecret)}.\nIMPORTANT: TLS 1.3 uses HKDF transcript-bound keys, authenticated handshake signatures and record AEAD; this demo does not implement the protocol.`);
  }
  if(a[0]==='openssl'&&a[1]==='dgst'&&has(a,'-sign')){
   if(!has(a,'-sha256')||after(a,'-sign')!=='server.key'||after(a,'-out')!=='message.sig'||a[a.length-1]!=='message.txt'||!s.keys.server)return fail('sign','Use openssl dgst -sha256 -sign server.key -out message.sig message.txt');
   const message=s.text['message.txt'];const val=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},s.keys.server.keys.privateKey,enc.encode(message)));
   s.signature={key:'server',value:val,message};return done('sign',`Signed message.txt with ECDSA P-256 / SHA-256. Signature: ${b64(val)}\nPublic key verifies integrity and identity of signer (if trusted); signing does not encrypt the message.`);
  }
  if(a[0]==='openssl'&&a[1]==='dgst'&&has(a,'-verify')){
   if(!has(a,'-sha256')||after(a,'-verify')!=='server.pub'||after(a,'-signature')!=='message.sig'||a[a.length-1]!=='message.txt')return fail('check-sign','Use -verify server.pub -signature message.sig message.txt');
   if(!s.signature||!s.keys.server?.pub)return fail('check-sign','Create public key and signature first.');
   const ok=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},s.keys.server.keys.publicKey,s.signature.value as BufferSource,enc.encode(s.text['message.txt']));
   return log(s,c,{ok,event:ok?'check-sign':'check-sign-failed',output:ok?'Verified OK: exact message bytes unchanged.':'Verification Failure: the signed message has changed.'});
  }
  if(a[0]==='openssl'&&a[1]==='rand'&&a[2]==='-base64'){
   if(Number(a[3])!==32)return fail('rand','Use openssl rand -base64 32');return done('rand',`Generated 32 random bytes with crypto.getRandomValues (real cryptographic randomness).\n${b64(random(32))}\nThis is a demonstration token; do not put generated tokens into a public repository.`);
  }
  if(a[0]==='webcrypto'&&a[1]==='aes-key'){
   if(after(a,'--name')!=='session')return fail('aes-key','Use webcrypto aes-key --name session');
   s.aes=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);s.cipher=undefined;
   return done('aes-key','Generated a genuine non-exportable AES-256-GCM key in browser memory. Encryption is symmetric: the same key decrypts.');
  }
  if(a[0]==='webcrypto'&&a[1]==='encrypt'){
   if(after(a,'--name')!=='session'||!after(a,'--text'))return fail('encrypt','Use webcrypto encrypt --name session --text "confidential incident note"');if(!s.aes)return fail('encrypt','Generate AES key first.');
   const text=after(a,'--text'),iv=random(12);const value=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},s.aes,enc.encode(text)));
   s.cipher={value,iv,text};return done('encrypt',`AES-256-GCM encryption performed.\nNonce (96-bit): ${hex(iv)}\nCiphertext + authentication tag (base64): ${b64(value)}\nNever reuse a nonce with the same AES-GCM key. Authentication rejects tampering.`);
  }
  if(a[0]==='webcrypto'&&a[1]==='decrypt'){
   if(after(a,'--name')!=='session')return fail('decrypt','Use webcrypto decrypt --name session');if(!s.cipher||!s.aes)return fail('decrypt','Encrypt a message first.');
   // WebCrypto requires ArrayBuffer-backed sources; make explicit copies instead of casting
   // Uint8Array<ArrayBufferLike> (which could be SharedArrayBuffer-backed).
   const ivBuffer=new ArrayBuffer(s.cipher.iv.byteLength);
   const ciphertextBuffer=new ArrayBuffer(s.cipher.value.byteLength);
   new Uint8Array(ivBuffer).set(s.cipher.iv);
   new Uint8Array(ciphertextBuffer).set(s.cipher.value);
   const plain=dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ivBuffer},s.aes,ciphertextBuffer));
   return done('decrypt',`Authenticated decryption succeeded. Plaintext: ${plain}`);
  }
  if(a[0]==='webcrypto'&&a[1]==='ecdh'){
   const alice=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);const bob=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);
   const x=hex(new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:bob.publicKey},alice.privateKey,256)));const y=hex(new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:alice.publicKey},bob.privateKey,256)));
   return done('ecdh',`Alice secret = Bob secret: ${x===y}. Real P-256 ECDH keys and derivation.\nECDH supplies shared key material, not authentication by itself. In production use a proper HKDF and authenticated protocol such as TLS 1.3.`);
  }
  if(a[0]==='secret'&&a[1]==='create'){
   const name=after(a,'--name'),scope=after(a,'--scope');if(name!=='inventory'||scope!=='inventory:read')return fail('secret-create','Use secret create --name inventory --scope inventory:read');
   s.secrets[name]={value:b64(random(32)),scope,version:1,revoked:false};return done('secret-create','Created a random demo API secret (masked). Scope: inventory:read; version: 1. Stored in memory only, never sent to any service.');
  }
  if(a[0]==='secret'&&a[1]==='use'){
   const name=after(a,'--name'),scope=after(a,'--scope'),sec=s.secrets[name];if(!sec)return fail('secret-use','No such secret. Create one first.');
   const ok=!sec.revoked&&scope===sec.scope;return log(s,c,{ok,event:ok?'secret-use':'secret-denied',output:ok?`Authorized: ${scope} using demo token v${sec.version} (secret remains masked).`:`DENIED: scope mismatch or revoked token. Requested ${scope}; allowed ${sec.scope}.`});
  }
  if(a[0]==='secret'&&a[1]==='rotate'){
   if(after(a,'--name')!=='inventory'||!s.secrets.inventory)return fail('secret-rotate','Create inventory secret first.');const sec=s.secrets.inventory;sec.value=b64(random(32));sec.version++;sec.revoked=false;
   return done('secret-rotate',`Replaced demo token. New version ${sec.version}. Old token no longer accepted by model. Real rotation also requires updating dependents and revoking previous credentials at the provider.`);
  }
  if(a[0]==='secret'&&a[1]==='revoke'){
   if(after(a,'--name')!=='inventory'||!s.secrets.inventory)return fail('secret-revoke','Create inventory secret first.');s.secrets.inventory.revoked=true;
   return done('secret-revoke','Revoked demo inventory token: subsequent uses will be denied. Real revocation must take place in the issuing service or vault.');
  }
  if(a[0]==='secret'&&a[1]==='scan'){
   const file=after(a,'--file');if(!['settings.json','safe.json'].includes(file))return fail('secret-scan','Scan settings.json or safe.json from the synthetic workspace.');
   const bad=file==='settings.json';return done(bad?'secret-found':'secret-clean',bad?'Secret scanner: 1 possible hardcoded credential in settings.json (masked). Risk: committing a database connection string. Fix: put secret in a trusted server-side secret manager and inject it at runtime. Never place production secrets in Vite client environment variables.':'No hardcoded secret detected in safe.json. Placeholder ${DATABASE_URL} is safe only if resolved server-side, never bundled into public client assets.');
  }
  if(a[0]==='secret'&&a[1]==='audit')return done('secret-audit',s.events.filter(e=>e.event.startsWith('secret-')).map(e=>`${e.at} ${e.event} ${e.success?'PASS':'DENY'}`).join('\n')||'No secret activity yet.');
  if(a[0]==='lab'&&a[1]==='show'){
   const file=a[2];if(!file||!s.text[file])return fail('artifact','Artifact not found. Generate it first.');
   if(file.endsWith('.key')&&!has(a,'--unsafe'))return fail('artifact','Private key withheld. For synthetic lab keys only, add --unsafe to intentionally display it. Never paste genuine private keys into a website.');
   return done('artifact',`${file}:\n${s.text[file]}`);
  }
  return fail('unsupported',`Unsupported command. Type help for the deliberately restricted command list. No shell or network access occurs.`);
 }catch(e){return fail('error',`Operation failed: ${e instanceof Error?e.message:String(e)}`);}
}
