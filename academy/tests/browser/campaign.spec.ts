import {expect,test,type Page} from '@playwright/test';
async function report(page:Page,cause:string){
 await page.locator('.cm-form select').selectOption(cause);
 await page.locator('.cm-form textarea').nth(0).fill('A simulated attacker reached the reports service after the identified security weakness. The incident potentially affected sensitive report data.');
 await page.locator('.cm-form textarea').nth(1).fill('I repaired the affected identity or network security controls, revoked live access, and preserved authorized reporting connectivity.');
 await page.locator('.cm-form textarea').nth(2).fill('I ran the negative security probe again and confirmed approved WS01-to-APP01 HTTPS is still delivered.');
}
async function pinLastAttack(page:Page){await page.locator('.cm-event').filter({has:page.locator('.cm-event-mark.critical')}).first().getByRole('button',{name:'Pin evidence'}).click();}
async function probe(page:Page,name:string){await page.getByRole('button',{name:new RegExp(name)}).click();}
test.describe('Connected Campaign v3.0',()=>{
 test.beforeEach(async({page})=>{await page.goto('/training/#campaign');await page.evaluate(()=>{for(const key of Object.keys(localStorage))if(key.startsWith('cyberlab-'))localStorage.removeItem(key);});await page.reload();await expect(page.getByRole('heading',{name:/One enterprise/i})).toBeVisible();});
 test('renders on desktop and mobile without error boundary and preserves initial state',async({page})=>{
  await expect(page.getByRole('button',{name:/The guest pivot/i})).toBeDisabled();
  await expect(page.getByRole('button',{name:/Silent token abuse/i})).toBeDisabled();
  await expect(page.getByText("This workbench couldn't load.")).toHaveCount(0);
  await page.getByRole('button',{name:/Start & inject simulated fault/}).click();
  await expect(page.getByRole('group',{name:'Interactive enterprise topology'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:/Replay adversary action/})).toBeVisible();
  await expect(page.getByText("This workbench couldn't load.")).toHaveCount(0);
 });
 test('requires evidence, preserves business access, and chains three verified incidents',async({page})=>{
  test.setTimeout(95_000);
  await page.getByRole('button',{name:/Start & inject simulated fault/}).click();
  await page.getByRole('button',{name:/Run independent verification/}).click();
  await expect(page.getByText('Recovery incomplete')).toBeVisible();
  await page.getByRole('button',{name:/Replay adversary action/}).click();
  await pinLastAttack(page);
  await page.getByRole('button',{name:'Remove access'}).click();
  await page.getByRole('button',{name:'Revoke'}).click();
  await probe(page,'Business flow');await probe(page,'Directory ACL');await report(page,'ad-delegation');
  await page.getByRole('button',{name:/Run independent verification/}).click();
  await expect(page.locator('.cm-verdict.passed')).toBeVisible();
  await page.getByRole('button',{name:/Continue to next incident/}).click();
  await page.getByRole('button',{name:/Start & inject simulated fault/}).click();
  await page.getByRole('button',{name:/Replay adversary action/}).click();await pinLastAttack(page);
  await page.getByRole('button',{name:'Deny guest'}).click();
  await probe(page,'Guest controls');
  await page.getByRole('button',{name:/Run independent verification/}).click();
  await expect(page.locator('.cm-verdict.passed')).toHaveCount(0);
  await page.getByRole('button',{name:'Remove rule'}).click();
  await page.getByRole('button',{name:'Revoke'}).click();
  await probe(page,'Business flow');await probe(page,'Guest controls');await report(page,'dual-policy');
  await page.getByRole('button',{name:/Run independent verification/}).click();
  await expect(page.locator('.cm-verdict.passed')).toBeVisible();
  await page.getByRole('button',{name:/Continue to next incident/}).click();
  await page.getByRole('button',{name:/Start & inject simulated fault/}).click();
  await page.getByRole('button',{name:/Replay adversary action/}).click();
  await pinLastAttack(page);
  await page.getByRole('button',{name:'Restore'}).click();
  await page.getByRole('button',{name:/Replay adversary action/}).click();
  await page.getByRole('button',{name:'Rotate token'}).click();
  await page.getByRole('button',{name:'Revoke'}).click();
  await probe(page,'Business flow');await probe(page,'Token status');await report(page,'token-exposure');
  await page.getByRole('button',{name:/Run independent verification/}).click();
  await expect(page.locator('.cm-verdict.passed')).toBeVisible();
  await expect(page.locator('.cm-hero-score')).toContainText('3');
  await page.reload();await expect(page.locator('.cm-verdict.passed')).toBeVisible();
 });
});
