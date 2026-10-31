import {expect,test} from '@playwright/test';
test.describe('Cross-module enterprise — v2.2',()=>{
 test.beforeEach(async({page})=>{
  await page.goto('/training/#home');
  await page.evaluate(()=>{localStorage.removeItem('cyberlab-enterprise-v22');localStorage.removeItem('cyberlab-v21-range-draft');});
 });
 test('NGFW rule update changes attack path, telemetry and survives navigation',async({page})=>{
  await page.goto('/training/#ngfw');
  await expect(page.getByRole('heading',{name:'Shared mission configuration'})).toBeVisible();
  await page.getByRole('button',{name:'WS01 → APP01 · TCP/443: disable'}).click();
  await expect(page.getByText('NGFW denies ×')).toBeVisible();
  await page.getByRole('link',{name:'Open Unified Cyber Range'}).click();
  await expect(page.getByRole('heading',{name:/One attack/})).toBeVisible();
  const input=page.getByLabel('Type a simulated command');
  await input.fill('attack reset svc-reports');await input.press('Enter');
  await input.fill('attack login app01');await input.press('Enter');
  await expect(page.getByText(/NETWORK DENIED at ngfw-policy:/)).toBeVisible();
  await expect(page.getByText(/WS01 → APP01:443 blocked at ngfw-policy:/)).toBeVisible();
 });
 test('AD Academy delegation update blocks new resets in Unified Range',async({page})=>{
  await page.goto('/training/#adlab');
  await page.getByRole('button',{name:'Helpdesk → svc-reports: disable'}).click();
  await page.getByRole('link',{name:'Open Unified Cyber Range'}).click();
  const input=page.getByLabel('Type a simulated command');
  await input.fill('attack reset svc-reports');await input.press('Enter');
  await expect(page.getByText(/DENIED: Helpdesk has no ResetPassword right/)).toBeVisible();
 });
 test('remediation from Unified Range is visible in AD Academy',async({page})=>{
  await page.goto('/training/#unified');
  await page.getByRole('button',{name:/Remove excessive AD permission/}).click();
  await page.goto('/training/#adlab');
  await expect(page.getByRole('button',{name:'Helpdesk → svc-reports: enable'})).toBeVisible();
  await expect(page.getByText('No delegation ×')).toBeVisible();
 });
 test('3D range control persists across reload and toggles the same network path',async({page})=>{
  await page.goto('/training/#world');
  await page.getByRole('button',{name:'WS01 → APP01 · TCP/443: disable'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'WS01 → APP01 · TCP/443: enable'})).toBeVisible();
  await page.getByRole('button',{name:'WS01 → APP01 · TCP/443: enable'}).click();
  await page.getByRole('link',{name:'Open Unified Cyber Range'}).click();
  const input=page.getByLabel('Type a simulated command');await input.fill('network trace app01');await input.press('Enter');
  await expect(page.getByText(/TCP\/443 ALLOW/)).toBeVisible();
 });
});
