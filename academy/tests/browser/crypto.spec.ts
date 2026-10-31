import {test,expect} from '@playwright/test';
test('cryptography foundations: real key and certificate workflow',async({page})=>{
 await page.goto('./#foundation');
 await page.getByRole('button',{name:/TLS, Keys & Secrets/i}).click();
 await expect(page.getByRole('heading',{name:/Don.t just read about TLS/i})).toBeVisible();
 const editor=page.getByRole('textbox',{name:/Type OpenSSL or training command from scratch/i});
 await expect(editor).toHaveValue('');
 await editor.fill('openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -keyout root.key -out root.crt -subj "/CN=CyberLab Root CA" -days 365 -nodes');
 await page.getByRole('button',{name:/Execute training command/i}).click();
 await expect(page.getByRole('status').filter({hasText:'Created a real self-signed X.509'})).toBeVisible();
 await page.getByRole('button',{name:/Generate a private key/i}).click();
 await editor.fill('openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out server.key');
 await page.getByRole('button',{name:/Execute training command/i}).click();
 await expect(page.getByRole('status').filter({hasText:'Generated real P-256'})).toBeVisible();
 await page.getByRole('button',{name:/Inspect generated artifacts/i}).click();
 await expect(page.getByText('root.crt',{exact:true})).toBeVisible();
});
test('Secrets module refuses excessive privileges',async({page})=>{
 await page.goto('./#foundation');await page.getByRole('button',{name:/TLS, Keys & Secrets/i}).click();
 await page.getByRole('button',{name:/Secrets Lifecycle/i}).click();
 const editor=page.getByRole('textbox',{name:/Type OpenSSL or training command from scratch/i});
 await editor.fill('secret create --name inventory --scope inventory:read');
 await page.getByRole('button',{name:/Execute training command/i}).click();
 await page.getByRole('button',{name:/Recognize denied authorization/i}).click();
 await editor.fill('secret use --name inventory --scope inventory:write');
 await page.getByRole('button',{name:/Execute training command/i}).click();
 await expect(page.getByRole('status').filter({hasText:'DENIED'})).toBeVisible();
});
