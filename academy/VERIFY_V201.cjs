'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=process.cwd(),compiled=process.argv[2]||'.v201-verify';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {createBackup,validateBackup,importBackup,MAX_BACKUP_BYTES}=require(path.resolve(root,compiled,'learning/backupEngine.js'));
const routes=require(path.resolve(root,compiled,'experience/routes.js'));
let checks=0;
function test(name,fn){fn();checks++;}
class MemoryStorage{
 constructor(entries={}){this.map=new Map(Object.entries(entries));this.failOn='';this.failOnce=false;}
 get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.get(k)??null;}
 setItem(k,v){if(k===this.failOn&&this.failOnce){this.failOnce=false;throw Error('simulated QuotaExceededError');}this.map.set(k,v);}
 removeItem(k){this.map.delete(k);}
}
const validKey='cyberlab-cert-answers-v3';const b={format:'cyberlab-local-backup',version:1,exportedAt:'2026-01-01T00:00:00Z',records:{[validKey]:'{"test":1}'}};
test('reads old backup format',()=>assert.deepEqual(validateBackup(b),b.records));
test('rejects unknown format',()=>assert.throws(()=>validateBackup({...b,format:'other'})));
test('rejects wrong version',()=>assert.throws(()=>validateBackup({...b,version:2})));
test('rejects non-cyberlab key',()=>assert.throws(()=>validateBackup({...b,records:{'other-key':'{}'}})));
test('rejects invalid JSON for JSON progress key',()=>assert.throws(()=>validateBackup({...b,records:{[validKey]:'not json'}})));
test('allows previous raw-value keys',()=>assert.equal(validateBackup({...b,records:{'cyberlab-coding-v15-draft-x':'print("ok")'}})['cyberlab-coding-v15-draft-x'],'print("ok")'));
test('rejects >200 records',()=>assert.throws(()=>validateBackup({...b,records:Object.fromEntries(Array.from({length:201},(_,i)=>['cyberlab-test-'+i,'{}']))})));
test('rejects oversized backup',()=>assert.throws(()=>validateBackup({...b,records:{[validKey]:JSON.stringify({data:'A'.repeat(MAX_BACKUP_BYTES)})}})));
test('exports compatible backup',()=>{const result=createBackup(new MemoryStorage({'unrelated':'{}',[validKey]:'{}'}));assert.equal(result.version,1);assert.deepEqual(Object.keys(result.records),[validKey]);});
test('successfully imports checked records',()=>{const s=new MemoryStorage({[validKey]:'{}'});importBackup(s,b.records);assert.equal(s.getItem(validKey),'{"test":1}');});
test('preserves untouched keys on successful import',()=>{const s=new MemoryStorage({'other':'hello'});importBackup(s,b.records);assert.equal(s.getItem('other'),'hello');});
test('rolls back failed write and newly introduced keys',()=>{
 const first='cyberlab-test-a',second='cyberlab-test-b';const s=new MemoryStorage({[first]:'{"old":true}','not-cyberlab':'leave'});
 s.failOn=second;s.failOnce=true;
 assert.throws(()=>importBackup(s,{[first]:'{"new":true}',[second]:'{"new":2}'}),/earlier values were restored/);
 assert.equal(s.getItem(first),'{"old":true}');assert.equal(s.getItem(second),null);assert.equal(s.getItem('not-cyberlab'),'leave');
});
test('supports unchanged all 15 lab routes',()=>{for(const k of ['foundation','ngfw','troubleshoot','studio','certification','pentest','missions','webplay','adlab','purple','correlation','world','incident','practice','investigation2'])assert.ok(routes.isLabRoute(k),k);});
test('preserves certification hash alias',()=>{assert.equal(routes.routeGroup('certification'),'certifications');assert.equal(routes.isAppRoute('certifications'),false);});
test('provides error boundary around lazy module content',()=>{const src=read('src/experience/App.tsx');assert.match(src,/<LabErrorBoundary key=\{page\}/);assert.match(src,/<Suspense fallback=/);assert.match(src,/<\/Suspense><\/LabErrorBoundary>/);});
test('keyboard menu supports Escape and Tab wrap',()=>{const src=read('src/experience/App.tsx');assert.ok(src.includes("e.key==='Escape'"));assert.ok(src.includes("e.key!=='Tab'"));assert.ok(src.includes('navigationRef.current'));});
test('local import uses validated rollback writer',()=>{const src=read('src/learning/ProgressBackup.tsx');assert.ok(src.includes('importBackup(localStorage,pending)'));});
test('quality workflow includes release doctor and npm ci',()=>{const workflow=fs.existsSync(path.join(root,'.github/workflows/quality.yml'))?'.github/workflows/quality.yml':'../.github/workflows/quality.yml';const src=read(workflow);assert.match(src,/npm ci/);assert.match(src,/release:check/);});
test('package version & new verification hooks',()=>{const pkg=JSON.parse(read('package.json'));assert.ok(/^(?:2|3)\.(?:0\.1|1\.0|2\.0|3\.[0-9]+|4\.[0-9]+|5\.[0-9]+|6\.[0-9]+|7\.[0-9]+|8\.[0-9]+|9\.[0-9]+)$/.test(pkg.version)||pkg.version==='3.0.0');assert.ok(pkg.scripts['verify:stability']);assert.ok(pkg.scripts['release:check']);});
console.log(`CyberLab v2.0.1 production-quality checks: ${checks} passed.`);
