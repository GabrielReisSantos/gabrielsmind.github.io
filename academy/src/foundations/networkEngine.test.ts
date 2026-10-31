import {describe,it,expect} from 'vitest';
import {BASE_ROUTES,BASE_SEGMENT_RULES,BASE_SWITCH_PORTS,exposureScore,parseIPv4,segmentDecision,selectRoute,subnetDetails,validateVlanPath} from './networkEngine';
describe('CCNA and segmentation browser models',()=>{
 it('validates IPv4 octets',()=>{expect(parseIPv4('192.168.1.10')).not.toBeNull();expect(parseIPv4('999.1.1.1')).toBeNull();});
 it('calculates /26 correctly',()=>{expect(subnetDetails('192.168.10.70',26)).toMatchObject({network:'192.168.10.64',broadcast:'192.168.10.127',usable:62,mask:'255.255.255.192'});});
 it('handles /31 without implying usable conventional hosts',()=>expect(subnetDetails('10.0.0.0',31)?.usable).toBe(0));
 it('selects the most specific route',()=>expect(selectRoute('10.40.10.5',BASE_ROUTES)?.id).toBe('dmz'));
 it('applies default deny on lateral traffic',()=>expect(segmentDecision({source:'guest',destination:'management',service:'ssh'},BASE_SEGMENT_RULES).allowed).toBe(false));
 it('honors explicit application allow',()=>expect(segmentDecision({source:'users',destination:'servers',service:'https'},BASE_SEGMENT_RULES).allowed).toBe(true));
 it('respects first-match deny',()=>expect(segmentDecision({source:'guest',destination:'ot',service:'modbus'},BASE_SEGMENT_RULES).allowed).toBe(false));
 it('counts permitted exposure links',()=>expect(exposureScore(BASE_SEGMENT_RULES)).toBe(2));
 it('blocks mismatched access VLAN',()=>expect(validateVlanPath(BASE_SWITCH_PORTS[0],BASE_SWITCH_PORTS[1],BASE_SWITCH_PORTS[2]).passed).toBe(false));
 it('permits same VLAN when trunk permits it',()=>expect(validateVlanPath(BASE_SWITCH_PORTS[0],{...BASE_SWITCH_PORTS[1],vlan:10},BASE_SWITCH_PORTS[2]).passed).toBe(true));
});
