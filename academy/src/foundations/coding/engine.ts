import type {CodingLesson} from './lessons';
export type ApiResponse={status:number;statusText:string;body:unknown;headers:Record<string,string>};
export type ApiState={assets:{id:number;hostname:string;location:string}[];notes:{id:number;assetId:number;text:string}[]};
export function initialApiState():ApiState{return {assets:[{id:1,hostname:'sw-core',location:'LAN'},{id:2,hostname:'fw-edge',location:'WAN'}],notes:[]};}
export type Request={method:string;path:string;headers:Record<string,string>;body:string};
export function parseHttpRequest(input:string):Request{
 const normalized=input.replace(/\r\n/g,'\n');const [head,...tail]=normalized.split('\n\n');const rows=head.trim().split('\n');
 const match=/^(GET|POST|PATCH)\s+(\/[^\s]*)\s+HTTP\/1\.1$/.exec(rows.shift()?.trim()??'');
 if(!match)throw new Error('Use METHOD /path HTTP/1.1 (GET, POST, PATCH).');
 const headers:Record<string,string>={};for(const row of rows){const sep=row.indexOf(':');if(sep<1)throw Error(`Malformed header: ${row}`);const key=row.slice(0,sep).trim().toLowerCase();if(!/^[a-z0-9-]+$/.test(key))throw Error('Invalid header name');headers[key]=row.slice(sep+1).trim();}
 return {method:match[1],path:match[2],headers,body:tail.join('\n\n').trim()};
}
const response=(status:number,statusText:string,body:unknown):ApiResponse=>({status,statusText,body,headers:{'content-type':'application/json'}});
export function mockApi(request:Request,state:ApiState):{result:ApiResponse;state:ApiState}{
 const next:ApiState={assets:state.assets.map(a=>({...a})),notes:state.notes.map(n=>({...n}))};
 const {method,path,headers}=request;
 const route=path.split('?')[0];
 if(route==='/api/private'&&method==='GET')return headers.authorization==='Bearer cyberlab-demo'?{result:response(200,'OK',{status:'authorized',scope:'training'}),state:next}:{result:response(401,'Unauthorized',{error:'Missing or invalid training token'}),state:next};
 if(route==='/api/assets'&&method==='GET')return {result:response(200,'OK',next.assets),state:next};
 const asset=/^\/api\/assets\/(\d+)$/.exec(route);
 if(asset){const index=next.assets.findIndex(a=>a.id===Number(asset[1]));if(index<0)return {result:response(404,'Not Found',{error:'Asset not found'}),state:next};
  if(method==='GET')return {result:response(200,'OK',next.assets[index]),state:next};
  if(method==='PATCH'){if(headers['content-type']!=='application/json')return {result:response(415,'Unsupported Media Type',{error:'JSON required'}),state:next};let data:unknown;try{data=JSON.parse(request.body);}catch{return {result:response(400,'Bad Request',{error:'Invalid JSON'}),state:next};}
   if(!data||typeof data!=='object'||!('location' in data)||typeof data.location!=='string'||!data.location.trim())return {result:response(422,'Unprocessable Content',{error:'location must be a nonempty string'}),state:next};
   next.assets[index]={...next.assets[index],location:data.location};return {result:response(200,'OK',next.assets[index]),state:next};}
 }
 if(route==='/api/notes'&&method==='GET')return {result:response(200,'OK',next.notes),state:next};
 if(route==='/api/notes'&&method==='POST'){
  if(headers['content-type']!=='application/json')return {result:response(415,'Unsupported Media Type',{error:'JSON required'}),state:next};let data:unknown;try{data=JSON.parse(request.body);}catch{return {result:response(400,'Bad Request',{error:'Invalid JSON'}),state:next};}
  if(!data||typeof data!=='object'||!('assetId' in data)||!('text' in data)||typeof data.assetId!=='number'||typeof data.text!=='string'||!data.text.trim())return {result:response(422,'Unprocessable Content',{error:'assetId(number) and text(string) are required'}),state:next};
  if(!next.assets.some(a=>a.id===data.assetId))return {result:response(422,'Unprocessable Content',{error:'Unknown assetId'}),state:next};
  const note={id:next.notes.length+1,assetId:data.assetId,text:data.text};next.notes.push(note);return {result:response(201,'Created',note),state:next};
 }
 return {result:response(404,'Not Found',{error:'Unknown endpoint'}),state:next};
}
export function validateApiLesson(lessonId:string,request:Request,result:ApiResponse):boolean{
 const path=request.path.split('?')[0];
 switch(lessonId){
  case 'api-01':return request.method==='GET'&&path==='/api/assets'&&request.headers.accept==='application/json'&&result.status===200;
  case 'api-02':return request.method==='GET'&&path==='/api/assets/2'&&request.headers.accept==='application/json'&&result.status===200;
  case 'api-03':return request.method==='POST'&&path==='/api/notes'&&result.status===201&&request.headers['content-type']==='application/json'&&(()=>{try{const d=JSON.parse(request.body);return d.assetId===2&&d.text==='review firewall';}catch{return false;}})();
  case 'api-04':return request.method==='GET'&&path==='/api/private'&&request.headers.authorization==='Bearer cyberlab-demo'&&request.headers.accept==='application/json'&&result.status===200;
  case 'api-05':return request.method==='PATCH'&&path==='/api/assets/2'&&result.status===200&&(()=>{try{return JSON.parse(request.body).location==='DMZ';}catch{return false;}})();
  case 'api-06':return request.method==='GET'&&path==='/api/assets/404'&&result.status===404;
  default:return false;
 }
}
/** Comparing tokens tests typed reference syntax, NOT semantic equivalence or C# compilation. */
export function normalizeCSharp(source:string):string{
 // Preserve string literals; discard only insignificant whitespace outside strings.
 let output='',quote=false,escaped=false;
 for(const ch of source){if(quote){output+=ch;if(ch==='"'&&!escaped)quote=false;if(ch==='\\'&&!escaped)escaped=true;else escaped=false;}
 else if(ch==='"'){quote=true;output+=ch;}else if(!/\s/.test(ch))output+=ch;}
 return output;
}
export function validateCSharpReference(lesson:CodingLesson,source:string):boolean{
 return lesson.language==='csharp'&&normalizeCSharp(source)===normalizeCSharp(lesson.solution);
}
export function countTypedKeys(previous:number,delta:number){return Math.max(0,previous+(Number.isFinite(delta)?Math.max(0,delta):0));}
export function codingSavedIds(input:unknown,known:string[]):string[]{return Array.isArray(input)?[...new Set(input.filter((v):v is string=>typeof v==='string'&&known.includes(v)))]:[];}
