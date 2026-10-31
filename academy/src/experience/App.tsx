import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {Activity,ArrowLeft,BookOpen,Boxes,Crosshair,Workflow,ChevronDown,GraduationCap,Home,Menu,PanelLeftClose,PanelLeftOpen,Shield,TrendingUp,HelpCircle,X} from 'lucide-react';
import {storeLocation} from '../learning/progress';
import {DifficultySelector,useDifficulty} from '../challenge/DifficultyProvider';
import Dashboard from './Dashboard';
import {Catalog,ProgressOverview} from './Catalog';
import {isAppRoute,isLabRoute,LAB_ROUTES,routeGroup,routeLabel,routesFor,type AppRoute} from './routes';
import LabErrorBoundary from './LabErrorBoundary';
import '../shell.css';
import './experience.css';
import '../ngfw/ngfw.css';
const HowToUse=lazy(()=>import('./HowToUse'));
const FoundationsHub=lazy(()=>import('../foundations/FoundationsHub'));
const NgfwWorkspace=lazy(()=>import('../ngfw/NgfwWorkspace'));
const PacketStudio=lazy(()=>import('../advanced/PacketStudio'));
const CertificationCenter=lazy(()=>import('../certification/CertificationCenter'));
const PentestAcademy=lazy(()=>import('../pentest/PentestAcademy'));
const PasswordLab=lazy(()=>import('../password/PasswordLab'));
const SecretsAtlas=lazy(()=>import('../secrets/SecretsAtlas'));
const TroubleshootingLab=lazy(()=>import('../deep/TroubleshootingLab'));
const MissionControl=lazy(()=>import('../pentest/deep/MissionControl'));
const WebPlayground=lazy(()=>import('../webplay/WebPlayground'));
const ADAcademy=lazy(()=>import('../adacademy/ADAcademy'));
const PurpleLab=lazy(()=>import('../purple/PurpleLab'));
const UnifiedRange=lazy(()=>import('../unified/UnifiedRange'));
const ConnectedCampaign=lazy(()=>import('../campaign/ConnectedCampaign'));
const MissionRoom=lazy(()=>import('../missionroom/MissionRoom'));
const SystemsExplorer=lazy(()=>import('../explorer/SystemsExplorer'));
const CorrelationWorkbench=lazy(()=>import('../correlation/CorrelationWorkbench'));
const WorldLab=lazy(()=>import('../threeD/WorldLab'));
const IncidentWorkbench=lazy(()=>import('../investigation/IncidentWorkbench'));
const PracticeWorkbench=lazy(()=>import('../pentest/practice/PracticeWorkbench'));
const InvestigationWorkbench=lazy(()=>import('../investigation2/InvestigationWorkbench'));
const primary=[{id:'home',label:'Home',icon:Home},{id:'campaign',label:'Campaign Room',icon:Crosshair},{id:'explorer',label:'Systems Explorer',icon:Workflow},{id:'missionroom',label:'Mission Room',icon:Crosshair},{id:'learn',label:'Learn',icon:BookOpen},{id:'labs',label:'Labs',icon:Boxes},{id:'investigate',label:'Investigate',icon:Shield},{id:'certifications',label:'Certifications',icon:GraduationCap},{id:'progress',label:'My Progress',icon:TrendingUp},{id:'guide',label:'How to Use',icon:HelpCircle}] as const;
type PrimaryId=typeof primary[number]['id'];
function currentRoute():AppRoute {const path=window.location.hash.slice(1).replace(/^\//,'').split('/')[0];return path&&isAppRoute(path)?path:'home';}
export default function App(){
 const [page,setPage]=useState<AppRoute>(currentRoute);const [mobileOpen,setMobileOpen]=useState(false);const [collapsed,setCollapsed]=useState(false);
 const [opened,setOpened]=useState<PrimaryId|null>(null);const navigationRef=useRef<HTMLElement>(null);const menuButtonRef=useRef<HTMLButtonElement>(null);const {mode}=useDifficulty();
 useEffect(()=>{const listener=()=>{const next=currentRoute();setPage(next);setMobileOpen(false);if(isLabRoute(next))storeLocation(next);};listener();window.addEventListener('hashchange',listener);return()=>window.removeEventListener('hashchange',listener);},[]);
 useEffect(()=>{document.title=`${page==='home'?'Dashboard':routeLabel(page)} | CyberLab Interactive`;},[page]);
 useEffect(()=>{if(!mobileOpen)return;const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  navigationRef.current?.querySelector<HTMLButtonElement>('.shell-close-mobile')?.focus();
  const stop=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();setMobileOpen(false);return;}
   if(e.key!=='Tab')return;
   const focusable=Array.from(navigationRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]')??[]).filter(el=>el.getClientRects().length>0);
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  };
  window.addEventListener('keydown',stop);
  return()=>{window.removeEventListener('keydown',stop);if(previous&&previous.isConnected)previous.focus();else menuButtonRef.current?.focus();};
 },[mobileOpen]);
 const section=routeGroup(page);const activePrimary=page==='campaign'?'campaign':page==='explorer'?'explorer':page==='missionroom'?'missionroom':section==='certifications'?'certifications':section;
 function navigate(dest:AppRoute|'certifications'){const target=dest==='certifications'?'certification':dest;if(isLabRoute(target))storeLocation(target);setPage(target);setMobileOpen(false);setOpened(null);if(window.location.hash!==`#${target}`)window.location.hash=target;window.scrollTo({top:0,behavior:'auto'});if(!mobileOpen)document.getElementById('page-content')?.focus();}
 function navPrimary(id:PrimaryId){navigate(id);if(['learn','labs','investigate'].includes(id))setOpened(id);}
 const expand=opened??(isLabRoute(page)?activePrimary:null);
 return <div className={`cyber-root shell ux-shell ${collapsed?'shell-collapsed':''}`}>
  <button className="shell-skip" onClick={()=>document.getElementById('page-content')?.focus()}>Skip to main content</button>
  {mobileOpen&&<button aria-label="Close navigation" className="shell-scrim" onClick={()=>setMobileOpen(false)}/>}
  <aside ref={navigationRef} className={`shell-sidebar ${mobileOpen?'open':''}`} aria-label="Application navigation">
   <div className="shell-brand"><div className="shell-brand-mark"><Shield size={23}/></div><div className="shell-brand-copy"><strong>CYBER<span>LAB</span></strong><small>INTERACTIVE ACADEMY</small></div><button className="shell-close-mobile" onClick={()=>setMobileOpen(false)} aria-label="Close menu"><X size={20}/></button></div>
   <nav className="shell-side-body" aria-label="Main sections"><div className="ux-nav-heading">WORKSPACE</div>
    {primary.map(item=>{const Icon=item.icon;const active=activePrimary===item.id;const children=item.id==='learn'||item.id==='labs'||item.id==='investigate'?routesFor(item.id).filter(id=>id!=='missionroom'&&id!=='campaign'):[];return <div key={item.id} className="ux-nav-group"><button className={`shell-link ux-primary-nav ${active?'active':''}`} title={item.label} aria-current={active&&(!isLabRoute(page)||(page==='missionroom'||page==='explorer'||page==='campaign'))?'page':undefined} onClick={()=>navPrimary(item.id)}><Icon size={19}/><span>{item.label}</span>{children.length>0&&<ChevronDown className={`ux-nav-chevron ${expand===item.id?'expanded':''}`} size={15}/>}</button>{children.length>0&&expand===item.id&&<div className="ux-subnav">{children.map(id=><button className={`ux-subnav-link ${page===id?'active':''}`} key={id} aria-current={page===id?'page':undefined} title={LAB_ROUTES[id].label} onClick={()=>navigate(id)}>{LAB_ROUTES[id].label}</button>)}</div>}</div>;})}
   </nav><div className="shell-side-bottom"><div className="shell-side-status"><span className="ux-status-dot"/><div><strong>Local training environment</strong><small>Simulated labs · No backend</small></div></div><span className="shell-side-version">CYBERLAB V3.0 · CONNECTED CAMPAIGNS</span></div>
  </aside>
  <div className="shell-content" id="page-content" tabIndex={-1}>
   <header className="shell-topbar"><div className="shell-topbar-left"><button ref={menuButtonRef} className="shell-mobile-menu" onClick={()=>setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen}><Menu size={21}/></button><button className="shell-collapse" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'}>{collapsed?<PanelLeftOpen size={20}/>:<PanelLeftClose size={20}/>}</button><span className="shell-breadcrumb"><span>CyberLab</span><ChevronDown size={12} className="shell-breadcrumb-chevron"/><span>{activePrimary==='home'?'Workspace':primary.find(i=>i.id===activePrimary)?.label}</span><span className="shell-breadcrumb-slash">/</span><strong>{routeLabel(page)}</strong></span></div><div className="shell-topbar-actions"><span className="shell-local-pill"><Activity size={14}/> Simulated locally</span><DifficultySelector/></div></header>
   <div className="shell-page" key={page}><LabErrorBoundary key={page} route={page} onReturn={()=>navigate('home')}><Suspense fallback={<div className="ux-loading" role="status"><span className="ux-spinner"/> Preparing your workbench…</div>}>
    {page==='home'&&<Dashboard onNavigate={navigate}/>}
    {page==='learn'&&<Catalog section="learn" onNavigate={navigate}/>}
    {page==='labs'&&<Catalog section="labs" onNavigate={navigate}/>}
    {page==='investigate'&&<Catalog section="investigate" onNavigate={navigate}/>}
    {page==='guide'&&<HowToUse onNavigate={navigate}/>}
    {page==='progress'&&<ProgressOverview onNavigate={navigate}/>}
    {isLabRoute(page)&&<div className="shell-page-crumb"><button onClick={()=>navigate(routeGroup(page))}><ArrowLeft size={14}/> Back to {primary.find(i=>i.id===routeGroup(page))?.label}</button><span>/</span><span>{routeLabel(page)}</span></div>}
    {page==='world'&&<WorldLab key={mode} onLaunch={navigate} onOpenIncident={()=>navigate('incident')}/>}
    {page==='foundation'&&<FoundationsHub/>}
    {page==='ngfw'&&<NgfwWorkspace/>}
    {page==='troubleshoot'&&<TroubleshootingLab key={mode}/>}
    {page==='studio'&&<PacketStudio/>}
    {page==='passwords'&&<PasswordLab onBack={()=>navigate('pentest')} onSecrets={()=>navigate('secrets')}/>}
    {page==='secrets'&&<SecretsAtlas onBack={()=>navigate('pentest')}/>}
    {page==='pentest'&&<PentestAcademy onOpenPasswords={()=>navigate('passwords')} onOpenSecrets={()=>navigate('secrets')} onOpenMissions={()=>navigate('missions')} onOpenWeb={()=>navigate('webplay')} onOpenAD={()=>navigate('adlab')} onOpenPractice={()=>navigate('practice')}/>}
    {page==='certification'&&<CertificationCenter onGoToStudio={()=>navigate('studio')}/>}
    {page==='missions'&&<MissionControl key={mode} onBack={()=>navigate('pentest')}/>}
    {page==='webplay'&&<WebPlayground key={mode}/>}
    {page==='adlab'&&<ADAcademy key={mode} onOpenPurple={()=>navigate('purple')}/>}
    {page==='purple'&&<PurpleLab key={mode}/>}
    {page==='unified'&&<UnifiedRange key={mode}/>}
    {page==='campaign'&&<ConnectedCampaign key={mode}/>}
    {page==='missionroom'&&<MissionRoom key={mode}/>}
    {page==='explorer'&&<SystemsExplorer key={mode}/>}
    {page==='correlation'&&<CorrelationWorkbench/>}
    {page==='incident'&&<IncidentWorkbench key={mode} onOpenRange={()=>navigate('world')}/>}
    {page==='practice'&&<PracticeWorkbench key={mode} onBack={()=>navigate('pentest')}/>}
    {page==='investigation2'&&<InvestigationWorkbench key={mode} onBack={()=>navigate('pentest')}/>}
   </Suspense></LabErrorBoundary></div>
  </div>
 </div>;
}
