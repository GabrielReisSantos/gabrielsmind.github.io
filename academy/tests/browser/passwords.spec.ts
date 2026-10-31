import {test,expect} from '@playwright/test';
test('OSCP password audit opens from Pentest Academy and enforces ordered checkpoints',async({page})=>{
 await page.goto('/training/#pentest');
 await page.getByRole('button',{name:/Password Cracking Lab/i}).click();
 await expect(page.getByRole('heading',{name:/Hash Cracking Lab/i})).toBeVisible();
 await expect(page).toHaveURL(/#passwords/);
 const terminal=page.getByRole('textbox',{name:'Password audit command'});
 await terminal.fill('hashcat -m 1400 -a 0 hashes.txt shortlist.txt');await terminal.press('Enter');
 await expect(page.getByText(/Complete the current step first/)).toBeVisible();
 await terminal.fill('cat scope.txt');await terminal.press('Enter');
 await terminal.fill('cat hashes.txt');await terminal.press('Enter');
 await expect(page.getByRole('progressbar',{name:'Password lab progress'})).toHaveAttribute('aria-valuenow','1');
 await page.reload();
 await expect(page.getByRole('progressbar',{name:'Password lab progress'})).toHaveAttribute('aria-valuenow','1');
 await page.getByRole('button',{name:'Independent'}).click();
 await expect(page.getByText(/Command examples hidden/)).toBeVisible();
});
