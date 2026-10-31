import {describe,expect,it} from 'vitest';
import {copyPreset} from './visualEngine';
import {orbitCamera,panCamera,zoomCamera} from './cameraInteraction';
describe('camera gestures',()=>{
 it('clamps zoom but permits close inspection',()=>{const c=copyPreset('isometric');expect(zoomCamera(c,-10000).distance).toBe(6.8);expect(zoomCamera(c,10000).distance).toBe(55);expect(zoomCamera(c,-300).distance).toBeLessThan(c.distance);});
 it('orbits without changing target',()=>{const c=copyPreset('isometric');const n=orbitCamera(c,100,20);expect(n.yaw).not.toBe(c.yaw);expect(n.targetX).toBe(c.targetX);});
 it('pans the center without orbiting',()=>{const c=copyPreset('isometric');const n=panCamera(c,50,30);expect(n.targetX).not.toBe(c.targetX);expect(n.yaw).toBe(c.yaw);});
});
