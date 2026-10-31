/** Small, explicitly scoped DER encoder for genuine P-256 lab CSRs and X.509 certificates.
 * It is not a general ASN.1 parser, certificate authority, or RFC 5280 validator.
 * All generated keys/certificates are for throwaway training only. */
const te = new TextEncoder();
const cat = (...items: Uint8Array[]) => {const out=new Uint8Array(items.reduce((s,b)=>s+b.length,0));let i=0;for(const b of items){out.set(b,i);i+=b.length;}return out;};
const bytes=(...n:number[])=>new Uint8Array(n);
function tlv(tag:number,body:Uint8Array):Uint8Array {const len=body.length;const size=len<128?bytes(len):len<256?bytes(0x81,len):len<65536?bytes(0x82,len>>8,len&255):bytes(0x83,(len>>16)&255,(len>>8)&255,len&255);return cat(bytes(tag),size,body);}
const seq=(...parts:Uint8Array[])=>tlv(0x30,cat(...parts));
const set=(...parts:Uint8Array[])=>tlv(0x31,cat(...parts));
const utf=(s:string)=>tlv(0x0c,te.encode(s));
const bit=(value:Uint8Array,unused=0)=>tlv(0x03,cat(bytes(unused),value));
const oct=(value:Uint8Array)=>tlv(0x04,value);
function oid(str:string):Uint8Array {const n=str.split('.').map(Number);if(n.length<2||n[0]>2||n[0]<0||n[1]<0)throw Error('Invalid OID');const vals=[n[0]*40+n[1],...n.slice(2)];const out:number[]=[];for(const v of vals){if(!Number.isSafeInteger(v)||v<0)throw Error('Invalid OID');const tmp=[v&127];let remaining=Math.floor(v/128);while(remaining){tmp.unshift((remaining&127)|128);remaining=Math.floor(remaining/128);}out.push(...tmp);}return tlv(0x06,bytes(...out));}
const integer=(value:Uint8Array)=>{let i=0;while(i<value.length-1&&value[i]===0)i++;let v=value.slice(i);if(v[0]&128)v=cat(bytes(0),v);return tlv(0x02,v);};
const int=(n:number)=>integer(bytes(n));
const bool=(b:boolean)=>tlv(0x01,bytes(b?0xff:0));
const cn=(name:string)=>seq(set(seq(oid('2.5.4.3'),utf(name))));
const alg=()=>seq(oid('1.2.840.10045.4.3.2'));
const time=(date:Date)=>{const y=date.getUTCFullYear();const pad=(n:number)=>String(n).padStart(2,'0');const suffix=`${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;return y>=2050?tlv(0x18,te.encode(`${y}${suffix}`)):tlv(0x17,te.encode(`${pad(y%100)}${suffix}`));};
const ext=(id:string,value:Uint8Array,critical=false)=>seq(oid(id),...(critical?[bool(true)]:[]),oct(value));
const san=(dns:string)=>ext('2.5.29.17',seq(tlv(0x82,te.encode(dns))));
const basic=(isCA:boolean,pathLen=0)=>ext('2.5.29.19',isCA?seq(bool(true),int(pathLen)):seq(),true);
const keyUsage=(isCA:boolean)=>ext('2.5.29.15',isCA?bit(bytes(0x06),1):bit(bytes(0x80),7),true);
const eku=(usage:'server'|'client'='server')=>ext('2.5.29.37',seq(oid(usage==='client'?'1.3.6.1.5.5.7.3.2':'1.3.6.1.5.5.7.3.1')));
const extensions=(isCA:boolean,dns?:string,pathLen=0,usage:'server'|'client'='server')=>seq(basic(isCA,pathLen),keyUsage(isCA),...(isCA?[]:[eku(usage),...(dns?[san(dns)]:[])]));
const rawToDer=(raw:Uint8Array)=>{if(raw.length!==64)throw Error('Unexpected P-256 raw signature length');return seq(integer(raw.slice(0,32)),integer(raw.slice(32)));};
const sign=async (key:CryptoKey,data:Uint8Array)=>new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,data as BufferSource));
export const pem=(name:string,raw:Uint8Array)=>{const base64=Array.from(raw).map(b=>String.fromCharCode(b)).join('');const text=btoa(base64);return `-----BEGIN ${name}-----\n${text.match(/.{1,64}/g)?.join('\n')??''}\n-----END ${name}-----`;};
export const makePair=()=>crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']) as Promise<CryptoKeyPair>;
export const publicPEM=async(key:CryptoKey)=>pem('PUBLIC KEY',new Uint8Array(await crypto.subtle.exportKey('spki',key)));
export const privatePEM=async(key:CryptoKey)=>pem('PRIVATE KEY',new Uint8Array(await crypto.subtle.exportKey('pkcs8',key)));
export type Issued={pem:string;tbs:Uint8Array;signature:Uint8Array;notBefore:number;notAfter:number;dns?:string;issuer:string;subject:string;publicKey:CryptoKey};
export type LabCA={keys:CryptoKeyPair;cert:Issued};
export async function issueCertificate(subject:string,keys:CryptoKeyPair,issuer:{name:string;key:CryptoKey},days:number,ca:boolean,dns?:string,caPathLen=0,usage:'server'|'client'='server'):Promise<Issued>{
 if(!Number.isInteger(days)||days<1||days>397&&!ca)throw Error('Leaf certificate duration must be 1–397 days');
 if(!/^[a-zA-Z0-9 ._-]{2,64}$/.test(subject))throw Error('Use a short alphanumeric subject CN');
 if(dns&&!/^[a-z0-9.-]{4,128}$/.test(dns))throw Error('Invalid DNS SAN');
 const now=Date.now();const before=new Date(now-60000);const after=new Date(now+days*86400000);const serial=crypto.getRandomValues(new Uint8Array(16));serial[0]&=0x7f;
 const spki=new Uint8Array(await crypto.subtle.exportKey('spki',keys.publicKey));
 const tbs=seq(tlv(0xa0,int(2)),integer(serial),alg(),cn(issuer.name),seq(time(before),time(after)),cn(subject),spki,tlv(0xa3,extensions(ca,dns,caPathLen,usage)));
 const sig=await sign(issuer.key,tbs);const der=seq(tbs,alg(),bit(rawToDer(sig)));
 return {pem:pem('CERTIFICATE',der),tbs,signature:sig,notBefore:before.getTime(),notAfter:after.getTime(),dns,issuer:issuer.name,subject,publicKey:keys.publicKey};
}
export async function createLabCA(name='CyberLab Root CA'):Promise<LabCA>{const keys=await makePair();const cert=await issueCertificate(name,keys,{name,key:keys.privateKey},365,true,undefined,1);return {keys,cert};}
export async function makeCSR(subject:string,keys:CryptoKeyPair,dns:string){
 if(!/^[a-zA-Z0-9 ._-]{2,64}$/.test(subject)||!/^[a-z0-9.-]{4,128}$/.test(dns))throw Error('Invalid CSR identity');
 const spki=new Uint8Array(await crypto.subtle.exportKey('spki',keys.publicKey));
 // PKCS#9 extensionRequest attribute: IMPLICIT [0] SET OF Attribute
 const requestExtension=seq(oid('1.2.840.113549.1.9.14'),set(seq(san(dns))));
 const info=seq(int(0),cn(subject),spki,tlv(0xa0,requestExtension));
 const signature=await sign(keys.privateKey,info);
 return pem('CERTIFICATE REQUEST',seq(info,alg(),bit(rawToDer(signature))));
}
export async function verifyIssued(cert:Issued,ca:LabCA,hostname:string,trustCA:boolean,at=Date.now()){
 const signatureOK=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},ca.keys.publicKey,cert.signature as BufferSource,cert.tbs as BufferSource);
 const trusted=trustCA&&cert.issuer===ca.cert.subject;
 const dateOK=at>=cert.notBefore&&at<=cert.notAfter;
 const dnsOK=cert.dns===hostname.toLowerCase();
 return {signatureOK,trusted,dateOK,dnsOK,ok:signatureOK&&trusted&&dateOK&&dnsOK};
}
export async function fingerprint(cert:Issued){const raw=atob(cert.pem.split('\n').slice(1,-1).join(''));const digest=await crypto.subtle.digest('SHA-256',Uint8Array.from(raw,c=>c.charCodeAt(0)));return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join(':').toUpperCase();}

/** CSR for a constrained intermediate CA; no DNS SAN is appropriate for a CA request. */
export async function makeCACSR(subject:string,keys:CryptoKeyPair){
 if(!/^[a-zA-Z0-9 ._-]{2,64}$/.test(subject))throw Error('Invalid CA subject');
 const spki=new Uint8Array(await crypto.subtle.exportKey('spki',keys.publicKey));
 const info=seq(int(0),cn(subject),spki,tlv(0xa0,new Uint8Array()));
 const signature=await sign(keys.privateKey,info);
 return pem('CERTIFICATE REQUEST',seq(info,alg(),bit(rawToDer(signature))));
}
