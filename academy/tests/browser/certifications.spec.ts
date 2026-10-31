import {test,expect} from '@playwright/test';

test('all three certification tracks contain 36 questions and a 30-question exam',async({page})=>{
 await page.goto('/training/#certification');
 await expect(page.getByRole('heading',{name:/Certification Academy/i})).toBeVisible();
 for(const [index,track] of ['NetSec Professional','NGFW Engineer','CloudSec Professional'].entries()){
  await page.locator('.cert-track').nth(index).click();
  const summary=page.locator('.cert-summary');
  await expect(summary).toContainText('36');
  await expect(summary).toContainText('Original questions');
  await page.getByRole('button',{name:'Start practice exam'}).click();
  await expect(page.locator('.cert-question-head')).toContainText('1 / 30');
  await expect(page.locator('.cert-mock-top')).toContainText(/4[45]:[0-5][0-9]/);
  await expect(page.locator('.cert-options button')).toHaveCount(4);
  await expect(page.locator('.cert-answer')).toHaveCount(0); // no answer disclosure during exam
  await page.locator('.cert-options button').nth(0).click();
  await expect(page.locator('.cert-mock-top')).toContainText('1/30 answered');
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Submit exam'}).click();
  await expect(page.getByText('Answers and technical explanations')).toBeVisible();
  await expect(page.locator('.cert-review')).toHaveCount(30);
 }
});

test('certification exam survives refresh with its answers and review flags',async({page})=>{
 await page.goto('/training/#certification');
 await page.getByRole('button',{name:'Start practice exam'}).click();
 await page.locator('.cert-options button').nth(1).click();
 await page.getByRole('button',{name:'Flag for review'}).click();
 await page.reload();
 await page.getByRole('button',{name:/Resume saved exam/}).click();
 await expect(page.locator('.cert-mock-top')).toContainText('1/30 answered');
 await expect(page.getByRole('button',{name:/Question 1, answered, flagged/})).toBeVisible();
 await expect(page.getByRole('button',{name:'Remove review flag'})).toBeVisible();
});
