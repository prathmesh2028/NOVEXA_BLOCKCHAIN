# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cert-page-diagnostic.spec.ts >> Certifications Page Diagnostic >> Check certifications page rendering
- Location: e2e\cert-page-diagnostic.spec.ts:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Certifications')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:8443';
  4  | 
  5  | test.describe('Certifications Page Diagnostic', () => {
  6  |   test.use({ storageState: '.auth/procurement-storage.json' });
  7  | 
  8  |   test('Check certifications page rendering', async ({ page }) => {
  9  |     await page.goto(`${BASE_URL}/app/dashboard`);
  10 |     await page.waitForLoadState('domcontentloaded');
  11 | 
  12 |     // Navigate to Certifications
> 13 |     await page.click('text=Certifications');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  14 |     await page.waitForLoadState('domcontentloaded');
  15 | 
  16 |     // Wait a bit for data to load
  17 |     await page.waitForTimeout(5000);
  18 | 
  19 |     // Capture page content
  20 |     const content = await page.content();
  21 |     console.log('Page URL:', page.url());
  22 |     console.log('Page title:', await page.title());
  23 | 
  24 |     // Check for various elements
  25 |     const hasLoading = content.includes('LOADING') || content.includes('Loading');
  26 |     const hasNoData = content.includes('NO CERTIFICATION RECORDS FOUND');
  27 |     const hasCards = content.includes('cert-card');
  28 |     const hasTable = content.includes('cert-table');
  29 |     const hasCertId = content.includes('CERT-2026-24767');
  30 |     const hasDemoButton = content.includes('LOAD DEMO DATA');
  31 | 
  32 |     console.log('Has loading indicator:', hasLoading);
  33 |     console.log('Has no data message:', hasNoData);
  34 |     console.log('Has cards:', hasCards);
  35 |     console.log('Has table:', hasTable);
  36 |     console.log('Has CERT-2026-24767:', hasCertId);
  37 |     console.log('Has Demo Data button:', hasDemoButton);
  38 | 
  39 |     // If demo data button exists, click it
  40 |     if (hasDemoButton) {
  41 |       console.log('Clicking Demo Data button...');
  42 |       await page.click('text=LOAD DEMO DATA');
  43 |       await page.waitForTimeout(3000);
  44 | 
  45 |       const contentAfterDemo = await page.content();
  46 |       const hasCertIdAfterDemo = contentAfterDemo.includes('CERT-2026-24767');
  47 |       console.log('Has CERT-2026-24767 after loading demo:', hasCertIdAfterDemo);
  48 | 
  49 |       await page.screenshot({ path: 'cert-page-after-demo.png', fullPage: true });
  50 |     }
  51 | 
  52 |     // Take screenshot
  53 |     await page.screenshot({ path: 'cert-page-diagnostic.png', fullPage: true });
  54 | 
  55 |     // Check console errors
  56 |     const consoleErrors: string[] = [];
  57 |     page.on('console', msg => {
  58 |       if (msg.type() === 'error') {
  59 |         consoleErrors.push(msg.text());
  60 |       }
  61 |     });
  62 | 
  63 |     // Wait a bit more to capture any errors
  64 |     await page.waitForTimeout(2000);
  65 | 
  66 |     console.log('Console errors:', consoleErrors);
  67 |   });
  68 | });
  69 | 
```