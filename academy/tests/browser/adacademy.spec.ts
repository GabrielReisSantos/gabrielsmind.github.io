import {test,expect} from '@playwright/test';

test('AD foundations, Kerberos/NTLM explorer, and attack-path navigation',async({page})=>{
 await page.goto('/training/#adlab');
 await expect(page.getByRole('heading',{name:/Active Directory, explained and investigated/i})).toBeVisible();
 await page.getByRole('button',{name:/DNS & domain discovery/i}).click();
 await expect(page.getByRole('heading',{name:'DNS & domain discovery'})).toBeVisible();
 await page.getByRole('button',{name:/^B SRV$/}).click();
 await expect(page.getByText('Correct. This concept check is saved locally.')).toBeVisible();
 await page.getByRole('button',{name:'Authentication Lab'}).click();
 await page.getByLabel('Inject a troubleshooting fault').selectOption('spn');
 await expect(page.getByText(/cannot find the requested service principal/i)).toBeVisible();
 await page.getByRole('button',{name:'NTLM',exact:true}).click();
 await expect(page.getByText(/SPN mismatch is a Kerberos/i)).toBeVisible();
 await page.getByRole('button',{name:'Abuse & Defense Atlas'}).click();
 await expect(page.getByRole('heading',{name:'Kerberoasting'})).toBeVisible();
 await page.getByRole('button',{name:/Investigate & Defend/}).click();
 await expect(page.getByRole('heading',{name:/Find the risky relationship/i})).toBeVisible();
});

test('AD investigation requires typed evidence and preserves approved administration',async({page})=>{
 await page.goto('/training/#adlab');
 await page.getByRole('button',{name:/Investigate & Defend/}).click();
 await page.getByRole('button',{name:/Record baseline path/}).click();
 const input=page.getByRole('textbox',{name:'Simulated AD command'});
 for(const cmd of ['whoami /groups','Get-Acl "AD:\\CN=svc-inventory,OU=Services,DC=corp,DC=cyberlab,DC=test"']){
  await input.fill(cmd);await page.getByRole('button',{name:'Run',exact:true}).click();
  await page.getByRole('button',{name:'Pin evidence'}).last().click();
 }
 await page.locator('.ada-diagnoses input[type=radio]').first().check();
 await page.locator('.ada-permission input[type=checkbox]:enabled').first().uncheck();
 await page.getByRole('textbox',{name:'Evidence-backed technical finding'}).fill('The Helpdesk group held excessive GenericAll directory rights over the privileged service identity. The original ACL and group results support the modeled risk. Removing only that delegation preserves approved administration.');
 await page.getByRole('button',{name:'Retest current revision'}).click();
 await page.getByRole('button',{name:'Validate evidence'}).click();
 await expect(page.getByText(/Validated: the modeled risk path was removed/i)).toBeVisible();
});

test('AD academy refuses arbitrary commands',async({page})=>{
 await page.goto('/training/#adlab');await page.getByRole('button',{name:/Investigate & Defend/}).click();
 await page.getByRole('textbox',{name:'Simulated AD command'}).fill('powershell -enc Y2FsYw==');
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.getByText(/Not a supported command/)).toBeVisible();
});
