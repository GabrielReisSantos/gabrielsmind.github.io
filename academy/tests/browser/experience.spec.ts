import {expect,test} from '@playwright/test';

test('CyberLab v2 navigation keeps the previous learning and lab routes',async({page})=>{
 await page.goto('/training/#learn');
 await expect(page.getByRole('heading',{name:'Understand the systems.'})).toBeVisible();
 await page.getByRole('button',{name:/Active Directory.*Open workbench/i}).click();
 await expect(page).toHaveURL(/#adlab$/);
 await page.goto('/training/#labs');
 await expect(page.getByRole('heading',{name:'Practice in the lab.'})).toBeVisible();
 await page.goto('/training/#investigate');
 await expect(page.getByRole('heading',{name:'Investigate. Repair. Verify.'})).toBeVisible();
 await page.goto('/training/#progress');
 await expect(page.getByRole('heading',{name:'Your progress, in context.'})).toBeVisible();
 await page.goto('/training/#world');
 await expect(page.getByRole('heading',{name:/Cyber Range/i})).toBeVisible();
 await page.goto('/training/#purple');
 await expect(page.getByRole('navigation',{name:'Investigation workflow'})).toBeVisible();
 await page.getByRole('button',{name:/Telemetry.*Find supporting evidence/i}).click();
 await expect(page.locator('#pt-telemetry')).toBeVisible();
 await page.goto('/training/#certification');
 await expect(page.getByRole('group',{name:'Certification study mode'})).toBeVisible();
});

test('v2 return home resume preserves the previously visited module',async({page})=>{
 await page.goto('/training/#pentest');
 await page.goto('/training/#home');
 await expect(page.getByRole('button',{name:/Resume Pentest Academy/i})).toBeVisible();
});

test('v2 mobile drawer exposes six primary sections',async({page,isMobile})=>{
 test.skip(!isMobile,'mobile project only');
 await page.goto('/training/');
 await page.getByRole('button',{name:'Open navigation'}).click();
 const nav=page.getByRole('navigation',{name:'Main sections'});
 await expect(nav.getByRole('button',{name:'My Progress'})).toBeVisible();
 await expect(nav.getByRole('button',{name:'Certifications'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('complementary',{name:'Application navigation'})).not.toHaveClass(/open/);
});
