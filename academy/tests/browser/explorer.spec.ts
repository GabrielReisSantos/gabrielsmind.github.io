import {expect,test} from '@playwright/test';
test.describe('Enterprise Systems Explorer v2.9',()=>{
 test.beforeEach(async({page})=>{await page.goto('/training/#explorer');await page.evaluate(()=>{for(const key of Object.keys(localStorage))if(key.startsWith('cyberlab-'))localStorage.removeItem(key);});await page.reload();await expect(page.getByRole('heading',{name:/Enterprise Systems Explorer/i})).toBeVisible();});
 test('navigates via home and exposes accessible systems',async({page})=>{
  await expect(page.getByRole('group',{name:'Interactive enterprise topology'})).toBeVisible();
  await page.getByRole('button',{name:/DC01 Domain controller/i}).click();
  await expect(page.getByRole('heading',{name:'DC01'})).toBeVisible();
  await expect(page.getByText('10.10.10.10')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:/Enterprise Systems Explorer/i})).toBeVisible();
 });
 test('injects service outage and guest policy exception into shared simulation, then repairs',async({page})=>{
  await page.getByRole('button',{name:'Block approved flow'}).click();
  await expect(page.getByText('Disrupted',{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'Trace business flow'}).click();
  await expect(page.getByText('Business flow interrupted').first()).toBeVisible();
  await page.getByRole('button',{name:'Restore approved flow'}).click();
  await expect(page.getByText('Available',{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'Allow guest traffic'}).click();
  await page.getByRole('button',{name:'Test guest isolation'}).click();
  await expect(page.getByText('Guest reaches DMZ through two misconfigured layers').first()).toBeVisible();
  await page.getByRole('button',{name:'Deny guest traffic'}).click();
  await expect(page.getByText('Isolated',{exact:true}).first()).toBeVisible();
 });
 test('does not validate without evidence, accepts current-revision probes after repair',async({page})=>{
  await page.getByRole('button',{name:'Run verification suite'}).click();
  await expect(page.getByText('Verification incomplete')).toBeVisible();
  await page.getByRole('button', { name: 'Test reset rights' }).click();
  await expect(page.getByRole('button', { name: 'Collect as evidence' })).toBeVisible();
  await page.getByRole('button', { name: 'Collect as evidence' }).click();
  await page.getByRole('button',{name:'Remove permission'}).click();
  await page.getByRole('button',{name:'Test reset rights'}).click();
  await page.getByRole('button',{name:'Trace business flow'}).click();
  await page.getByRole('button',{name:'Test guest isolation'}).click();
  await page.getByRole('button',{name:'Run verification suite'}).click();
  await expect(page.getByText('Enterprise recovery validated')).toBeVisible();
  await page.getByRole('button',{name:'Disable monitoring'}).click();
  await expect(page.getByText('Enterprise recovery validated')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Offline',{exact:true}).first()).toBeVisible();
 });
});
