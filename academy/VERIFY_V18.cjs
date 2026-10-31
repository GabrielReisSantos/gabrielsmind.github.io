const assert=require('node:assert/strict');
const path=require('node:path');
const out=process.argv[2]||'.ada-verify';
const {AD_SCENARIOS,getPath}=require(path.resolve(out,'adlab/adEngine.js'));
const {TOPICS,THREATS,KERBEROS_STEPS,NTLM_STEPS,CLI_COMMANDS,simulateADCommand,gradeADInvestigation,authOutcome}=require(path.resolve(out,'adacademy/engine.js'));
let count=0;const ok=(cond,msg)=>{assert.ok(cond,msg);count++};
const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);count++};
ok(TOPICS.length===8,'8 learning topics');
ok(new Set(TOPICS.map(t=>t.id)).size===TOPICS.length,'unique topic ids');
for(const t of TOPICS){ok(t.how.length>=3,`workflow ${t.id}`);ok(t.answers.length===3,`quiz ${t.id}`);ok(t.correct>=0&&t.correct<3,`valid answer ${t.id}`);ok(t.concept.length>90,`substantial lesson ${t.id}`);ok(t.risk.length>40,`risk ${t.id}`);ok(t.defense.length>45,`defense ${t.id}`);}
ok(THREATS.length>=7,'seven threat models');for(const t of THREATS){ok(t.preconditions.length>55,'nontrivial attack prerequisites');ok(t.mitigation.length>48,'specific mitigations');ok(t.telemetry.length>45,'investigative telemetry');}
eq(KERBEROS_STEPS.length,5,'five Kerberos stages');eq(NTLM_STEPS.length,5,'five NTLM stages');
for(const mode of ['kerberos','ntlm']){
 const healthy=authOutcome(mode,'none');eq(healthy.blockedAt,-1,'healthy flow');
 const dns=authOutcome(mode,'dns');eq(dns.blockedAt,0,'DNS discovery failure');
 eq(authOutcome(mode,'authorization').blockedAt,4,'authorization failure only last');
}
eq(authOutcome('kerberos','clock').blockedAt,1,'time skew AS exchange');
eq(authOutcome('kerberos','spn').blockedAt,2,'SPN TGS exchange');
eq(authOutcome('ntlm','clock').blockedAt,-1,'clock not NTLM-failure');
eq(authOutcome('ntlm','spn').blockedAt,-1,'SPN not NTLM-failure');
eq(authOutcome('ntlm','signing').blockedAt,3,'NTLM protection handling');
ok(CLI_COMMANDS.length>=14,'terminal command library');eq(new Set(CLI_COMMANDS.map(c=>c.input.toLowerCase())).size,CLI_COMMANDS.length,'no duplicate commands');
for(const scenario of AD_SCENARIOS){
 ok(getPath(scenario,[])?.length>0,`start path ${scenario.id}`);
 const clean=scenario.edges.filter(e=>e.weak).map(e=>e.id);
 eq(getPath(scenario,clean),null,'narrow repair stops path');
 ok(getPath(scenario,clean,scenario.legitSource,scenario.target)!==null,'legitimate path retained');
 const commands=CLI_COMMANDS.filter(c=>!['help','graph','controls'].includes(c.id));
 for(const cmd of commands){const result=simulateADCommand(cmd.input,scenario,[]);ok(!('error' in result),`cmd recognized ${cmd.id}`);ok('output' in result&&result.output.length>6,'has meaningful output');}
 const aclInput='Get-Acl "AD:\\CN=svc-inventory,OU=Services,DC=corp,DC=cyberlab,DC=test"';
 const before=simulateADCommand(aclInput,scenario,[]);const after=simulateADCommand(aclInput,scenario,clean);
 ok(!('error' in before),'ACL fixture command');ok(!('error' in after),'ACL after fix');
 const pinned=[{id:'whoami',category:'identity',revision:0,output:'analyst'}, {id:scenario.id==='gpo'?'gpoperms':scenario.id==='spn'?'spn':'acl',category:scenario.id==='gpo'?'permissions':scenario.id==='spn'?'service':'permissions',revision:0,output:'synthetic'}];
 const validRetest={revision:1,reachable:false,approved:true};
 const text='The directory permission creates a conditional privilege path. These artifacts show the role membership and delegated rights; the repair removes only excessive control.';
 const candidate=gradeADInvestigation(scenario,clean,true,pinned,scenario.answer,validRetest,1,text);
 ok(candidate.ok,`safe repair passes ${scenario.id}: ${candidate.reason}`);
 ok(!gradeADInvestigation(scenario,[],true,pinned,scenario.answer,validRetest,1,text).ok,'unfixed rejected');
 ok(!gradeADInvestigation(scenario,clean,false,pinned,scenario.answer,validRetest,1,text).ok,'no baseline rejected');
 ok(!gradeADInvestigation(scenario,clean,true,[pinned[0]],scenario.answer,validRetest,1,text).ok,'one observation rejected');
 ok(!gradeADInvestigation(scenario,clean,true,pinned,scenario.answer,validRetest,2,text).ok,'stale retest rejected');
 ok(!gradeADInvestigation(scenario,clean,true,pinned,scenario.answer,null,1,text).ok,'missing retest rejected');
 ok(!gradeADInvestigation(scenario,clean,true,pinned,(scenario.answer+1)%3,validRetest,1,text).ok,'wrong diagnosis rejected');
 ok(!gradeADInvestigation(scenario,clean,true,pinned,scenario.answer,validRetest,1,'Too short').ok,'low quality note rejected');
 const wrongPinned=[{id:'dc',category:'discovery',revision:0,output:'srv'}, {id:'srv',category:'discovery',revision:0,output:'srv'}];
 ok(!gradeADInvestigation(scenario,clean,true,wrongPinned,scenario.answer,validRetest,1,text).ok,'single evidence category rejected');
 const unrelated=[{id:'whoami',category:'identity',revision:0,output:'analyst'}, {id:'tickets',category:'authentication',revision:0,output:'synthetic'}];
 ok(!gradeADInvestigation(scenario,clean,true,unrelated,scenario.answer,validRetest,1,text).ok,'unrelated evidence rejected');
}
for(const disallowed of ['powershell -enc Zg==','Get-ADUser -Filter * | Invoke-Expression','net user /domain','whoami /groups && echo foo','']){ok('error' in simulateADCommand(disallowed,AD_SCENARIOS[0],[]),'unsupported code not executed')}
console.log(`AD Academy v1.8: ${count} assertions passed`);
