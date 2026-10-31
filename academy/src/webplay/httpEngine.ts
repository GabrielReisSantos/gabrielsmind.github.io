/**
 * Entirely in-memory instructional HTTP fixtures. Never uses fetch, eval,
 * DOM insertion or the user's network. Findings are modelled, not executed.
 */
export type WebCaseId='xss'|'sqli'|'idor'|'traversal'|'upload';
export type LabRequest={method:'GET'|'POST';url:string;headers:string;body:string};
export type HttpResult={status:number;statusText:string;headers:Record<string,string>;body:string;trace:string[];finding:boolean;normal:boolean;cause:string;remediation:string;marker:string};
export type WebCase={id:WebCaseId;title:string;category:string;description:string;objective:string;normal:LabRequest;probe:LabRequest;rootCauses:string[];correctCause:number;hint:string;exampleCode:string;fixedCode:string};
const req=(method:'GET'|'POST',url:string,body=''):LabRequest=>({method,url,body,headers:'Accept: application/json\nX-Lab-Identity: alice'});
export const WEB_CASES:WebCase[]=[
 {id:'xss',title:'Reflected input in search',category:'Web · XSS',description:'A product search reflects the user’s query in HTML without context-aware output encoding.',objective:'Contrast safe text with a marker resembling executable markup; verify escaped output after repair.',normal:req('GET','/search?q=keyboard'),probe:req('GET','/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E'),rootCauses:['Missing HTML output encoding in the response','A weak database password','Incorrect DNS resolver settings'],correctCause:0,hint:'Compare the response body for literal angle brackets versus escaped entity text.',exampleCode:'return `<h2>Results for ${query}</h2>`; // unsafe HTML context',fixedCode:'return `<h2>Results for ${escapeHTML(query)}</h2>`; // encoded output'},
 {id:'sqli',title:'Unsafe catalog query',category:'Web · SQL injection',description:'A catalog endpoint constructs a SQL string from an untrusted item parameter.',objective:'Compare an ordinary lookup with a synthetic boolean-condition input, then apply parameterization.',normal:req('GET','/catalog?item=4'),probe:req('GET',"/catalog?item=4%27%20OR%20%271%27%3D%271"),rootCauses:['Unauthenticated SMB access','Untrusted input concatenated into SQL syntax','Trunk VLAN mismatch'],correctCause:1,hint:'Look for the SQL expression and the difference between one row and an unexpected larger result set.',exampleCode:`sql = "SELECT * FROM catalog WHERE item_id='" + item + "'"`,fixedCode:'sql = "SELECT * FROM catalog WHERE item_id=?"; db.query(sql,[item])'},
 {id:'idor',title:'Order API authorization',category:'API · IDOR / BOLA',description:'The signed-in learner is alice. The API accepts arbitrary order IDs without verifying ownership.',objective:'Show the difference between Alice’s order and Bob’s order, then enforce object-level authorization.',normal:req('GET','/api/orders/1001'),probe:req('GET','/api/orders/1002'),rootCauses:['Missing object-level ownership check','Session cookie expired','TLS cipher mismatch'],correctCause:0,hint:'A valid session is not the same as authorization to another user’s object.',exampleCode:'return db.orders.findById(request.params.id); // no owner check',fixedCode:'order=db.orders.findById(id); if(order.owner!==session.user) return 403;'},
 {id:'traversal',title:'Download path traversal',category:'Web · Path handling',description:'A download endpoint joins a supplied filename with its documents directory but fails to constrain the resolved path.',objective:'Read a permitted document, then demonstrate an inert out-of-directory marker and block it with an allowlist.',normal:req('GET','/download?file=guide.txt'),probe:req('GET','/download?file=..%2F..%2Fconfig%2Fprivate.txt'),rootCauses:['Unrestricted path resolution from a user-controlled filename','Missing application firewall license','Application logging disabled'],correctCause:0,hint:'A relative path can resolve outside the intended directory; verify the canonical destination.',exampleCode:'readFile(join("/srv/docs", request.query.file)); // no containment',fixedCode:'if(!allowedFiles.has(filename)) return 403; readFile(allowedFiles.get(filename));'},
 {id:'upload',title:'Upload type validation',category:'Web · File uploads',description:'An attachment service trusts the client-provided content type and filename without checking permitted formats.',objective:'Compare a safe note upload with a simulated active-content upload and enforce a server-side allowlist.',normal:req('POST','/upload','filename=notes.txt&mime=text/plain&content=hello'),probe:req('POST','/upload','filename=avatar.svg&mime=image/svg+xml&content=%3Csvg%20onload%3Dalert(1)%3E'),rootCauses:['Missing server-side file-type policy and safe serving controls','Untrusted LDAP domain','An NTP time drift'],correctCause:0,hint:'Client-controlled MIME metadata is not validation. Consider permitted file formats and safe storage.',exampleCode:'store(upload.name,upload.content); return publicUrl(upload.name);',fixedCode:'validateAllowlistedFormat(upload); storeInPrivateBucket(randomName); serveAsAttachment();'}
];
const htmlEscape=(value:string)=>value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
const baseHeaders={'Content-Type':'application/json; charset=utf-8','X-CyberLab-Mode':'synthetic','Cache-Control':'no-store'};
const result=(status:number,body:string,trace:string[],finding:boolean,normal:boolean,cause:string,remediation:string,marker:string):HttpResult=>({status,statusText:({200:'OK',201:'Created',400:'Bad Request',403:'Forbidden',404:'Not Found',405:'Method Not Allowed'} as Record<number,string>)[status]??'Response',headers:{...baseHeaders,'Content-Type':marker==='XSS-REFLECT'?'text/html; charset=utf-8':marker==='TRAVERSAL'||marker==='DOWNLOAD'?'text/plain; charset=utf-8':baseHeaders['Content-Type']},body,trace,finding,normal,cause,remediation,marker});
function decode(value:string){try{return decodeURIComponent(value.replace(/\+/g,' '));}catch{return value;}}
function param(url:string,key:string){const match=url.split('?')[1]?.split('&').find(kv=>kv.split('=')[0]===key);return decode(match?.slice(key.length+1)??'');}
function form(body:string,key:string){const value=body.split('&').find(kv=>kv.startsWith(key+'='));return value?decode(value.slice(key.length+1)):'';}
export function handleHttp(id:WebCaseId,request:LabRequest,patched:boolean):HttpResult{
 const trace=[`Request: ${request.method} ${request.url.slice(0,200)}`,'All input and output remain inside a deterministic in-memory fixture.'];
 const url=request.url.trim();
 if(!url.startsWith('/')||url.startsWith('//')||url.includes('://'))return result(400,'{"error":"Only relative fixture paths are supported"}',[...trace,'Blocked non-local path.'],false,false,'Request scope','Use fixture-only paths.','SCOPE');
 const route=url.split('?')[0];
 if(id==='xss'){
  if(route!=='/search'||request.method!=='GET')return result(404,'{"error":"Not in fixture"}',trace,false,false,'Request routing','Use /search','ROUTE');
  const q=param(url,'q');const active=/<\s*script\b|\bon\w+\s*=|javascript\s*:/i.test(q);
  const displayed=patched?htmlEscape(q):q;
  const body=`<h2>Results for ${displayed}</h2>\n<p>0 synthetic results</p>`;
  trace.push(patched?'Output encoded for HTML text context.':'Query string interpolated into HTML without encoding.',active?'Markup-like marker observed (never executed).':'No markup-like marker observed.');
  return result(200,body,trace,active&&!patched,!active,'HTML output not encoded','Contextual output encoding and safe DOM APIs','XSS-REFLECT');
 }
 if(id==='sqli'){
  if(route!=='/catalog'||request.method!=='GET')return result(404,'{"error":"Not in fixture"}',trace,false,false,'Request routing','Use /catalog','ROUTE');
  const item=param(url,'item');const test=/(['"]\s*(?:or|and)\s*['"]?\w+['"]?\s*=\s*['"]?\w+)|\bunion\s+select\b/i.test(item);const normal=/^\d+$/.test(item);
  if(patched&&!normal)return result(400,'{"error":"item must be a numeric identifier"}',[...trace,'Bound parameter with numeric validation; input rejected.'],false,false,'Unsafe SQL assembly','Bind parameters and restrict input','SQL-BOOLEAN');
  if(test){const count=patched?0:24;return result(200,JSON.stringify({rows:count,items:patched?[]:['catalog-001','catalog-002','… 22 more synthetic rows'],note:'No real SQL engine executed'}),[...trace,patched?'Bound parameterized query':'Raw parameter spliced into SQL text',`Synthetic query yielded ${count} rows.`],!patched,false,'Untrusted SQL concatenation','Parameterized queries plus least privilege','SQL-BOOLEAN');}
  return result(200,JSON.stringify({rows:item==='4'?1:0,item:item||null}),[...trace,'Normal catalog lookup; synthetic DB.'],false,normal,'Untrusted SQL concatenation','Parameterization','SQL-BASELINE');
 }
 if(id==='idor'){
  if(request.method!=='GET'||!/^\/api\/orders\/\d+$/.test(route))return result(404,'{"error":"Unknown order endpoint"}',trace,false,false,'Request routing','Use /api/orders/:id','ROUTE');
  const order=route.split('/').pop();const owner=order==='1001'?'alice':order==='1002'?'bob':null;
  if(!owner)return result(404,'{"error":"Order not found"}',trace,false,false,'Unknown object','Use a fixture ID','NOTFOUND');
  const other=owner!=='alice';
  if(patched&&other)return result(403,'{"error":"Object access denied"}',[...trace,'Authenticated as alice. Ownership check failed.'],false,false,'Missing object authorization','Validate owner on every object request','IDOR');
  trace.push('Authenticated identity: alice.',patched?'Object ownership verified.':'Object ownership check skipped.');
  return result(200,JSON.stringify({id:order,owner,summary:other?'synthetic restricted order':'synthetic own order'}),trace,other&&!patched,!other,'Missing object authorization','Authorize at object level, default deny','IDOR');
 }
 if(id==='traversal'){
  if(route!=='/download'||request.method!=='GET')return result(404,'{"error":"Unknown download"}',trace,false,false,'Request routing','Use /download','ROUTE');
  const name=param(url,'file');const escaped=name.includes('..')||name.startsWith('/')||name.includes('\\');
  if(patched&&name!=='guide.txt')return result(403,'{"error":"Filename is not in allowed list"}',[...trace,'Server-side document allowlist enforced.'],false,false,'Unconstrained filesystem path','Allowlist filenames and verify canonical containment','TRAVERSAL');
  if(!patched&&escaped)return result(200,'TRAINING_FIXTURE_ONLY=private-config-marker\nNO_REAL_SECRETS=TRUE',[...trace,`Canonical resolution would leave /srv/docs: ${name.slice(0,120)}`,'Only a fictional marker was returned.'],true,false,'Unconstrained filesystem path','Canonical path containment and allowlist','TRAVERSAL');
  if(name!=='guide.txt')return result(404,'{"error":"File not found"}',trace,false,false,'Unknown file','Use the fixture filename','NOTFOUND');
  return result(200,'CyberLab guide — public training document.',[...trace,'Resolved to /srv/docs/guide.txt'],false,true,'Unconstrained filesystem path','Allowlist and containment','DOWNLOAD');
 }
 if(id==='upload'){
  if(route!=='/upload'||request.method!=='POST')return result(405,'{"error":"POST /upload expected"}',trace,false,false,'Request routing','Use POST /upload','METHOD');
  const filename=form(request.body,'filename'),mime=form(request.body,'mime'),content=form(request.body,'content');
  const safe=filename==='notes.txt'&&mime==='text/plain'&&content==='hello';
  const risky=/\.(?:svg|html|js|php|exe|sh)$/i.test(filename)||/(?:image\/svg\+xml|text\/html|application\/javascript)/i.test(mime)||/<\s*svg\b|<\s*script\b/i.test(content);
  if(patched&&!safe)return result(403,'{"error":"Only the validated notes.txt fixture is permitted"}',[...trace,'Server-side policy rejected nonallowlisted upload.'],false,false,'Missing server-side upload validation','Strict format checks, random filenames, private storage','UPLOAD');
  if(!filename)return result(400,'{"error":"filename required"}',trace,false,false,'Malformed upload','Provide valid form fields','BADFORM');
  return result(201,JSON.stringify({storedAs:patched?'private/4c22-note.txt':`public/${filename.slice(0,50)}`,servedInline:!patched,execution:'none; fictional storage'}),[...trace,patched?'Validated, private storage, served as attachment.':'Trusted client supplied extension and MIME.',risky?'Risky active-content fixture detected. No code was executed.':'Normal text fixture.'],risky&&!patched,safe,'Missing server-side upload validation','Allowlist, private storage, safe content disposition','UPLOAD');
 }
 throw Error('Unknown educational fixture');
}
export type WebObservation={caseId:WebCaseId;patched:boolean;request:LabRequest;response:HttpResult};
export function evaluateWebChallenge(id:WebCaseId,history:WebObservation[],cause:number|null,selected:number[]){
 const study=WEB_CASES.find(c=>c.id===id)!;const rows=history.filter(x=>x.caseId===id);
 const requestMatches=(x:WebObservation,target:LabRequest)=>x.request.method===target.method&&x.request.url===target.url&&x.request.body===target.body;
 const baseline=rows.some(x=>!x.patched&&requestMatches(x,study.normal)&&x.response.normal&&x.response.status>=200&&x.response.status<300);
 const proof=rows.some(x=>!x.patched&&requestMatches(x,study.probe)&&x.response.finding);
 const blocked=rows.some(x=>x.patched&&requestMatches(x,study.probe)&&!x.response.finding&&((x.response.status>=400&&x.response.status<500)||(id==='xss'&&x.response.status===200&&x.response.body.includes('&lt;'))));
 const regression=rows.some(x=>x.patched&&requestMatches(x,study.normal)&&x.response.normal&&x.response.status>=200&&x.response.status<300);
 const pinnedProof=selected.some(i=>history[i]?.caseId===id&&!history[i]?.patched&&requestMatches(history[i],study.probe)&&history[i]?.response.finding);
 const correct=cause===study.correctCause;
 return {baseline,proof,blocked,regression,pinnedProof,correct,complete:baseline&&proof&&blocked&&regression&&pinnedProof&&correct};
}
