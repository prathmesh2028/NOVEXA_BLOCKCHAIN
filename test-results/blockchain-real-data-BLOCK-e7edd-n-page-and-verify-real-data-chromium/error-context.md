# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blockchain-real-data.spec.ts >> BLOCKCHAIN PAGE REAL DATA VERIFICATION >> Login then navigate to blockchain page and verify real data
- Location: e2e\blockchain-real-data.spec.ts:6:3

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
  3  | test.describe('BLOCKCHAIN PAGE REAL DATA VERIFICATION', () => {
  4  |   const BASE_URL = 'http://localhost:8443';
  5  | 
  6  |   test('Login then navigate to blockchain page and verify real data', async ({ page }) => {
  7  |     console.log('\n=== BLOCKCHAIN PAGE REAL DATA ===\n');
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
  17 |     // Navigate to blockchain page
  18 |     await page.goto(BASE_URL + '/app/blockchain');
  19 |     await page.waitForLoadState('domcontentloaded');
  20 |     await page.waitForTimeout(3000);
  21 | 
  22 |     const fullText = await page.locator('body').innerText();
  23 |     console.log('Blockchain page text (first 2000 chars):');
  24 |     console.log(fullText.substring(0, 2000));
  25 | 
  26 |     console.log('\nChecking for synthetic data:');
  27 |     console.log('Contains 0x742d35Cc:', fullText.includes('0x742d35Cc'));
  28 |     console.log('Contains SYNTHETIC DEMO NETWORK:', fullText.includes('SYNTHETIC DEMO NETWORK'));
  29 |     console.log('Contains SYNTHETIC DEMO NETWORK (case insensitive):', fullText.toLowerCase().includes('synthetic demo network'));
  30 | 
  31 |     console.log('\nChecking for real data:');
  32 |     console.log('Contains 0xDc64:', fullText.includes('0xDc64'));
  33 |     console.log('Contains 0xea569f48:', fullText.includes('0xea569f48'));
  34 |     console.log('Contains 17156:', fullText.includes('17156'));
  35 |     console.log('Contains Token 3:', fullText.includes('Token 3'));
  36 |     console.log('Contains token 3:', fullText.includes('token 3'));
  37 |   });
  38 | });
  39 | 
```