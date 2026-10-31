/** Regress the evidence gates and actual shared forwarding behavior without npm dependencies. */
const assert=require('node:assert/strict');
const path=require('node:path');
const root=process.argv[2]||'.incident-verify';
const eng=require(path.resolve(root,'investigation/incidentEngine.js'));
const net=require(path.resolve(root,'threeD/topologyEngine.js'));
let passed=0;
function check(label,fn){try{fn();passed++;process.stdout.write(`PASS ${label}\n`);}catch(e){console.error(`FAIL ${label}`);throw e;}}
function report(s){return {...s,diagnosis:'policy-shadow',analysis:'EV-002 proves the broad deny rule is first; the narrow HTTPS permit never matches, because first match stops processing.',impact:'Approved analyst HTTPS traffic to DMZ is unavailable; there is no proof of application compromise.',remediation:'Move specific-https above broad-deny, keeping other denied traffic denied by default.',retest:'EV-004 shows approved HTTPS delivery, while EV-005 confirms guest access is still denied.'};}
function withCitations(s){return {...s,citations:{root:s.evidence.find(e=>e.command==='show policies')?.id||'',success:s.evidence.find(e=>e.kind==='retest')?.id||'',isolation:s.evidence.find(e=>e.kind==='isolation')?.id||''}};}
let topology=eng.initialTopology();let state=eng.initialCase();
check('starts with the expected environment',()=>{assert.equal(topology.sceneId,'segments');assert.equal(topology.revision,0);});
check('baseline is blocked by shadowed policy',()=>{const result=eng.runProbes(topology);assert.equal(result.positive.pass,false);assert.equal(result.positive.code,'policy-deny');assert.equal(result.negative.every(x=>!x.pass),true);});
check('initial workflow cannot be marked complete',()=>{assert.equal(eng.assessIncident(state,topology).complete,false);});
state=eng.captureBaseline(state,topology,eng.runProbes(topology));
check('failed baseline is pinned with immutable revision',()=>{assert.equal(state.evidence.length,1);assert.equal(state.evidence[0].kind,'baseline');assert.equal(state.evidence[0].passed,false);assert.equal(state.evidence[0].revision,0);});
state=eng.captureDiagnostic(state,topology,'show policies');state=eng.captureDiagnostic(state,topology,'show routes');
check('captured policy output contains rule order',()=>{assert.match(state.evidence.find(e=>e.command==='show policies').output,/broad-deny[\s\S]*specific-https/);});
check('diagnostic requirements can be proven independently',()=>{let a=eng.assessIncident(state,topology);assert.equal(a.gates.policyEvidence,true);assert.equal(a.gates.crossSourceDiagnostics,true);assert.equal(a.gates.changedConfig,false);});
const t0=topology;topology=net.moveRule(topology,'specific-https',-1);state=eng.logAction(state,topology.revision,'Moved specific-https before broad deny');
check('moving specific allow restores expected flow',()=>{assert.equal(net.evaluate(topology).secure,true);assert.equal(eng.policyIsNarrow(topology),true);});
check('captured output is not silently recalculated after changes',()=>{assert.equal(state.evidence.find(e=>e.command==='show policies').revision,0);assert.equal(topology.revision,1);assert.notEqual(eng.runProbes(t0).positive.pass,eng.runProbes(topology).positive.pass);});
check('configuration change alone cannot complete the exercise',()=>{assert.equal(eng.assessIncident(state,topology).complete,false);assert.equal(eng.assessIncident(state,topology).gates.positiveRetest,false);});
state=eng.captureRetest(state,topology,eng.runProbes(topology));
check('positive and isolation evidence are tied to the current revision',()=>{const a=eng.assessIncident(state,topology);assert.equal(a.gates.positiveRetest,true);assert.equal(a.gates.isolationProof,true);assert.equal(state.evidence.filter(e=>e.kind==='isolation').length,2);});
check('a correct diagnosis and freeform prose alone cannot pass without citations',()=>{const s=report(state);assert.equal(eng.assessIncident(s,topology).gates.technicalReport,false);assert.equal(eng.assessIncident(s,topology).gates.evidenceCitations,false);});
state=withCitations(report(state));
check('all evidence-gated conditions can complete the case',()=>{const a=eng.assessIncident(state,topology);assert.equal(a.complete,true);assert.equal(a.score,100);assert.equal(a.allSafe,true);});
check('Markdown report contains actual synthetic evidence and limitations',()=>{const text=eng.reportMarkdown(state,topology);assert.match(text,/# INC-0042/);assert.match(text,/show policies/);assert.match(text,/No production system was tested/);assert.match(text,/Selected evidence references/);});
const corrupted=net.editRule(topology,'broad-deny',{action:'allow'});
check('broad permit repair is rejected despite connectivity',()=>{const a=eng.assessIncident(state,corrupted);assert.equal(a.complete,false);assert.equal(a.gates.narrowPolicy,false);assert.equal(a.gates.positiveRetest,false);assert.equal(a.allSafe,false);});
const severed=net.editCable(topology,topology.cables[0].id,false);
check('disabled cable invalidates post-change packet success',()=>{const a=eng.assessIncident(state,severed);assert.equal(a.gates.positiveRetest,false);assert.equal(a.complete,false);});
const reapply=net.moveRule(net.moveRule(topology,'specific-https',1),'specific-https',-1);
check('a semantically equivalent but new revision requires a fresh retest',()=>{const a=eng.assessIncident(state,reapply);assert.equal(a.gates.narrowPolicy,true);assert.equal(a.gates.positiveRetest,false);});
check('false evidence citation fails despite unchanged correct solution',()=>{const invalid={...state,citations:{...state.citations,root:state.citations.success}};assert.equal(eng.assessIncident(invalid,topology).gates.evidenceCitations,false);});
check('incorrect diagnosis cannot pass with otherwise valid evidence',()=>{const bad={...state,diagnosis:'dns'};assert.equal(eng.assessIncident(bad,topology).gates.correctDiagnosis,false);});
check('stored shared topology can be loaded without modifying it',()=>{const reader={getItem:(k)=>k===eng.SHARED_TOPOLOGY_KEY?JSON.stringify(topology):null};assert.deepEqual(eng.readSharedTopology(reader),JSON.parse(JSON.stringify(topology)));});
check('missing or damaged data safely falls back to baseline',()=>{assert.equal(eng.readSharedTopology({getItem:()=>'{corrupted'}).revision,0);assert.equal(eng.readCase({getItem:()=>'{corrupted'}).evidence.length,0);});
check('stored case can be recovered with evidence and citations',()=>{const s=eng.readCase({getItem:k=>k===eng.INCIDENT_KEY?JSON.stringify(state):null});assert.equal(s.citations.success,state.citations.success);assert.equal(s.evidence.length,state.evidence.length);});
check('diagnostics and simulation decisions use the same model',()=>{assert.match(net.diagnostic(topology,'show policies'),/specific-https[\s\S]*broad-deny/);assert.equal(eng.deterministicOutcome(topology).evaluation.secure,true);});
check('external v0.8 route modification changes simulated flow',()=>{const off=net.editRoute(topology,'r-dmz',{via:'database'});assert.equal(eng.runProbes(off).positive.pass,false);});
console.log(`\nCyberLab v1.2: ${passed} incident and shared-model assertions passed`);
