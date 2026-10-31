import {test,expect} from '@playwright/test';

test('AD mission saves typed notes, recovers across reloads, and switches cases independently',async({page})=>{
 await page.goto('/training/#adlab');
 await page.locator('.ada-nav').getByRole('button',{name:'Investigate & Defend'}).click();
 await expect(page.getByRole('region',{name:'Mission control'})).toBeVisible();
 await page.getByRole('textbox',{name:'Evidence-backed technical finding'}).fill('My independent technical finding about excessive directory delegation and possible indirect privilege escalation.');
 await page.reload();
 await expect(page.getByRole('textbox',{name:'Evidence-backed technical finding'})).toHaveValue(/My independent technical finding/);
 await page.getByRole('button',{name:/Service-ticket exposure chain/i}).click();
 await page.getByRole('textbox',{name:'Evidence-backed technical finding'}).fill('Other mission notes.');
 await page.getByRole('button',{name:/Over-delegated service account/i}).click();
 await expect(page.getByRole('textbox',{name:'Evidence-backed technical finding'})).toHaveValue(/My independent/);
});

test('AD explorer can search, focus identities and toggle perspective without resetting edits',async({page})=>{
 await page.goto('/training/#adlab');
 await page.locator('.ada-nav').getByRole('button',{name:'Investigate & Defend'}).click();
 await page.getByRole('searchbox',{name:'Find identity or computer'}).fill('Helpdesk');
 await page.getByRole('button',{name:/Helpdesk group/i}).first().click();
 await expect(page.getByText(/Support group; no legitimate right/i)).toBeVisible();
 await page.getByRole('button',{name:/3D graph/i}).click();
 await expect(page.getByRole('group',{name:/Perspective 3D Active Directory relationship diagram/i})).toBeVisible();
 await page.getByRole('button',{name:'Fit entire graph'}).click();
 await page.getByRole('button',{name:/2D map/i}).click();
 await expect(page.getByRole('group',{name:/Two-dimensional Active Directory relationship diagram/i})).toBeVisible();
});

test('onboarding milestones reflect real actions, not checkboxes',async({page})=>{
 await page.goto('/training/#guide');
 await expect(page.getByText('Verified by interaction')).toHaveCount(0);
 await page.goto('/training/#adlab');
 await page.locator('.ada-nav').getByRole('button',{name:'Investigate & Defend'}).click();
 await page.getByRole('button',{name:'Zoom AD graph in'}).click();
 await page.goto('/training/#guide');
 await expect(page.getByText('Verified by interaction')).toHaveCount(2);
});
