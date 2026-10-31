import {expect,test} from '@playwright/test';
test.describe('Unified Range UR-001',()=>{
 test.beforeEach(async({page})=>{await page.goto('/training/#unified');await expect(page.getByRole('heading',{name:/One attack/})).toBeVisible();});
 test('navigates through a shared topology and renders correlated evidence',async({page})=>{
  const command=page.getByLabel('Type a simulated command');
  await command.fill('simulate normal');await command.press('Enter');
  await command.fill('attack reset svc-reports');await command.press('Enter');
  await command.fill('attack login app01');await command.press('Enter');
  await expect(page.getByText('ATTACK PATH OPEN:')).toBeVisible();
  await expect(page.getByText('1724',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:/Helpdesk principal successfully reset service-account password/}).click();
  await expect(page.getByText('Causal action')).toBeVisible();
  await page.getByRole('button',{name:'Pin to evidence'}).click();
  await expect(page.getByText('EVIDENCE',{exact:false}).first()).toBeVisible();
 });
 test('replay requires remediation and preserving application service',async({page})=>{
  const command=page.getByLabel('Type a simulated command');
  const run=async(commandText:string)=>{await command.fill(commandText);await command.press('Enter');};
  await run('simulate normal');await run('attack reset svc-reports');await run('attack login app01');
  await page.getByRole('button',{name:/Remove excessive AD permission/}).click();
  await page.getByRole('button',{name:/Rotate the service credential/}).click();
  await page.getByRole('button',{name:/Invalidate existing sessions/}).click();
  await page.getByRole('button',{name:'Test attack blocked'}).click();
  await page.getByRole('button',{name:'Test approved service'}).click();
  await expect(page.getByText('FAIL — application credential is stale')).toBeVisible();
  await page.getByRole('button',{name:/Update the legitimate app secret/}).click();
  await page.getByRole('button',{name:'Test attack blocked'}).click();
  await page.getByRole('button',{name:'Test approved service'}).click();
  await page.getByRole('button',{name:'Test monitoring'}).click();
  await expect(page.getByText('PASS at current revision')).toHaveCount(3);
 });
});
