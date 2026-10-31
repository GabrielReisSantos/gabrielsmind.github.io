import {FLOWS,natLookup,policyLookup,routeLookup,type App,type LabState} from './packetEngine';
const help=`CYBERLAB TRAINING CLI (synthetic, not exact PAN-OS syntax)\n\nhelp\nshow session all\nshow session id <number>\nshow routing route\nshow interface all\nshow nat rules\nshow security rules\nshow log traffic\ntest nat-policy-match <outbound|inbound|ssh|web>\ntest security-policy-match <flow-id> <incomplete|ssl|ssh|web-browsing>\n\nThese commands do not communicate with a real firewall.`;
export function diagnostic(command:string,state:LabState):string{
 const words=command.trim().toLowerCase().split(/\s+/);const c=state.config;
 if(!command.trim()||words[0]==='help')return help;
 if(words.join(' ')==='show session all')return state.sessions.length?state.sessions.map(s=>`ID ${s.id} | ${s.flowId} | ${s.state} | App=${s.app} | packets=${s.packets} | age=${state.time-s.lastSeen}s`).join('\n'):'No active sessions.';
 if(words.slice(0,3).join(' ')==='show session id'){
  const s=state.sessions.find(x=>x.id===Number(words[3]));return s?JSON.stringify(s,null,2):'Session ID not found.';
 }
 if(words.join(' ')==='show routing route')return `VIRTUAL ROUTER: ${c.vr}\n`+c.routes.map(r=>`${r.enabled?'UP  ':'DOWN'} ${r.prefix.padEnd(18)} via ${r.via.padEnd(17)} ${r.iface}`).join('\n');
 if(words.join(' ')==='show interface all')return c.interfaces.map(i=>`${i.name.padEnd(16)} zone=${i.zone.padEnd(8)} vr=${i.vr.padEnd(10)} address=${i.address}`).join('\n');
 if(words.join(' ')==='show nat rules')return c.nat.map((r,i)=>`${i+1}. [${r.enabled?'ENABLED':'DISABLED'}] ${r.kind.toUpperCase()} ${r.name}: ${r.original} => ${r.translated} (${r.zone})`).join('\n');
 if(words.join(' ')==='show security rules')return c.policies.map((r,i)=>`${i+1}. [${r.enabled?'ON':'OFF'}] ${r.action.toUpperCase()} ${r.name}: ${r.from}->${r.to}, dst=${r.destination}, app=${r.app}, port=${r.port??'any'}`).join('\n');
 if(words.join(' ')==='show log traffic')return state.logs.length?state.logs.slice(0,25).map(l=>`T+${l.time}s ${l.flowId.padEnd(9)} ${l.action.padEnd(10)} ${l.verdict.toUpperCase()} ${l.detail}`).join('\n'):'No events.';
 if(words[0]==='test'&&words[1]==='nat-policy-match'){
  const flow=FLOWS.find(f=>f.id===words[2]);if(!flow)return 'Unknown flow. Valid: outbound, inbound, ssh, web.';
  const d=natLookup(flow,'dnat',c),s=natLookup(flow,'snat',c);
  return `Original ${flow.source}:${flow.sourcePort} -> ${flow.destination}:${flow.destinationPort}\nDNAT: ${d?`${d.name} -> ${d.translated}`:'no match'}\nSNAT: ${s?`${s.name} -> ${s.translated}`:'no match'}\nRouting: ${routeLookup(d?.translated??flow.destination,c)?.iface??'NO ROUTE'}\nThis is a non-stateful simulated policy test.`;
 }
 if(words[0]==='test'&&words[1]==='security-policy-match'){
  const flow=FLOWS.find(f=>f.id===words[2]);const app=(words[3]??'incomplete') as App;if(!flow)return 'Unknown flow. Valid: outbound, inbound, ssh, web.';
  if(!['incomplete','ssl','ssh','web-browsing'].includes(app))return 'Invalid app. Use incomplete, ssl, ssh, or web-browsing.';
  const dn=natLookup(flow,'dnat',c);const r=routeLookup(dn?.translated??flow.destination,c);const iface=c.interfaces.find(i=>i.name===r?.iface&&i.vr===c.vr);
  if(!iface)return 'NO ROUTE: cannot determine post-DNAT destination zone.';
  const p=policyLookup(flow,iface.zone,app,c);
  return `From ${flow.zone} to ${iface.zone} · ORIGINAL DST ${flow.destination} · APP ${app}\nMATCH: ${p?.name??'interzone-default'}\nACTION: ${(p?.action??'deny').toUpperCase()}\nThis is a simulated configuration query; not production PAN-OS CLI.`;
 }
 return `Unrecognized command.\n\n${help}`;
}
