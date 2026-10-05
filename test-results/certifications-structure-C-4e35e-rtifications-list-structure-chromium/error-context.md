# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: certifications-structure.spec.ts >> CERTIFICATIONS PAGE STRUCTURE >> Inspect actual certifications list structure
- Location: e2e\certifications-structure.spec.ts:6:3

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
  3  | test.describe('CERTIFICATIONS PAGE STRUCTURE', () => {
  4  |   const BASE_URL = 'http://localhost:8443';
  5  | 
  6  |   test('Inspect actual certifications list structure', async ({ page }) => {
  7  |     console.log('\n=== CERTIFICATIONS STRUCTURE ===\n');
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
  20 |     await page.waitForTimeout(3000);
  21 | 
  22 |     // Get all buttons
  23 |     const buttons = await page.locator('button').all();
  24 |     console.log('Total buttons:', buttons.length);
  25 | 
  26 |     for (let i = 0; i < Math.min(buttons.length, 10); i++) {
  27 |       const btn = buttons[i];
  28 |       const text = await btn.innerText();
  29 |       console.log(`Button ${i}: "${text.trim()}"`);
  30 |     }
  31 | 
  32 |     // Get all links
  33 |     const links = await page.locator('a').all();
  34 |     console.log('\nTotal links:', links.length);
  35 | 
  36 |     for (let i = 0; i < Math.min(links.length, 10); i++) {
  37 |       const link = links[i];
  38 |       const text = await link.innerText();
  39 |       const href = await link.getAttribute('href');
  40 |       console.log(`Link ${i}: "${text.trim()}" -> ${href}`);
  41 |     }
  42 | 
  43 |     // Look for table rows
  44 |     const tableRows = await page.locator('tr').all();
  45 |     console.log('\nTotal table rows:', tableRows.length);
  46 | 
  47 |     // Look for cards/divs
  48 |     const cards = await page.locator('div').all();
  49 |     console.log('Total divs:', cards.length);
  50 | 
  51 |     // Check for "View Details" text
  52 |     const bodyText = await page.locator('body').innerText();
  53 |     console.log('\nPage contains "View Details":', bodyText.includes('View Details'));
  54 |     console.log('Page contains "CERT-2026-24767":', bodyText.includes('CERT-2026-24767'));
  55 |     console.log('Page contains "1":', bodyText.includes('1'));
  56 |   });
  57 | });
  58 | 
```