import {expect,test} from '@playwright/test';

test('core navigation, restoration and backup remain usable',async({page})=>{
 await page.goto('/training/#progress');
 await expect(page.getByRole('heading',{name:'Your progress, in context.'})).toBeVisible();
 await page.getByRole('button',{name:'Select backup'}).click();
 const payload={format:'cyberlab-local-backup',version:1,exportedAt:new Date().toISOString(),records:{'cyberlab-v18-ad-lessons':'["dns"]'}};
 await page.locator('input[type=file][aria-label="Select CyberLab progress backup"]').setInputFiles({name:'cyberlab-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
 await expect(page.getByRole('button',{name:'Confirm import & reload'})).toBeVisible();
 await page.getByRole('button',{name:'Confirm import & reload'}).click();
 await expect(page.getByText('1 / 8', {exact:false}).first()).toBeVisible();
 const v=await page.evaluate(()=>localStorage.getItem('cyberlab-v18-ad-lessons'));
 expect(v).toBe('["dns"]');
});

test('malformed progress backup is rejected without mutation',async({page})=>{
 await page.goto('/training/#progress');
 await page.evaluate(()=>localStorage.setItem('cyberlab-test-sentinel','{"ok":true}'));
 const payload={format:'cyberlab-local-backup',version:1,records:{'cyberlab-test-sentinel':'not-json'}};
 await page.locator('input[type=file][aria-label="Select CyberLab progress backup"]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
 await expect(page.getByText(/Import rejected/)).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('cyberlab-test-sentinel'))).toBe('{"ok":true}');
});

test('mobile drawer contains keyboard focus and closes with Escape',async({page,isMobile})=>{
 test.skip(!isMobile,'mobile project only');
 await page.goto('/training/#home');
 await page.getByRole('button',{name:'Open navigation'}).click();
 const nav=page.getByRole('complementary',{name:'Application navigation'});
 await expect(nav).toHaveClass(/open/);
 const focused=await page.evaluate(()=>document.activeElement?.getAttribute('aria-label'));
 expect(focused).toBe('Close menu');
 await page.keyboard.press('Escape');
 await expect(nav).not.toHaveClass(/open/);
 await expect(page.getByRole('button',{name:'Open navigation'})).toBeFocused();
});

test('academy pages do not overflow a mobile viewport horizontally',async({page,isMobile})=>{
 test.skip(!isMobile,'mobile project only');
 for(const route of ['home','learn','progress']){
  await page.goto(`/training/#${route}`);
  await expect(page.locator('.ux-page').first()).toBeVisible();
  const size=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(size.page,route).toBeLessThanOrEqual(size.viewport+2);
 }
});
