# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: certification-cards.spec.ts >> CERTIFICATION CARDS CONTENT >> Check actual certification card content after loading demo data
- Location: e2e\certification-cards.spec.ts:6:3

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
  3  | test.describe('CERTIFICATION CARDS CONTENT', () => {
  4  |   const BASE_URL = 'http://localhost:8443';
  5  | 
  6  |   test('Check actual certification card content after loading demo data', async ({ page }) => {
  7  |     console.log('\n=== CERTIFICATION CARDS ===\n');
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
  26 |     // Get the full page content
  27 |     const bodyText = await page.locator('body').innerText();
  28 |     console.log('Full page text (first 2000 chars):');
  29 |     console.log(bodyText.substring(0, 2000));
  30 | 
  31 |     // Look for any certification-like patterns
  32 |     console.log('\nSearching for patterns:');
  33 |     console.log('Contains "CERT":', bodyText.includes('CERT'));
  34 |     console.log('Contains "2026":', bodyText.includes('2026'));
  35 |     console.log('Contains "24767":', bodyText.includes('24767'));
  36 |     console.log('Contains "CONFIRMED":', bodyText.includes('CONFIRMED'));
  37 |     console.log('Contains "PENDING":', bodyText.includes('PENDING'));
  38 | 
  39 |     // Look for the View Details button and what's near it
  40 |     const viewDetailsBtn = page.locator('button:has-text("View Details")');
  41 |     const viewDetailsCount = await viewDetailsBtn.count();
  42 |     console.log('\nView Details buttons:', viewDetailsCount);
  43 | 
  44 |     if (viewDetailsCount > 0) {
  45 |       // Get parent element to see context
  46 |       const parent = await viewDetailsBtn.first().evaluateHandle(el => el.parentElement);
  47 |       const parentText = await parent.evaluate(el => el.textContent);
  48 |       console.log('View Details button context:', parentText?.substring(0, 500));
  49 |     }
  50 |   });
  51 | });
  52 | 
```