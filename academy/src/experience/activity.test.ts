import {describe,it,expect} from 'vitest';
import {parseActivity} from './activity';
describe('verified onboarding actions',()=>{it('filters unknown actions',()=>expect(parseActivity('["ad.open","evil","ad.graph-zoom"]')).toEqual(['ad.open','ad.graph-zoom']));it('recovers from corrupt data',()=>expect(parseActivity('{')).toEqual([]));});
