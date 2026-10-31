import {expect,test} from '@playwright/test';

// Guards against the v2.8 missing-icon crash and checks both flagship workbenches.
test('Home renders and launches Connected Campaign without triggering the error boundary',async({page})=>{
 await page.goto('/training/#home');
 await expect(page.getByRole('heading',{name:/Build real understanding/i})).toBeVisible();
 await expect(page.getByRole('button',{name:/Launch Campaign/i})).toBeVisible();
 await expect(page.getByRole('heading',{name:"This workbench couldn't load."})).toHaveCount(0);
 await page.getByRole('button',{name:/Launch Campaign/i}).click();
 await expect(page).toHaveURL(/#campaign$/);
 await expect(page.getByRole('heading',{name:/One enterprise/i})).toBeVisible();
 await expect(page.getByRole('heading',{name:"This workbench couldn't load."})).toHaveCount(0);
});

test('Mission Room remains accessible independently of the new campaign',async({page})=>{
 await page.goto('/training/#missionroom');
 await expect(page.getByRole('heading',{name:/See the breach/i})).toBeVisible();
 await expect(page.getByRole('heading',{name:"This workbench couldn't load."})).toHaveCount(0);
});
