import {expect,test} from '@playwright/test';
test('dashboard loads under /training/ and modules are navigable',async({page})=>{
 await page.goto('./');
 await expect(page).toHaveTitle(/Dashboard.*CyberLab/);
 await expect(page.getByRole('heading',{name:/Build real understanding/i})).toBeVisible();
 await page.getByRole('button',{name:/Start learning/i}).click();
 await expect(page).toHaveURL(/#foundation/);
 await expect(page.getByRole('heading',{name:/Understand networks and code/i})).toBeVisible();
});
test('2D network map is available and supports keyboard selection',async({page})=>{
 await page.goto('./#world');
 await expect(page.getByRole('heading',{name:/Cyber Range/i})).toBeVisible();
 await page.getByRole('button',{name:'2D accessible map'}).click();
 await expect(page.getByRole('region',{name:/Accessible 2D network diagram/i})).toBeVisible();
 await page.getByRole('button',{name:/PC-2/i}).first().focus();
 await page.keyboard.press('Enter');
 await expect(page.getByText('PC-2').first()).toBeVisible();
});
test('resume uses last visited module, not inferred completion',async({page})=>{
 await page.goto('./#pentest');
 await expect(page.getByRole('heading',{name:/Pentest/i}).first()).toBeVisible();
 await page.goto('./');
 await expect(page.getByRole('button',{name:/Resume Pentest Academy/i})).toBeVisible();
});
test('mobile menu exposes navigation',async({page,isMobile})=>{
 test.skip(!isMobile,'mobile project only');
 await page.goto('./');
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.getByRole('complementary',{name:'Application navigation'})).toBeVisible();
});
