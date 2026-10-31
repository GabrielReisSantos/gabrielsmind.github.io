import {expect,test} from '@playwright/test';

// These are browser acceptance tests. They require a real Vite build and Chromium.
test.beforeEach(async ({page})=>{
 await page.goto('./#incident');
 await expect(page.getByRole('heading',{name:/INC-0042 Application outage/i})).toBeVisible();
});

test('INC-0042 starts with a blocked baseline and offers real topology diagnostics',async({page})=>{
 await expect(page.getByRole('region',{name:/Accessible 2D network diagram/i})).toBeVisible();
 await page.getByRole('button',{name:'Capture failed baseline'}).click();
 await expect(page.getByText('Captured evidence (1)')).toBeVisible();
 await page.getByRole('button',{name:'show policies'}).click();
 await expect(page.getByText(/broad-deny/i).first()).toBeVisible();
 await page.getByRole('button',{name:'show routes'}).click();
 await expect(page.getByText('Captured evidence (3)')).toBeVisible();
});

test('policy order repair requires current successful retest, blocked negative probes and cited report',async({page})=>{
 await page.getByRole('button',{name:'Capture failed baseline'}).click();
 await page.getByRole('button',{name:'show policies'}).click();
 await page.getByRole('button',{name:'show routes'}).click();
 await page.getByRole('button',{name:'Repair',exact:true}).click();
 await page.locator('.incident-policy').filter({hasText:'specific-https'}).getByRole('button',{name:'↑'}).click();
 await page.getByRole('button',{name:/Retest HTTPS and prohibited flows/i}).click();
 await expect(page.getByText('Captured evidence (6)')).toBeVisible();
 await page.getByRole('button',{name:'Report',exact:true}).click();
 await page.getByLabel('Root cause hypothesis').selectOption('policy-shadow');
 await page.getByLabel('Policy output before repair').selectOption('EV-002');
 await page.getByLabel('Successful HTTPS retest').selectOption('EV-004');
 await page.getByLabel('Blocked isolation probe').selectOption('EV-005');
 await page.getByLabel('Technical analysis').fill('EV-002 proves the broad deny is evaluated before the specific HTTPS permit, so the first matching policy denies the requested flow.');
 await page.getByLabel('Security impact').fill('Approved analyst access to the DMZ HTTPS service is unavailable; no compromise is demonstrated.');
 await page.getByLabel('Remediation').fill('Move the specific TRUST to DMZ TCP 443 permit above the broad deny; retain the narrower security boundary.');
 await page.getByLabel('Retest summary').fill('EV-004 shows that authorized HTTPS is delivered, while EV-005 and EV-006 remain denied after the change.');
 await page.getByRole('button',{name:'Submit validation'}).click();
 await expect(page.getByRole('status').filter({hasText:/Investigation completed and evidence validated/})).toBeVisible();
});
