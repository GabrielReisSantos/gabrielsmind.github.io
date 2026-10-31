import {test,expect} from '@playwright/test';

test('native NGFW ordered policy changes the Unified Range verdict and survives reload',async({page})=>{
 await page.goto('/training/#ngfw');
 const ngfw=page.getByRole('region',{name:'Native enterprise NGFW policy editor'});
 await expect(ngfw).toBeVisible();
 await expect(ngfw.getByText('WS01 → APP01:443 DELIVERED')).toBeVisible();
 // Toggle the first native rule, not any of the independent NGFW classroom exercises.
 await ngfw.getByRole('button',{name:'ALLOW',exact:true}).click();
 await expect(ngfw.getByText('WS01 → APP01:443 BLOCKED')).toBeVisible();
 await expect(ngfw.getByText('Cause: ngfw-policy')).toBeVisible();
 await page.goto('/training/#unified');
 await expect(page.getByText(/Native forwarding · configuration revision/)).toBeVisible();
 await expect(page.getByText(/Stage: ngfw-policy/)).toBeVisible();
 await page.reload();
 await expect(page.getByText(/Stage: ngfw-policy/)).toBeVisible();
 await page.goto('/training/#ngfw');
 await ngfw.locator('.ne-rule').first().getByRole('button', { name: 'DENY', exact: true }).click();
 await expect(ngfw.getByText('WS01 → APP01:443 DELIVERED')).toBeVisible();
});

test('real 3D cable shutdown propagates into the Unified Range without a fabricated firewall log',async({page})=>{
 await page.goto('/training/#world');
 const topology=page.getByRole('region',{name:'Native enterprise 3D network editor'});
 await expect(topology).toBeVisible();
 await expect(topology.getByText('WS01 → APP01:443 DELIVERED')).toBeVisible();
 await topology.getByRole('button',{name:'c1: disable physical cable'}).click();
 await expect(topology.getByText('WS01 → APP01:443 BLOCKED')).toBeVisible();
 await expect(topology.getByText('Cause: physical')).toBeVisible();
 await page.goto('/training/#unified');
 await expect(page.getByText(/Stage: physical/)).toBeVisible();
 const input=page.getByRole('textbox',{name:'Type a simulated command'});
 await input.fill('attack reset svc-reports');await input.press('Enter');
 await input.fill('attack login app01');await input.press('Enter');
 await expect(page.getByText(/NETWORK DENIED at physical/)).toBeVisible();
 await page.goto('/training/#world');
 await topology.getByRole('button',{name:'c1: enable physical cable'}).click();
 await expect(topology.getByText('WS01 → APP01:443 DELIVERED')).toBeVisible();
});

test('native route and independent NGFW DMZ route affect the same TCP/443 flow',async({page})=>{
 await page.goto('/training/#world');
 const topology=page.getByRole('region',{name:'Native enterprise 3D network editor'});
 await topology.getByLabel('Next hop').selectOption('dc01');
 await expect(topology.getByText('WS01 → APP01:443 BLOCKED')).toBeVisible();
 await topology.getByLabel('Next hop').selectOption('app01');
 await expect(topology.getByText('WS01 → APP01:443 DELIVERED')).toBeVisible();
 await page.goto('/training/#ngfw');
 const ngfw=page.getByRole('region',{name:'Native enterprise NGFW policy editor'});
 await ngfw.getByRole('checkbox',{name:'NGFW DMZ forwarding route enabled'}).uncheck();
 await expect(ngfw.getByText('WS01 → APP01:443 BLOCKED')).toBeVisible();
 await expect(ngfw.getByText('Cause: routing')).toBeVisible();
});
