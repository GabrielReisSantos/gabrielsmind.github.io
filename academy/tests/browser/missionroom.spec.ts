import {expect,test} from '@playwright/test';

test.describe('Mission Room v2.8 — linked simulated consequences',()=>{
 test.beforeEach(async({page})=>{await page.goto('/training/#missionroom');await expect(page.getByRole('heading',{name:/See the breach/i})).toBeVisible();});
 test('responsive mission route exposes topology, console, evidence and stage navigation',async({page})=>{
  await expect(page.getByRole('region',{name:'Interactive enterprise network diagram'})).toBeVisible();
  await expect(page.getByRole('region',{name:'Simulated security telemetry'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Inspect ACL'})).toBeVisible();
  await page.getByRole('button',{name:'Inspect ACL'}).click();
  await expect(page.getByRole('log',{name:'Last simulated command result'})).toContainText('ResetPassword delegated');
  await page.reload();
  await expect(page.getByRole('log',{name:'Last simulated command result'})).toContainText('ResetPassword delegated');
 });
 test('a bad firewall fix changes actual native forwarding then restores it',async({page})=>{
  await expect(page.getByText('TCP/443 ALLOWED')).toBeVisible();
  await page.getByRole('button',{name:'Block app traffic'}).click();
  await expect(page.getByText('TCP/443 BLOCKED')).toBeVisible();
  await page.getByRole('button',{name:'Restore app traffic'}).click();
  await expect(page.getByText('TCP/443 ALLOWED')).toBeVisible();
 });
 test('requires attack evidence, detection and current-revision independent verification',async({page})=>{
  const run=async(command:string)=>{const input=page.getByRole('textbox',{name:'Simulated mission command'});await input.fill(command);await input.press('Enter');};
  for(const cmd of ['ad acl svc-reports','network trace app01','simulate normal','attack reset svc-reports','attack login app01'])await run(cmd);
  const suspicious=page.locator('tr').filter({hasText:'SUSPICIOUS'});
  await suspicious.filter({hasText:'4724'}).getByRole('button',{name:/Pin event/}).click();
  await suspicious.filter({hasText:'4624'}).getByRole('button',{name:/Pin event/}).click();
  await page.getByRole('textbox',{name:'Detection predicate event_id + actor or target'}).fill('event_id=4724 actor=lina.helpdesk target=svc-reports');
  await page.getByLabel('Root cause').selectOption('excessive-reset-rights');
  await page.getByLabel('Your technical explanation').fill('The helpdesk principal can reset the privileged report service account, reuse it on APP01 and leave an active session, so least privilege and rotation are required.');
  for(const cmd of ['fix remove-reset-acl','fix rotate-credential','fix sync-application','fix revoke-sessions','verify attack','verify service','verify monitoring'])await run(cmd);
  await expect(page.getByText('Mission validated')).toBeVisible();
  await page.getByRole('button',{name:'Disable logon audit'}).click();
  await expect(page.getByText('Mission validated')).toHaveCount(0);
 });
});
