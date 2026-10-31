import {describe,it,expect} from 'vitest';
import {arrangeLabels,cableCurve,copyPreset,projectWorld,ZONE_COLORS} from './visualEngine';
describe('presentation geometry',()=>{
 it('presets are copy-safe and perspective is finite',()=>{const c=copyPreset('isometric');c.yaw=2;expect(copyPreset('isometric').yaw).not.toBe(2);for(const p of [[-5,1,2],[5,.4,-3],[0,1.8,0]]){const v=projectWorld(p[0],p[1],p[2],copyPreset('isometric'),1.6);expect(v.visible).toBe(true);expect(Number.isFinite(v.x+v.y+v.depth)).toBe(true);}});
 it('overhead still sees every scene corner',()=>{for(const x of [-5,5])for(const z of [-3,3]){const v=projectWorld(x,1,z,copyPreset('overhead'),1.6);expect(Math.abs(v.x)).toBeLessThan(.75);expect(Math.abs(v.y)).toBeLessThan(.75);}});
 it('labels are bounded and non-overlapping',()=>{const candidates=Array.from({length:6},(_,i)=>({id:String(i),title:`SW${i}`,ip:'10.20.30.40',screenX:300+i*3,screenY:180+i*3,selected:i===0,priority:i}));const result=arrangeLabels(candidates,650,410);expect(result.length).toBeGreaterThan(1);expect(result.find(p=>p.id==='0')?.showIp).toBe(true);for(const a of result){expect(a.x).toBeGreaterThanOrEqual(0);expect(a.y).toBeGreaterThanOrEqual(0);expect(a.x+a.width).toBeLessThanOrEqual(650);for(const b of result)if(a!==b)expect(a.x+a.width+5<=b.x||b.x+b.width+5<=a.x||a.y+a.height+4<=b.y||b.y+b.height+4<=a.y).toBe(true);}});
 it('cable endpoints do not modify topology',()=>{const pts=cableCurve({x:-3,z:2},{x:4,z:0});expect(pts[0]).toMatchObject({x:-3,z:2});expect(pts.at(-1)).toMatchObject({x:4,z:0});expect(pts[8].y).toBeGreaterThan(.28);});
 it('zone palette contains model zones',()=>{for(const key of ['VLAN20','GUEST','DMZ','ROUTING','SECURITY','MGMT'])expect(ZONE_COLORS[key]).toHaveLength(3);});
});
