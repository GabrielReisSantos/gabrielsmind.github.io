import {expect,test} from '@playwright/test';

test('CASE-001 requires correlated evidence and a narrow security-preserving retest',async({page})=>{
 await page.goto('./#investigation2');
 await expect(page.getByRole('heading',{name:'Suspicious traffic from WEBSRV1'})).toBeVisible();
 const run=async(command:string)=>{
  await page.getByLabel('analyst@cyberlab:~$').fill(command);
  await page.getByRole('button',{name:/Run fixture/i}).click();
  await page.getByRole('button',{name:'Pin observation as evidence'}).click();
 };
 await run('curl -I http://10.10.10.20');
 for(const command of ['show web access','show firewall logs','show processes','show integrity','show forensic timeline'])await run(command);
 await expect(page.getByText(/Hypothesis is supported/i)).toHaveCount(0);
 await page.getByRole('radio',{name:/Unsafe upload handling introduced a server-side artifact/i}).check();
 await expect(page.getByText('Hypothesis is supported. Configuration repair unlocked.')).toBeVisible();
 for(const name of ['Quarantine unauthorized artifact','Harden upload validation','Restrict DMZ egress to approved destinations'])await page.getByRole('button',{name:new RegExp(name,'i')}).click();
 for(const command of ['test normal','test attack-path','test segmentation'])await run(command);
 await expect(page.getByText('Current revision satisfies business and security invariants.')).toBeVisible();
 await page.getByRole('button',{name:/Evidence report/i}).click();
 await page.getByLabel('Root cause').selectOption('upload-egress');
 await page.getByLabel('Demonstrated impact').selectOption('controlled-outbound');
 await page.getByLabel('Required controls').selectOption('artifact-upload-egress');
 const before=page.locator('.inv2-citations fieldset').first();
 const after=page.locator('.inv2-citations fieldset').nth(1);
 for(const command of ['show web access','show firewall logs','show processes'])await before.getByLabel(new RegExp(command)).check();
 for(const command of ['test normal','test attack-path','test segmentation'])await after.getByLabel(new RegExp(command)).check();
 await page.getByLabel('Executive summary').fill('The fictional server experienced upload-based abuse that resulted in unexpected outbound connections. No evidence establishes database access or data theft.');
 await page.getByLabel('Technical finding & evidence correlation').fill('Correlated web access, process-tree execution and outbound firewall logs confirm the simulated upload chain. We quarantined the artifact, hardened upload validation and allowed only authorized egress, then retested.');
 await page.getByLabel('Uncertainty and scope limitations').fill('This case relies on fictional fixtures; it cannot demonstrate real-world exploitation, database theft or persistence outside the provided data.');
 await page.getByRole('button',{name:'Submit assessment'}).click();
 await expect(page.getByText('All modeled criteria satisfied')).toBeVisible();
 await page.reload();
 await page.getByRole('button',{name:/Evidence report/i}).click();
 await expect(page.getByText('All modeled criteria satisfied')).toBeVisible();
});

test('CASE-001 rejects arbitrary shell text and incorrect diagnosis',async({page})=>{
 await page.goto('./#investigation2');
 await page.getByLabel('analyst@cyberlab:~$').fill('cat /etc/shadow');
 await page.getByRole('button',{name:/Run fixture/}).click();
 await expect(page.getByRole('alert')).toContainText('Unsupported simulated command');
 await expect(page.getByRole('radio',{name:/DNS poisoning redirected/})).toBeDisabled();
});
