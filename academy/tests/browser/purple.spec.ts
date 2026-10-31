import {test,expect} from '@playwright/test';

async function command(page:import('@playwright/test').Page,value:string){
 await page.getByRole('textbox',{name:'Command'}).fill(value);
 await page.getByRole('button',{name:'Execute simulated command'}).click();
}

test('Purple Team links simulated attack, AD events, detection, remediation and report',async({page})=>{
 await page.goto('/training/#purple');
 await expect(page.getByRole('heading',{name:/Attack\. Observe\. Harden\. Replay\./})).toBeVisible();
 await page.getByRole('button',{name:'Generate approved business activity'}).click();
 await page.getByRole('button',{name:'Start baseline'}).click();
 for(const action of ['enum spn','request tickets','login app01'])await command(page,action);
 await expect(page.locator('#pt-telemetry').getByText('TGS issued: RC4 (legacy service configuration); request 1',{exact:true})).toBeVisible();
 await page.locator('.pt-event-risk').filter({hasText:'TGS issued: RC4'}).first().getByRole('button',{name:/Pin event/}).click();
 await page.getByLabel('Detection logic').selectOption('tuned');
 await page.getByLabel('Use strong managed service credentials').check();
 await page.getByLabel('Rotate the exposed service secret').check();
 await page.getByRole('button',{name:'Start repair retest'}).click();
 for(const action of ['enum spn','request tickets','login app01'])await command(page,action);
 await command(page,'test legitimate');
 await expect(page.getByText('PASS: approved business access still works.')).toBeVisible();
 await page.locator('.pt-actions-list > div').filter({hasText:'login app01'}).first().getByRole('button',{name:'Pin output'}).click();
 await page.getByLabel('Primary root cause').selectOption('Legacy service-account credential and encryption exposure');
 await page.getByLabel('Your technical assessment').fill('The baseline exposed an RC4 service ticket pattern on DC01, with follow-on APP01 access. The synthetic 4769 records and service logons supported the finding. Managed service credentials and rotation removed unauthorized impact, while a new approved-access probe still succeeded.');
 await page.getByRole('button',{name:'Submit technical investigation'}).click();
 await expect(page.getByText(/Scenario passed: observed, tuned, hardened and safely replayed/)).toBeVisible();
});

test('Purple Team rejects a broad shutdown as a safe remediation',async({page})=>{
 await page.goto('/training/#purple');
 await page.getByRole('button',{name:'Start baseline'}).click();
 for(const action of ['enum spn','request tickets','login app01'])await command(page,action);
 await page.getByLabel('Unsafe shortcut: disable APP01 for everyone').check();
 await page.getByRole('button',{name:'Start repair retest'}).click();
 for(const action of ['enum spn','request tickets','login app01'])await command(page,action);
 await command(page,'test legitimate');
 await expect(page.getByText(/FAIL: approved business workflow has been disrupted/)).toBeVisible();
 await page.getByRole('button',{name:'Submit technical investigation'}).click();
 await expect(page.getByText(/Unmet requirements remain/)).toBeVisible();
});
