# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blockchain-proof-navigation.spec.ts >> BLOCKCHAIN PROOF NAVIGATION >> Navigate to Blockchain Proof with certification context
- Location: e2e\blockchain-proof-navigation.spec.ts:7:3

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
  3  | test.describe('BLOCKCHAIN PROOF NAVIGATION', () => {
  4  |   const BASE_URL = 'http://localhost:8443';
  5  |   const API_URL = 'http://localhost:8000/api/v1';
  6  | 
  7  |   test('Navigate to Blockchain Proof with certification context', async ({ page, request }) => {
  8  |     console.log('\n=== BLOCKCHAIN PROOF WITH CONTEXT ===\n');
  9  | 
  10 |     // First get certification details via API
  11 |     const loginRes = await request.post(`${API_URL}/auth/login`, {
  12 |       data: { email: 'a.mehta@bel-defence.in', password: 'password' }
  13 |     });
  14 |     const token = (await loginRes.json()).access_token;
  15 | 
  16 |     const certsRes = await request.get(`${API_URL}/certifications`, {
  17 |       headers: { Authorization: `Bearer ${token}` }
  18 |     });
  19 |     const certsData = await certsRes.json();
  20 | 
  21 |     const cert24767 = certsData.items?.find((c: any) => c.cert_id === 'CERT-2026-24767');
  22 |     console.log('CERT-2026-24767 API data:');
  23 |     console.log('  UUID:', cert24767?.id);
  24 |     console.log('  cert_id:', cert24767?.cert_id);
  25 |     console.log('  asset_id:', cert24767?.asset_id);
  26 |     console.log('  token_id:', cert24767?.token_id);
  27 |     console.log('  tx_hash:', cert24767?.tx_hash);
  28 |     console.log('  block_number:', cert24767?.block_number);
  29 |     console.log('  contract_address:', cert24767?.contract_address);
  30 | 
  31 |     // Now navigate in UI as Procurement
  32 |     await page.goto(BASE_URL + '/login');
> 33 |     await page.click('text=Priya Sharma');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  34 |     await page.waitForTimeout(500);
  35 |     await page.click('button[type="submit"]');
  36 |     await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
  37 |     await page.waitForTimeout(2000);
  38 | 
  39 |     // Go to certifications
  40 |     await page.goto(BASE_URL + '/app/certifications');
  41 |     await page.waitForLoadState('domcontentloaded');
  42 |     await page.waitForTimeout(2000);
  43 | 
  44 |     const certText = await page.locator('body').innerText();
  45 |     console.log('Certifications page text (first 500 chars):', certText.substring(0, 500));
  46 | 
  47 |     // Try to click on CERT-2026-24767
  48 |     if (certText.includes('CERT-2026-24767')) {
  49 |       console.log('Clicking on CERT-2026-24767...');
  50 |       await page.click('text=CERT-2026-24767');
  51 |       await page.waitForTimeout(2000);
  52 |       console.log('After click, URL:', page.url());
  53 | 
  54 |       // Check if we're on a detail page
  55 |       const detailText = await page.locator('body').innerText();
  56 |       console.log('Detail page text (first 500 chars):', detailText.substring(0, 500));
  57 |     }
  58 |   });
  59 | });
  60 | 
```