import {expect,test} from '@playwright/test';
test('coding foundations has blank editor and C# reference check',async({page})=>{
 await page.goto('./#foundation');
 await page.getByRole('button',{name:/Code: Python, C#, APIs/i}).click();
 await expect(page.getByRole('heading',{name:'Learn the syntax by writing it.'})).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Type code for the selected exercise'})).toHaveValue('');
 await page.getByRole('button',{name:/C# fundamentals/i}).click();
 await page.getByRole('textbox',{name:'Type code for the selected exercise'}).fill('Console.WriteLine("Hello, CyberLab!");');
 await page.getByRole('button',{name:/Check reference syntax/i}).click();
 await expect(page.getByRole('status').filter({hasText:'Reference syntax matched'})).toBeVisible();
});
test('HTTP editor validates typed request and produces stateful response',async({page})=>{
 await page.goto('./#foundation');
 await page.getByRole('button',{name:/Code: Python, C#, APIs/i}).click();
 await page.getByRole('button',{name:/HTTP & APIs/i}).click();
 await page.getByRole('textbox',{name:'Type code for the selected exercise'}).fill('GET /api/assets HTTP/1.1\nAccept: application/json');
 await page.getByRole('button',{name:/Send simulated request/i}).click();
 await expect(page.getByRole('status').filter({hasText:'200 OK'})).toBeVisible();
});
