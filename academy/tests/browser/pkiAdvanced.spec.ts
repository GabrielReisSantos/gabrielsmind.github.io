import {test,expect} from '@playwright/test';
test('PKI engineering: root and intermediate issue browser-generated artifacts',async({page})=>{
 await page.goto('./#foundation');
 await page.getByRole('button',{name:/PKI & TLS Engineering/i}).click();
 await expect(page.getByRole('heading',{name:/Issue. Break. Diagnose. Repair/i})).toBeVisible();
 const input=page.getByRole('textbox',{name:'Type the training command'});
 const run=page.getByRole('button',{name:'Run command'});
 await input.fill('openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout root.key -out root.crt -subj "/CN=CyberLab Root CA" -days 365');
 await run.click();
 await expect(page.getByRole('status')).toContainText('root');
 await expect(page.getByRole('button',{name:/root.crt/i})).toBeVisible();
 await page.getByRole('button',{name:/Intermediate key pair/i}).click();
 await input.fill('openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out intermediate.key');
 await run.click();
 await expect(page.getByRole('status')).toContainText('int-key');
});
test('Secrets lab denies requests without a consumer token',async({page})=>{
 await page.goto('./#foundation');await page.getByRole('button',{name:/PKI & TLS Engineering/i}).click();
 await page.getByRole('button',{name:/Secrets \+ API/i}).click();
 await page.getByRole('button',{name:/Call inventory API/i}).click();
 await page.getByRole('textbox',{name:'Type the training command'}).fill('api GET /assets');
 await page.getByRole('button',{name:'Run command'}).click();
 await expect(page.getByRole('status')).toContainText('401 Unauthorized');
});
