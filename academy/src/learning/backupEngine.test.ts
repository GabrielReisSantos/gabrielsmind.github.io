import {describe,expect,it} from 'vitest';
import {createBackup,importBackup,validateBackup} from './backupEngine';
class LocalMemory{
 data=new Map<string,string>();failOnce=false;
 get length(){return this.data.size;}
 key(i:number){return [...this.data.keys()][i]??null;}
 getItem(k:string){return this.data.get(k)??null;}
 setItem(k:string,v:string){if(this.failOnce&&k==='cyberlab-step-b'){this.failOnce=false;throw Error('QuotaExceededError');}this.data.set(k,v);}
 removeItem(k:string){this.data.delete(k);}
}
const b=(records:Record<string,string>)=>({format:'cyberlab-local-backup',version:1,exportedAt:new Date(0).toISOString(),records});
describe('backward-compatible progress backup',()=>{
 it('accepts v1 backups and ignores unrelated local storage on export',()=>{
  const s=new LocalMemory();s.setItem('cyberlab-ad','["dns"]');s.setItem('unrelated','{}');
  expect(validateBackup(b({'cyberlab-ad':'["dns"]'}))).toEqual({'cyberlab-ad':'["dns"]'});
  expect(createBackup(s as unknown as Storage).records).toEqual({'cyberlab-ad':'["dns"]'});
 });
 it('rejects invalid JSON progress records without touching storage',()=>{
  const s=new LocalMemory();s.setItem('cyberlab-ad','["dns"]');
  expect(()=>importBackup(s as unknown as Storage,{'cyberlab-ad':'untrusted'})).toThrow('Invalid JSON');
  expect(s.getItem('cyberlab-ad')).toBe('["dns"]');
 });
 it('restores older progress when later storage write fails',()=>{
  const s=new LocalMemory();s.setItem('cyberlab-step-a','{"old":true}');s.failOnce=true;
  expect(()=>importBackup(s as unknown as Storage,{'cyberlab-step-a':'{"new":true}','cyberlab-step-b':'{"new":2}'})).toThrow(/restored/);
  expect(s.getItem('cyberlab-step-a')).toBe('{"old":true}');
  expect(s.getItem('cyberlab-step-b')).toBeNull();
 });
});
