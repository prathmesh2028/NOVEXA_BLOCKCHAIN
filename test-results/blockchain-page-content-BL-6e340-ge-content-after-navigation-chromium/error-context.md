# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blockchain-page-content.spec.ts >> BLOCKCHAIN PAGE FULL CONTENT >> Get full blockchain page content after navigation
- Location: e2e\blockchain-page-content.spec.ts:6:3

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
  3  | test.describe('BLOCKCHAIN PAGE FULL CONTENT', () => {
  4  |   const BASE_URL = 'http://localhost:8443';
  5  | 
  6  |   test('Get full blockchain page content after navigation', async ({ page }) => {
  7  |     console.log('\n=== BLOCKCHAIN PAGE CONTENT ===\n');
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
  17 |     // Navigate directly to certification detail
  18 |     await page.goto(BASE_URL + '/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a');
  19 |     await page.waitForTimeout(2000);
  20 | 
  21 |     // Click Blockchain
  22 |     await page.click('text=Blockchain');
  23 |     await page.waitForTimeout(2000);
  24 | 
  25 |     console.log('Blockchain page URL:', page.url());
  26 | 
  27 |     const fullText = await page.locator('body').innerText();
  28 |     console.log('Full blockchain page text (first 3000 chars):');
  29 |     console.log(fullText.substring(0, 3000));
  30 | 
  31 |     console.log('\nSearching for blockchain values:');
  32 |     console.log('Contains 0xDc64:', fullText.includes('0xDc64'));
  33 |     console.log('Contains 0xea569f48:', fullText.includes('0xea569f48'));
  34 |     console.log('Contains 17156:', fullText.includes('17156'));
  35 |     console.log('Contains Token 3:', fullText.includes('Token 3'));
  36 |     console.log('Contains token 3:', fullText.includes('token 3'));
  37 |   });
  38 | });
  39 | 
```