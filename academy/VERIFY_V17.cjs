const assert=require('node:assert/strict');
const path=require('node:path'), fs=require('node:fs');
const root=process.argv[2]||'.v17-verify';
const {createAdvancedState,execute,commands,validateChain}=require(path.resolve(root,'pkiadvanced','engine.js'));
const {ADVANCED_DRILLS,TRACKS}=require(path.resolve(root,'pkiadvanced','lessons.js'));
const {recordPractice}=require(path.resolve(root,'pkiadvanced','recall.js'));
let checks=0;function check(v,msg){assert.ok(v,msg);checks++;}
async function run(s,c,expectedCode,successful=true){const r=await execute(s,c);check(r.code===expectedCode,`${c}: expected ${expectedCode}, got ${r.code} (${r.output})`);check(r.ok===successful,`${c}: expected ok=${successful}, got ${r.ok} (${r.output})`);return r;}
async function main(){
 const ids=new Set(ADVANCED_DRILLS.map(x=>x.id));check(ids.size===ADVANCED_DRILLS.length,'unique ids');check(ADVANCED_DRILLS.length>=30,'scope');check(TRACKS.length===4,'four tracks');for(const d of ADVANCED_DRILLS){check(d.command.trim().length>10,d.id);check(['real','model'].includes(d.kind),d.id);check(TRACKS.some(t=>t.id===d.track),d.id);}
 const s=createAdvancedState();await run(s,commands.root,'root');await run(s,commands.intKey,'int-key');await run(s,commands.intCsr,'int-csr');await run(s,commands.intCert,'int-cert');await run(s,commands.serverKey,'server-key');await run(s,commands.serverCsr,'server-csr');await run(s,commands.serverCert,'server-cert');await run(s,commands.clientKey,'client-key');await run(s,commands.clientCsr,'client-csr');await run(s,commands.clientCert,'client-cert');
 check(s.files['root.crt'].includes('BEGIN CERTIFICATE'),'root PEM');check(s.files['intermediate.crt'].includes('BEGIN CERTIFICATE'),'int PEM');check(s.files['server.crt'].includes('BEGIN CERTIFICATE'),'server PEM');check(s.files['client.crt'].includes('BEGIN CERTIFICATE'),'client PEM');check(s.files['client.csr'].includes('BEGIN CERTIFICATE REQUEST'),'client CSR');
 const offline=await run(s,commands.verify,'verify');check(offline.ok,'explicit trust file should not require prior client trust');
 await run(s,commands.inspect,'probe',false);await run(s,commands.trust,'trust');await run(s,commands.inspect,'probe',false);await run(s,commands.chain,'chain');await run(s,commands.inspect,'probe');await run(s,commands.verifyClient,'verify-client');
 const chain=await validateChain(s);check(chain.ok,'chain should validate');
 for(const fault of ['wrong-host','expired','untrusted','revoked','missing-intermediate']){
  await run(s,`lab fault set ${fault}`,'fault');await run(s,commands.inspect,'probe',false);await run(s,'lab fault clear','clear');await run(s,commands.inspect,'probe');
 }
 await run(s,'lab clock --days 60','clock');await run(s,commands.inspect,'probe',false);await run(s,'lab clock --days 0','clock');
 await run(s,'lab mtls on','mtls-on');await run(s,'lab mtls connect','mtls');
 await run(s,'lab ngfw mode off','fw-mode');const opaque=await run(s,commands.fwProbe,'fw-inspect');check(opaque.security===false,'opaque TLS should not claim inspection');
 await run(s,commands.fwForward,'fw-mode');await run(s,commands.fwProbe,'fw-inspect',false);await run(s,commands.fwTrust,'fw-trust');await run(s,commands.fwProbe,'fw-inspect');
 await run(s,'lab fault set untrusted','fault');await run(s,commands.fwProbe,'fw-inspect',false);await run(s,'lab fault clear','clear');
 await run(s,commands.fwInbound,'fw-mode');await run(s,commands.fwProbe,'fw-inspect',false);await run(s,commands.fwInboundKey,'fw-key');await run(s,commands.fwProbe,'fw-inspect');
 await run(s,'api GET /assets','api',false);await run(s,commands.secret,'token');await run(s,'api POST /assets','forbidden',false);await run(s,commands.api,'api',false);await run(s,commands.sync,'sync');await run(s,commands.api,'api');await run(s,commands.rotate,'rotate');await run(s,'secret audit inventory','audit',false);await run(s,commands.sync,'sync');await run(s,commands.revoke,'revoke');await run(s,'secret audit inventory','audit');await run(s,commands.api,'api');
 await run(s,'secret rotate wrong-target','unsupported',false);await run(s,'rm -rf /','unsupported',false);
 let r=recordPractice(undefined,'foo',Date.UTC(2026,1,1),true,false);check(r.independent===1&&r.streak===1,'independent score');check(r.dueAt-r.lastAt===24*3600000,'one day interval');r=recordPractice(r,'foo',r.dueAt,true,false);check(r.streak===2&&r.dueAt-r.lastAt===72*3600000,'three days');r=recordPractice(r,'foo',r.dueAt,true,true);check(r.streak===0&&r.independent===2,'hint resets streak');
 const p='/tmp/cyberlab-pki-v17-openssl';fs.mkdirSync(p,{recursive:true});for(const name of ['root.crt','intermediate.crt','server.crt','client.crt','intermediate.csr','server.csr','client.csr'])fs.writeFileSync(path.join(p,name),s.files[name]);
 console.log(`PASS ${checks} advanced PKI, TLS, NGFW and secrets assertions. Exported 7 demo artifacts to ${p}`);
}
main().catch(e=>{console.error(e);process.exit(1)});
