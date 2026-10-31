import {expect,test} from '@playwright/test';

test.beforeEach(async({page})=>{
 await page.goto('./#practice');
 await expect(page.getByRole('heading',{name:/Investigate.*Prove.*Repair/i})).toBeVisible();
});

test('OSCP Deep Practice can validate a narrow fix with provenance and replay',async({page})=>{
 await page.getByRole('button',{name:/Normal catalog request/i}).click();
 await page.getByRole('button',{name:'Pin evidence'}).first().click();
 await page.getByRole('button',{name:/Bounded query-control proof/i}).click();
 await page.getByRole('button',{name:'Pin evidence'}).first().click();
 await page.getByRole('button',{name:/Unauthorized customer export/i}).click();
 await page.getByRole('button',{name:'Pin evidence'}).first().click();
 await page.getByRole('button',{name:/Untrusted item input is concatenated/i}).click();
 await page.getByRole('button',{name:/Parameterize query, constrain item ID/i}).click();
 await page.getByRole('button',{name:/Normal catalog request/i}).click();
 await page.getByRole('button',{name:'Pin evidence'}).first().click();
 await page.getByRole('button',{name:/Bounded query-control proof/i}).click();
 await page.getByRole('button',{name:'Pin evidence'}).first().click();
 await page.getByRole('button',{name:/Unauthorized customer export/i}).click();
 await page.getByRole('button',{name:'Pin evidence'}).first().click();
 await expect(page.getByText('Current retest:').first()).toContainText('Pass');
 await page.getByRole('navigation',{name:'Case views'}).getByRole('button',{name:'Evidence report',exact:true}).click();
 for(const label of ['Executive summary','Technical finding and steps','Demonstrated impact','Remediation and retesting','Limits and unknowns']){
  await page.getByLabel(label).fill(`Synthetic fixture evidence is examined, verified against a bounded scenario, and documented without claiming exploitation beyond observed responses for this case. ${label}`);
 }
 await page.locator('.practice-citations fieldset').first().locator('input').nth(1).check();
 await page.locator('.practice-citations fieldset').first().locator('input').nth(2).check();
 await page.locator('.practice-citations fieldset').nth(1).locator('input').nth(0).check();
 await page.locator('.practice-citations fieldset').nth(1).locator('input').nth(1).check();
 await page.locator('.practice-citations fieldset').nth(1).locator('input').nth(2).check();
 await expect(page.getByText('Report text: Complete')).toBeVisible();
 await expect(page.getByText('After citations: Validated')).toBeVisible();
 await page.getByRole('button',{name:/Timeline & replay/i}).click();
 await expect(page.getByText(/Configuration change/).first()).toBeVisible();
});

test('cosmetic mitigation fails retest and saved progress survives reload',async({page})=>{
 for(const name of ['Normal catalog request','Bounded query-control proof','Unauthorized customer export']){
  await page.getByRole('button',{name:new RegExp(name,'i')}).click();
  await page.getByRole('button',{name:'Pin evidence'}).first().click();
 }
 await page.getByRole('button',{name:/Untrusted item input is concatenated/i}).click();
 await page.getByRole('button',{name:/Suppress SQL error logging only/i}).click();
 for(const name of ['Normal catalog request','Bounded query-control proof','Unauthorized customer export']){
  await page.getByRole('button',{name:new RegExp(name,'i')}).click();
  await page.getByRole('button',{name:'Pin evidence'}).first().click();
 }
 await expect(page.getByText('Current retest:').first()).toContainText('Incomplete / failed');
 await page.reload();
 await expect(page.getByText('Configuration revision:').first()).toContainText('1');
});
