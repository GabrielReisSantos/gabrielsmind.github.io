import {expect,test} from '@playwright/test';
test('getting started page links to the right workbenches',async({page})=>{
 await page.goto('/training/#guide');
 await expect(page.getByRole('heading',{name:/Learn the platform/i})).toBeVisible();
 await page.getByRole('button',{name:/Start with Active Directory/i}).click();
 await expect(page).toHaveURL(/#adlab/);
});
test('3D range exposes zoom, pan, and camera reset',async({page})=>{
 await page.goto('/training/#world');
 // The native enterprise editor has its own independent camera above this lab.
 const range=page.locator('.world-main');
 const camera=range.getByRole('status').filter({hasText:/Drag orbit/i});
 await expect(range.getByRole('button',{name:'Zoom in',exact:true})).toBeVisible();
 await expect(camera).toBeVisible();
 await expect(camera).toContainText('Zoom 100%');
 const initialCamera=await camera.innerText();
 await range.getByRole('button',{name:'Zoom in',exact:true}).click();
 await expect(camera).not.toContainText('Zoom 100%');
 await range.getByRole('button',{name:'Pan camera left',exact:true}).click();
 await expect(camera).not.toContainText('pan 0.0, 0.0');
 await range.getByRole('button',{name:'Reset camera',exact:true}).click();
 await expect(camera).toHaveText(initialCamera);
});
test('AD mission switches between 2D and perspective 3D without losing its scenario',async({page})=>{
 await page.goto('/training/#adlab');
 await page.locator('.ada-nav').getByRole('button',{name:'Investigate & Defend'}).click();
 await expect(page.getByRole('button',{name:/2D map/i})).toBeVisible();
 await page.getByRole('button',{name:/3D graph/i}).click();
 await expect(page.getByRole('group',{name:/Perspective 3D Active Directory relationship diagram/i})).toBeVisible();
 await page.getByRole('button',{name:/Zoom AD graph in/i}).click();
 await page.getByRole('button',{name:/2D map/i}).click();
 await expect(page.getByRole('group',{name:/Two-dimensional Active Directory relationship diagram/i})).toBeVisible();
});
