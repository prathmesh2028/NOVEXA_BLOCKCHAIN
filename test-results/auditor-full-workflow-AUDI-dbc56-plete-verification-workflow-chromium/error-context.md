# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auditor-full-workflow.spec.ts >> AUDITOR - FULL WORKFLOW >> Auditor complete verification workflow
- Location: e2e\auditor-full-workflow.spec.ts:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=CERT-2026-24767')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:8443';
  4  | 
  5  | test.describe('AUDITOR - FULL WORKFLOW', () => {
  6  |   test.use({ storageState: '.auth/auditor-storage.json' });
  7  | 
  8  |   test('Auditor complete verification workflow', async ({ page }) => {
  9  |     // Navigate directly to certification detail
  10 |     await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
  11 |     await page.waitForLoadState('domcontentloaded');
  12 |     await page.waitForTimeout(3000);
  13 | 
  14 |     // Verify certification detail loaded
  15 |     expect(page.url()).toContain('/app/certifications');
> 16 |     const certId = await page.textContent('text=CERT-2026-24767');
     |                               ^ Error: page.textContent: Test timeout of 30000ms exceeded.
  17 |     expect(certId).toContain('CERT-2026-24767');
  18 | 
  19 |     // Check for Evidence section
  20 |     const pageContent = await page.content();
  21 |     console.log('Has Evidence:', pageContent.includes('Evidence'));
  22 |     console.log('Has Blockchain Information:', pageContent.includes('Blockchain Information'));
  23 | 
  24 |     // Verify blockchain data
  25 |     expect(pageContent).toContain('Blockchain Information');
  26 |     expect(pageContent).toContain('Token ID');
  27 |     expect(pageContent).toContain('Transaction Hash');
  28 |     expect(pageContent).toContain('Block Number');
  29 | 
  30 |     // Check for Verification Center
  31 |     console.log('Has Verification:', pageContent.includes('Verification'));
  32 | 
  33 |     // Check for QR/Data Matrix
  34 |     console.log('Has QR:', pageContent.includes('QR') || pageContent.includes('Data Matrix'));
  35 |     expect(pageContent).toContain('QR');
  36 | 
  37 |     // Navigate to System Activity
  38 |     await page.goto(`${BASE_URL}/app/system-activity`);
  39 |     await page.waitForLoadState('domcontentloaded');
  40 |     await page.waitForTimeout(3000);
  41 | 
  42 |     // Verify System Activity loaded
  43 |     const activityContent = await page.content();
  44 |     console.log('Has System Activity:', activityContent.includes('System Activity'));
  45 |     console.log('Has View Details:', activityContent.includes('View Details'));
  46 | 
  47 |     // Try to click View Details if available
  48 |     const viewDetailsButton = page.locator('text=View Details').first();
  49 |     if (await viewDetailsButton.count() > 0) {
  50 |       await viewDetailsButton.click();
  51 |       await page.waitForLoadState('domcontentloaded');
  52 |       await page.waitForTimeout(3000);
  53 |       console.log('View Details clicked successfully');
  54 |     }
  55 |   });
  56 | });
  57 | 
```