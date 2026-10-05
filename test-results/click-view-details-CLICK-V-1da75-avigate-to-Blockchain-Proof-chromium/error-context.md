# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: click-view-details.spec.ts >> CLICK VIEW DETAILS AND NAVIGATE >> Click View Details on CERT-2026-24767, then navigate to Blockchain Proof
- Location: e2e\click-view-details.spec.ts:6:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Priya Sharma')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('CLICK VIEW DETAILS AND NAVIGATE', () => {
  4  |   const BASE_URL = 'http://localhost:8443';
  5  | 
  6  |   test('Click View Details on CERT-2026-24767, then navigate to Blockchain Proof', async ({ page }) => {
  7  |     console.log('\n=== VIEW DETAILS NAVIGATION ===\n');
  8  | 
  9  |     // Login as Procurement
  10 |     await page.goto(BASE_URL + '/login');
> 11 |     await page.click('text=Priya Sharma');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  12 |     await page.waitForTimeout(500);
  13 |     await page.click('button[type="submit"]');
  14 |     await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
  15 |     await page.waitForTimeout(2000);
  16 | 
  17 |     // Go to certifications
  18 |     await page.goto(BASE_URL + '/app/certifications');
  19 |     await page.waitForLoadState('domcontentloaded');
  20 |     await page.waitForTimeout(2000);
  21 | 
  22 |     // Load demo data
  23 |     await page.click('text=LOAD DEMO DATA');
  24 |     await page.waitForTimeout(3000);
  25 | 
  26 |     // Click on View Details for CERT-2026-24767
  27 |     console.log('Clicking View Details for CERT-2026-24767...');
  28 |     // Navigate directly to certification detail page using UUID
  29 |     await page.goto(BASE_URL + '/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a');
  30 |     await page.waitForTimeout(2000);
  31 | 
  32 |     console.log('After View Details, URL:', page.url());
  33 | 
  34 |     const detailText = await page.locator('body').innerText();
  35 |     console.log('Detail page contains CERT-2026-24767:', detailText.includes('CERT-2026-24767'));
  36 |     console.log('Detail page contains Blockchain Proof:', detailText.includes('Blockchain Proof'));
  37 | 
  38 |     // Look for Blockchain Proof button/link
  39 |     const blockchainButtons = await page.locator('button:has-text("Blockchain"), a:has-text("Blockchain")').all();
  40 |     console.log('Blockchain buttons/links:', blockchainButtons.length);
  41 | 
  42 |     if (blockchainButtons.length > 0) {
  43 |       console.log('Clicking Blockchain Proof button/link...');
  44 |       await blockchainButtons[0].click();
  45 |       await page.waitForTimeout(2000);
  46 |       console.log('After Blockchain Proof, URL:', page.url());
  47 | 
  48 |       const blockchainText = await page.locator('body').innerText();
  49 |       console.log('Blockchain Proof page contains 0xDc64...', blockchainText.includes('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'));
  50 |       console.log('Blockchain Proof page contains 0xea569f48...', blockchainText.includes('0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967'));
  51 |       console.log('Blockchain Proof page contains 17156:', blockchainText.includes('17156'));
  52 |       console.log('Blockchain Proof page contains token 3:', blockchainText.includes('3'));
  53 |     }
  54 |   });
  55 | });
  56 | 
```