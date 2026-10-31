import {useEffect,useState} from 'react';
import {ArrowRight,Activity,Boxes,ChevronRight,ClipboardCheck,Code2,Compass,ExternalLink,FileSearch,GraduationCap,Layers3,Network,Play,Route,Shield,Terminal,Target,Zap} from 'lucide-react';
import {useDifficulty} from './challenge/DifficultyProvider';
import {readLearningProgress,readSavedLocation,EXERCISE_TOTALS,type LearningProgress,type SavedLocation,type DestinationId} from './learning/progress';
import {ALL_UNITS} from './pentest/blueprint';
import {routeLabel} from './experience/routes';
import './dashboard.css';
import ProgressBackup from './learning/ProgressBackup';
import {CODING_LESSONS} from './foundations/coding/lessons';
import {CRYPTO_LESSONS} from './foundations/crypto/lessons';
import {ADVANCED_DRILLS} from './foundations/pkiadvanced/lessons';

export type Destination=DestinationId;
type Progress=LearningProgress;
function countAcademyLocal(key:string,valid:string[]):number{try{const v=JSON.parse(localStorage.getItem(key)??'[]');return Array.isArray(v)?new Set(v.filter((x:unknown)=>typeof x==='string'&&valid.includes(x))).size:0;}catch{return 0;}}
const AD_CONCEPT_IDS=['structure','dns','ldap','kerberos','ntlm','acl','gpo','paths'];
const AD_CASE_IDS=['acl','spn','gpo'];
function snapshot(mode:string):{progress:Progress;last:SavedLocation|null}{
 try{return {progress:readLearningProgress(localStorage,mode),last:readSavedLocation(localStorage)};}
 catch{return {progress:readLearningProgress({getItem:()=>null},mode),last:null};}
}
const tracks:[{name:string;desc:string;icon:typeof Network;id:Destination;tag:string;color:string;count:(p:Progress)=>number;total:number},...Array<{name:string;desc:string;icon:typeof Network;id:Destination;tag:string;color:string;count:(p:Progress)=>number;total:number}>]=[
 {name:'Network foundations',desc:'CCNA fundamentals, routing and Zero Trust.',icon:Network,id:'foundation',tag:'START HERE',color:'cyan',count:p=>p.ccnaDrills,total:EXERCISE_TOTALS.ccnaDrills},
 {name:'Active Directory Academy',desc:'Domains, DNS, LDAP, Kerberos, NTLM, GPOs and identity abuse paths.',icon:Layers3,id:'adlab',tag:'NEW · AD FUNDAMENTALS',color:'mint',count:()=>countAcademyLocal('cyberlab-v18-ad-lessons',AD_CONCEPT_IDS),total:8},
 {name:'Coding foundations',desc:'Type Python, C# and HTTP/API requests.',icon:Code2,id:'foundation',tag:'NEW · CODING',color:'mint',count:p=>p.codingPracticed,total:CODING_LESSONS.length},
 {name:'TLS, Certificates & Secrets',desc:'Build real certificates and keys; practice TLS and safe secret handling.',icon:Shield,id:'foundation',tag:'NEW · CRYPTO',color:'cyan',count:p=>p.cryptoPracticed,total:CRYPTO_LESSONS.length},
 {name:'PKI & TLS Engineering',desc:'Issue full CA chains; troubleshoot mTLS, NGFW decryption, secrets and API rotation.',icon:Shield,id:'foundation',tag:'V1.7 · HANDS-ON',color:'mint',count:p=>p.pkiAdvancedIndependent,total:ADVANCED_DRILLS.length},
 {name:'NGFW & troubleshooting',desc:'Stateful traffic, App-ID, NAT and incident diagnosis.',icon:Shield,id:'troubleshoot',tag:'BLUE TEAM',color:'mint',count:p=>p.troubleshootValidated,total:EXERCISE_TOTALS.troubleshoot},
 {name:'Purple Team Lab',desc:'Attack a fictional AD environment, inspect logs, tune detections and retest defenses.',icon:Shield,id:'purple',tag:'V1.9 · RED + BLUE',color:'mint',count:()=>countAcademyLocal('cyberlab-v19-purple-completed',['kerberos','delegation','gpo']),total:3},
 {name:'Penetration testing',desc:'OSCP methodology, evidence and browser-based missions.',icon:Target,id:'pentest',tag:'RED TEAM',color:'orange',count:p=>p.oscpReviewed,total:ALL_UNITS.length},
 {name:'Certification academy',desc:'Original practice aligned to three Palo Alto blueprints.',icon:GraduationCap,id:'certification',tag:'STUDY TRACK',color:'purple',count:p=>p.certCorrect,total:0},
];
export default function Dashboard({onNavigate}:{onNavigate:(page:Destination)=>void}){
 const {mode}=useDifficulty();
 const [state,setState]=useState(()=>snapshot(mode));
 useEffect(()=>{
  const refresh=()=>setState(snapshot(mode));
  refresh();window.addEventListener('cyberlab:progress',refresh);window.addEventListener('storage',refresh);
  return ()=>{window.removeEventListener('cyberlab:progress',refresh);window.removeEventListener('storage',refresh);};
 },[mode]);
 const {progress,last}=state;
 const verified=countAcademyLocal('cyberlab-v18-ad-completed',AD_CASE_IDS)+progress.incidentValidated+progress.practiceValidated+progress.investigation2Validated+progress.ccnaDrills+progress.topologyValidated+progress.ngfwValidated+progress.webValidated+progress.adValidated+progress.troubleshootValidated+progress.oscpValidated+countAcademyLocal('cyberlab-v19-purple-completed',['kerberos','delegation','gpo']);
 const hasActivity=!!last||progress.ccnaReviewed>0||progress.certAttempted>0||progress.oscpReviewed>0||verified>0;
 const resume:Destination=last?.page??'foundation';
 const resumeLabel=last?.page==='pentest'&&last.detail?'Continue last pentest unit':last?.page==='world'&&last.detail?'Return to last topology':last?'Resume '+routeLabel(last.page):'Start learning';
 return <main className="dashboard" id="page-main" tabIndex={-1}>
  <div className="dash-heading"><div><span className="dash-kicker"><span className="dash-signal"/> INDEPENDENT CYBERSECURITY LEARNING</span><h1>Build real understanding.<br/><em>One investigation at a time.</em></h1><p>Explore networks, investigate security failures, and practice technical reasoning in an interactive browser-only cyber range.</p><div className="dash-actions"><button className="dash-btn-primary" onClick={()=>onNavigate(hasActivity?resume:'foundation')}><Play size={17} fill="currentColor"/> {resumeLabel} <ArrowRight size={16}/></button><button className="dash-btn-secondary" onClick={()=>onNavigate('world')}><Boxes size={18}/> Explore 3D Cyber Range</button></div></div>
   <div className="dash-art" aria-hidden="true"><div className="dash-art-glow"/><svg viewBox="0 0 480 310" role="img"><defs><linearGradient id="daStroke" x1="0" x2="1"><stop stopColor="#39deb0"/><stop offset="1" stopColor="#38aed5"/></linearGradient></defs><g stroke="#1c3d51" fill="none" strokeWidth="1"><path d="M10 255L239 127L466 255L239 302Z"/><path d="M10 212L239 85L466 212L239 260Z"/><path d="M10 170L239 42L466 170L239 219Z"/></g><path d="M130 186L241 119L348 184L242 245Z" fill="#123344" stroke="#347c83" strokeWidth="1.8"/><path d="M130 186V202L242 260V245M348 184V202L242 260" fill="#0c2a36" stroke="#347c83" strokeWidth="1"/>
     <path d="M241 115L241 67M241 115L119 177M241 115L364 180M241 115L304 220" stroke="url(#daStroke)" strokeWidth="2" strokeDasharray="5 6" opacity=".8"/>
     <g fill="#102b3b" stroke="#5fbab3" strokeWidth="1.6"><rect x="198" y="98" width="86" height="38" rx="6"/><rect x="91" y="170" width="56" height="32" rx="4"/><rect x="339" y="165" width="56" height="35" rx="4"/><rect x="277" y="214" width="58" height="35" rx="4"/></g>
     <g fill="#7deec4"><rect x="212" y="109" width="8" height="8" rx="2"/><rect x="225" y="109" width="8" height="8" rx="2"/><rect x="238" y="109" width="8" height="8" rx="2"/><circle cx="267" cy="116" r="3"/><circle cx="110" cy="185" r="4"/><circle cx="356" cy="180" r="4"/><circle cx="296" cy="231" r="4"/></g>
     <g fill="#b5dcd9" fontSize="10" fontFamily="sans-serif" letterSpacing="1"><text x="212" y="91">NGFW</text><text x="96" y="164">CLIENT</text><text x="350" y="156">DMZ</text><text x="283" y="206">SOC</text></g><circle cx="241" cy="67" r="8" fill="#29e7b1" opacity=".1" stroke="#4af6ca"/><circle cx="241" cy="67" r="3" fill="#64f5c9"/>
    </svg><span className="dash-art-caption"><Activity size={13}/> SIMULATED NETWORK · LIVE LOGIC</span></div>
  </div>
  <section className="dash-overview" aria-label="Your progress"><div><span>YOUR WORKSPACE</span><strong>{last?'Welcome back':hasActivity?'Practice in progress':'Ready when you are'}</strong><small>{hasActivity?'Practice activity stored on this device':'No account or setup required'}</small></div><div><span>VERIFIED ACTIVITIES</span><strong>{verified}</strong><small>Validated exercises (not course mastery)</small></div><div><span>NETWORK DRILLS</span><strong>{Math.min(progress.ccnaDrills,4)} <i>/ 4</i></strong><small>Interactive CCNA workbenches</small></div><div><span>CODING PRACTICE</span><strong>{progress.codingPracticed} <i>/ {CODING_LESSONS.length}</i></strong><small>{progress.codingPythonExecuted} Python executed; C# reference-only</small></div><div><span>CERTIFICATION PRACTICE</span><strong>{progress.certCorrect} <i>/ {progress.certAttempted} correct</i></strong><small>Correct / attempted certification questions</small></div></section>
  <section className="dash-section"><div className="dash-section-heading"><div><span className="dash-kicker">STRUCTURED LEARNING</span><h2>Choose your learning path</h2><p>Start with fundamentals, or jump into an investigation that matches your skills.</p></div><button onClick={()=>onNavigate('foundation')}>View foundations <ChevronRight size={16}/></button></div>
   <div className="dash-course-grid">{tracks.map(t=>{const Icon=t.icon;const denominator=t.id==='certification'?progress.certTotal:t.total;const completed=Math.min(t.count(progress),denominator);return <button key={t.name} className={`dash-course dash-${t.color}`} onClick={()=>{if(t.name==='Coding foundations'||t.name==='TLS, Certificates & Secrets'||t.name==='PKI & TLS Engineering')try{localStorage.setItem('cyberlab-v11-detail-foundation',t.name==='Coding foundations'?'coding':t.name==='PKI & TLS Engineering'?'pki-advanced':'crypto');}catch{/* ignore */}onNavigate(t.id);}}><span className="dash-course-top"><span className="dash-course-icon"><Icon size={22}/></span><span className="dash-course-label">{t.tag}</span></span><strong>{t.name}</strong><span className="dash-course-desc">{t.desc}</span><span className="dash-course-bottom"><span><span className="dash-course-track"><i style={{width:`${denominator>0?100*completed/denominator:0}%`}}/></span><small>{completed}/{denominator} {t.id==='certification'?'correct answers':t.id==='pentest'?'units self-reviewed':t.id==='adlab'?'concept checks passed':'validated example exercises'}</small></span><ArrowRight size={19}/></span></button>})}</div>
  </section>
  <section className="dash-section"><div className="dash-section-heading"><div><span className="dash-kicker">HANDS-ON PRACTICE</span><h2>Open a workbench</h2><p>Each environment is simulated locally, with no real packets or vulnerable targets.</p></div></div>
   <div className="dash-lab-grid">{[
    {id:'investigation2' as Destination,icon:Terminal,name:'CASE-001: Investigation Engine 2.0',desc:'Stateful terminal, branching clues, safe remediation, evidence-linked report.',tag:'FEATURED · V1.4'},
    {id:'unified' as Destination,icon:Network,name:'Unified Cyber Range',desc:'Cross-module enterprise: AD, native NGFW, 3D links, correlated logs and remediation.',tag:'CONNECTED · V2.3'},
    {id:'incident' as Destination,icon:FileSearch,name:'INC-0042: Firewall Outage',desc:'Investigate a real shared topology, pin evidence, fix policy and retest safely.',tag:'FEATURED CASE'},
    {id:'foundation' as Destination,icon:Code2,name:'Coding Foundations',desc:`Type Python, C# and HTTP requests across ${CODING_LESSONS.length} drills.`,tag:'NEW · CODING'},
    {id:'foundation' as Destination,icon:Shield,name:'TLS, Certificates & Secrets',desc:`Type and verify ${CRYPTO_LESSONS.length} cryptography and secrets exercises.`,tag:'NEW · CRYPTO'},
    {id:'foundation' as Destination,icon:Shield,name:'PKI & TLS Engineering',desc:`${ADVANCED_DRILLS.length} typed drills: intermediate CA, mTLS, NGFW decryption and API credential rotation.`,tag:'NEW · V1.7'},
    {id:'world' as Destination,icon:Boxes,name:'3D Network Range',desc:'Rewire devices, test routes and inspect packet paths.',tag:'3D TOPOLOGY'},
    {id:'studio' as Destination,icon:Route,name:'Packet Studio',desc:'Follow TCP state, application detection and NAT.',tag:'NGFW TRAFFIC'},
    {id:'webplay' as Destination,icon:Code2,name:'HTTP Playground',desc:'Investigate synthetic web requests and vulnerabilities.',tag:'PENTEST'},
    {id:'purple' as Destination,icon:Shield,name:'Purple Team Lab',desc:'Simulate AD abuse, inspect telemetry, tune detections, harden controls and replay.',tag:'NEW · RED + BLUE'},
    {id:'adlab' as Destination,icon:Layers3,name:'Active Directory Academy',desc:'Understand AD, DNS, LDAP, Kerberos, NTLM and investigate abuse paths.',tag:'NEW · AD ACADEMY'},
    {id:'practice' as Destination,icon:Target,name:'OSCP Deep Practice',desc:'Five replayable, evidence-driven remediation investigations.',tag:'NEW · OSCP'},
    {id:'missions' as Destination,icon:FileSearch,name:'OSCP Missions',desc:'Collect evidence, verify impact and write findings.',tag:'INVESTIGATION'},
    {id:'correlation' as Destination,icon:Terminal,name:'Traffic Correlation',desc:'Diagnose failures through events and firewall logs.',tag:'TROUBLESHOOT'}
   ].map(l=>{const Icon=l.icon;return <button key={l.id} onClick={()=>{if(l.name==='Coding Foundations'||l.name==='TLS, Certificates & Secrets'||l.name==='PKI & TLS Engineering')try{localStorage.setItem('cyberlab-v11-detail-foundation',l.name==='Coding Foundations'?'coding':l.name==='PKI & TLS Engineering'?'pki-advanced':'crypto');}catch{/* ignore */}onNavigate(l.id);}} className="dash-lab"><span><Icon size={20}/><small>{l.tag}</small></span><strong>{l.name}</strong><p>{l.desc}</p><span className="dash-lab-link">Open workbench <ArrowRight size={14}/></span></button>})}</div>
  </section>
  <div className="dash-info"><div><Compass size={20}/><span><strong>Designed for learning, not exploitation.</strong><small>Everything is synthetic and runs in your browser. Exam practice is independent and is not affiliated with Cisco, Palo Alto Networks, or OffSec.</small></span></div><div><ClipboardCheck size={19}/><span><strong>Progress stays on this device</strong><small>Browser storage is not an account. Clearing it can remove your local progress.</small></span></div></div>
  <ProgressBackup/>
  <footer className="dash-footer"><span>CYBERLAB INTERACTIVE · V2.3.1</span><span><Zap size={13}/> LEARN · INVESTIGATE · DEFEND</span><a href="https://www.gabrielreissantos.com/" target="_blank" rel="noreferrer">Portfolio <ExternalLink size={13}/></a></footer>
 </main>;
}
