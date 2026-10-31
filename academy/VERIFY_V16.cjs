const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');const child=require('node:child_process');
const p=process.argv[2]||'.crypto-verify';
const {newLab,runCommand}=require(path.resolve(p,'engine.js'));
const {CRYPTO_LESSONS}=require(path.resolve(p,'lessons.js'));
const {verifyIssued}=require(path.resolve(p,'pki.js'));
let checked=0;const ok=(v,msg)=>{assert.ok(v,msg);checked++;};
const run=async(s,cmd,event,success=true)=>{const r=await runCommand(s,cmd);assert.equal(r.event,event,`${cmd}: ${r.output}`);assert.equal(r.ok,success,`${cmd}: ${r.output}`);checked+=2;return r;};
(async()=>{
 ok(CRYPTO_LESSONS.length===23,'23 lessons');
 ok(new Set(CRYPTO_LESSONS.map(l=>l.id)).size===CRYPTO_LESSONS.length,'unique lessons');
 for(const l of CRYPTO_LESSONS){ok(l.command.length>10,`Command: ${l.id}`);ok(l.why.length>50,`Teaching: ${l.id}`);ok(['pki','tls','keys','secrets'].includes(l.track),'track');}
 const s=newLab();
 const order=['pki01','pki02','pki03','pki04','pki05','pki06','pki07','pki08','tls01','tls02','keys01','keys02','keys03','keys04','keys05','keys06','keys07','secrets01','secrets02','secrets03','secrets04','secrets05','secrets06'];
 for(const id of order){const l=CRYPTO_LESSONS.find(x=>x.id===id);const result=await run(s,l.command,l.event,!['handshake-rejected','secret-denied'].includes(l.event));if(id==='pki04')ok(s.text['server.csr'].includes('BEGIN CERTIFICATE REQUEST'),'genuine CSR');if(id==='pki05')ok(s.text['server.crt'].includes('BEGIN CERTIFICATE'),'genuine certificate');if(id==='keys05')ok(result.output.includes('Nonce')&&s.cipher.value.length>0,'AES ciphertext');if(id==='keys07')ok(result.output.includes('true'),'ECDH both peers equal');}
 ok(s.secrets.inventory.revoked,'revocation persisted');
 const trusted=await verifyIssued(s.keys.server.cert,s.ca,'training.cyberlab.test',true);ok(trusted.ok,'valid real signature and correct DNS SAN');
 const untrusted=await verifyIssued(s.keys.server.cert,s.ca,'training.cyberlab.test',false);ok(!untrusted.ok&&!untrusted.trusted,'untrusted issuer rejected');
 const expired=await verifyIssued(s.keys.server.cert,s.ca,'training.cyberlab.test',true,s.keys.server.cert.notAfter+1000);ok(!expired.ok&&!expired.dateOK,'expired cert rejected');
 const altered={...s.keys.server.cert,tbs:new Uint8Array(s.keys.server.cert.tbs)};altered.tbs[altered.tbs.length-2]^=1;ok(!(await verifyIssued(altered,s.ca,'training.cyberlab.test',true)).signatureOK,'tampered certificate TBS rejected');
 const wrongScope=await run(s,'secret use --name inventory --scope inventory:write','secret-denied',false);ok(!wrongScope.ok,'write remains denied');
 const clean=await run(s,'secret scan --file safe.json','secret-clean');ok(clean.output.includes('No hardcoded secret'),'safe file no fake leak');
 s.text['message.txt']='altered message';await run(s,CRYPTO_LESSONS.find(l=>l.id==='keys02').command,'check-sign-failed',false);s.text['message.txt']='approve limited inventory access';
 const unknown=await run(s,'lab show missing.crt','artifact',false);ok(!unknown.ok,'unknown artifact blocked');
 const failHost=await run(s,'openssl verify -CAfile root.crt -verify_hostname fake.cyberlab.test server.crt','verify-rejected',false);ok(failHost.output.includes('hostname=false'),'reject mismatch');
 const failure=await run(s,'secret use --name inventory --scope inventory:read','secret-denied',false);ok(failure.output.includes('DENIED'),'revoke blocks read');
 await run(s,'openssl verify -CAfile root.crt server.crt','verify',false);
 await run(s,'lab show server.key','artifact',false);
 await run(s,'wget https://example.org','unsupported',false);
 ok(s.events.length>=23,'auditable command history');
 // Use OpenSSL on the generated real PEM and CSR when installed, not just our JS verifier.
 const openssl=child.spawnSync('openssl',['version'],{encoding:'utf8'});
 if(openssl.status===0){const folder=fs.mkdtempSync('/tmp/cyberlab-pki-v16-');try{
   for(const name of ['root.crt','root.key','server.crt','server.csr','server.key','server.pub'])fs.writeFileSync(path.join(folder,name),s.text[name]);
   const verify=child.spawnSync('openssl',['verify','-CAfile',path.join(folder,'root.crt'),'-verify_hostname','training.cyberlab.test',path.join(folder,'server.crt')],{encoding:'utf8'});ok(verify.status===0,`OpenSSL rejects cert: ${verify.stderr}`);
   const csr=child.spawnSync('openssl',['req','-in',path.join(folder,'server.csr'),'-verify','-noout'],{encoding:'utf8'});ok(csr.status===0,`OpenSSL rejects CSR: ${csr.stderr}`);
   const check=child.spawnSync('openssl',['pkey','-in',path.join(folder,'server.key'),'-check','-noout'],{encoding:'utf8'});ok(check.status===0,`OpenSSL rejects key: ${check.stderr}`);
   const mismatch=child.spawnSync('openssl',['verify','-CAfile',path.join(folder,'root.crt'),'-verify_hostname','intruder.cyberlab.test',path.join(folder,'server.crt')],{encoding:'utf8'});ok(mismatch.status!==0,'OpenSSL rejects wrong SAN');
 }finally{fs.rmSync(folder,{recursive:true,force:true});}}
 console.log(`CyberLab v1.6 crypto: ${checked} assertions passed; genuine PEM/CSR compatibility verified${openssl.status!==0?' (OpenSSL binary not found: external checks skipped)':''}.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
