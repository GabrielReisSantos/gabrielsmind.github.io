/** Correlated SYNTHETIC events are generated directly from the v0.5 troubleshooting engine. */
import {runProbe,type TroubleshootCase,type StepStatus} from '../deep/troubleshootEngine';
export type TimelineSource='CLIENT'|'DNS'|'SWITCH'|'ROUTER'|'NAT'|'SECURITY'|'SESSION'|'APP-ID'|'CONTENT'|'TRAFFIC';
export type CorrelatedEvent={id:string;flowId:string;offsetMs:number;timestamp:string;source:TimelineSource;stage:string;status:StepStatus;detail:string;tuple:string;rule:string;decision:string};
const SOURCE:Record<string,TimelineSource>={source:'CLIENT',dns:'DNS',access:'SWITCH',trunk:'SWITCH',fib:'ROUTER',ingress:'NAT',dnat:'NAT',zones:'SECURITY',policy:'SECURITY',session:'SESSION',syn:'SESSION',synack:'SESSION',appid:'APP-ID',tls:'CONTENT',visibility:'CONTENT',prevention:'CONTENT',tcp:'SESSION',completion:'TRAFFIC'};
function tupleFor(c:TroubleshootCase){const parts:Record<string,string>={dns:'10.10.10.11:51001 → app.lab.test:443',vlan:'10.20.10.44 → 10.20.10.1 ICMP',route:'10.10.10.10:51002 → 10.50.10.25:443',nat:'198.51.100.25:53011 → 203.0.113.20:443',policy:'10.10.10.11:52111 → 10.40.10.20:443',appid:'10.10.10.12:52112 → portal.lab.test:443',return:'10.10.10.12:52113 → 10.20.10.20:443',decrypt:'10.10.10.15:52114 → update.lab.test:443'};return parts[c.id]??'fictional flow';}
export function buildTimeline(c:TroubleshootCase,value:string,runIndex=0):{events:CorrelatedEvent[];result:ReturnType<typeof runProbe>}{
 const result=runProbe(c,value);const flowId=`LAB-${c.id.toUpperCase()}-${String(runIndex+1).padStart(3,'0')}`;
 const events=result.trace.map((step,i)=>{
 const source=SOURCE[step.id]??'TRAFFIC';const offsetMs=i*120+(source==='APP-ID'?180:0);const time=new Date(Date.UTC(2026,9,29,8,0,0,0)+offsetMs).toISOString().split('T')[1].replace('Z','');
 return {id:`${flowId}:${step.id}`,flowId,offsetMs,timestamp:`08:${time.slice(3)}`,source,stage:step.name,status:step.status,detail:step.detail,tuple:tupleFor(c),rule:step.id==='policy'?'first-match security rule':step.id==='dnat'?'ordered DNAT match':step.id==='fib'?'longest-prefix match':'stage-specific check',decision:step.status==='fail'?'Failure / denial':step.status==='warn'?'Visibility gap':step.status==='skip'?'Not evaluated':'Passed / observed'} as CorrelatedEvent;
 });
 return {result,events};
}
export function pivotalEvents(previous:CorrelatedEvent[],current:CorrelatedEvent[]){
 const prev=new Map(previous.map(e=>[e.id.split(':').at(-1),e]));
 return current.filter(e=>{const earlier=prev.get(e.id.split(':').at(-1));return !earlier||earlier.status!==e.status||earlier.detail!==e.detail;});
}
export function checkCorrelatedInvestigation(test:TroubleshootCase,value:string,hypothesis:number|null,hadFailure:boolean,hadSuccess:boolean,selectedSources:TimelineSource[],pinned:CorrelatedEvent[]){
 const current=runProbe(test,value);const enoughSources=new Set(selectedSources).size>=2;
 const anchored=pinned.some(e=>e.status==='fail'||e.status==='warn');
 const correct=hypothesis===test.correctHypothesis;
 return {hadFailure,hadSuccess,enoughSources,anchored,correct,secure:current.pass,complete:hadFailure&&hadSuccess&&enoughSources&&anchored&&correct&&current.pass};
}
