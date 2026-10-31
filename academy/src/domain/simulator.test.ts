import {describe,it,expect} from 'vitest';
import {evaluatePacket,HTTPS_RULE,lookupDomain} from './simulator';
const tcp443 = {source:'client',destination:'web',protocol:'tcp' as const,destinationPort:443};
describe('teaching simulator',()=>{
  it('defaults to deny',()=>expect(evaluatePacket(tcp443,[]).action).toBe('deny'));
  it('allows an explicit HTTPS policy',()=>expect(evaluatePacket(tcp443,[HTTPS_RULE]).action).toBe('allow'));
  it('blocks SSH despite HTTPS allow',()=>expect(evaluatePacket({...tcp443,destination:'ssh',destinationPort:22},[HTTPS_RULE]).action).toBe('deny'));
  it('honours first matching rule',()=>{
    const first={...HTTPS_RULE,id:'block',name:'Block HTTPS',action:'deny' as const};
    expect(evaluatePacket(tcp443,[first,HTTPS_RULE]).rule).toBe('Block HTTPS');
  });
  it('ignores disabled rules',()=>expect(evaluatePacket(tcp443,[{...HTTPS_RULE,enabled:false}]).action).toBe('deny'));
  it('normalizes DNS names',()=>expect(lookupDomain(' APP.CYBERLAB.LOCAL. ').ip).toBe('10.20.0.10'));
  it('never resolves unknown names',()=>expect(lookupDomain('www.example.com').ip).toBeNull());
});
