import {test,expect} from '@playwright/test';
test('Secrets Storage Atlas: typed evidence, classification, remediation, saved progress',async({page})=>{
 await page.goto('/training/#secrets');
 await expect(page.getByRole('heading',{name:/Where do secrets live/i})).toBeVisible();
 const cmd=page.getByRole('textbox',{name:'Secrets lab command'});
 await cmd.fill('retest');await cmd.press('Enter');
 await expect(page.getByText(/No appropriate remediation/)).toBeVisible();
 for(const command of ['git ls-files .env','classify exposed','fix rotate-remove','retest']){await cmd.fill(command);await cmd.press('Enter');}
 await expect(page.getByRole('progressbar',{name:'Secrets lab progress'})).toHaveAttribute('aria-valuenow','1');
 await page.reload();
 await expect(page.getByRole('progressbar',{name:'Secrets lab progress'})).toHaveAttribute('aria-valuenow','1');
 await page.getByRole('navigation',{name:'Secret storage environments'}).getByRole('button',{name:/Windows/}).click();
 await expect(page.getByRole('heading',{name:/Credential Manager metadata/})).toBeVisible();
 await page.getByRole('button',{name:'Independent'}).click();
 await expect(page.getByText(/Independent mode: use the objective/)).toBeVisible();
});
