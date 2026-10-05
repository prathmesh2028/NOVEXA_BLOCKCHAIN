# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: all-role-journeys.spec.ts >> ALL ROLE JOURNEYS >> PROCUREMENT >> Procurement certification journey
- Location: e2e\all-role-journeys.spec.ts:9:5

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
  5  | test.describe('ALL ROLE JOURNEYS', () => {
  6  |   test.describe('PROCUREMENT', () => {
  7  |     test.use({ storageState: '.auth/procurement-storage.json' });
  8  | 
  9  |     test('Procurement certification journey', async ({ page }) => {
  10 |       await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
  11 |       await page.waitForLoadState('domcontentloaded');
  12 |       await page.waitForTimeout(5000);
  13 | 
  14 |       expect(page.url()).toContain('/app/certifications/');
> 15 |       const certId = await page.textContent('text=CERT-2026-24767');
     |                                 ^ Error: page.textContent: Test timeout of 30000ms exceeded.
  16 |       expect(certId).toContain('CERT-2026-24767');
  17 | 
  18 |       const pageContent = await page.content();
  19 |       expect(pageContent).toContain('Blockchain Information');
  20 |       expect(pageContent).toContain('Token ID');
  21 |       expect(pageContent).toContain('3');
  22 |     });
  23 |   });
  24 | 
  25 |   test.describe('AUDITOR', () => {
  26 |     test.use({ storageState: '.auth/auditor-storage.json' });
  27 | 
  28 |     test('Auditor certification journey', async ({ page }) => {
  29 |       await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
  30 |       await page.waitForLoadState('domcontentloaded');
  31 |       await page.waitForTimeout(5000);
  32 | 
  33 |       expect(page.url()).toContain('/app/certifications/');
  34 |       const certId = await page.textContent('text=CERT-2026-24767');
  35 |       expect(certId).toContain('CERT-2026-24767');
  36 | 
  37 |       const pageContent = await page.content();
  38 |       expect(pageContent).toContain('Blockchain Information');
  39 |       expect(pageContent).toContain('Token ID');
  40 |       expect(pageContent).toContain('3');
  41 |     });
  42 |   });
  43 | 
  44 |   test.describe('INSPECTOR', () => {
  45 |     test.use({ storageState: '.auth/inspector-storage.json' });
  46 | 
  47 |     test('Inspector certification journey', async ({ page }) => {
  48 |       await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
  49 |       await page.waitForLoadState('domcontentloaded');
  50 |       await page.waitForTimeout(5000);
  51 | 
  52 |       expect(page.url()).toContain('/app/certifications/');
  53 |       const certId = await page.textContent('text=CERT-2026-24767');
  54 |       expect(certId).toContain('CERT-2026-24767');
  55 | 
  56 |       const pageContent = await page.content();
  57 |       expect(pageContent).toContain('Blockchain Information');
  58 |       expect(pageContent).toContain('Token ID');
  59 |       expect(pageContent).toContain('3');
  60 |     });
  61 |   });
  62 | 
  63 |   test.describe('SYSTEM ADMIN', () => {
  64 |     test.use({ storageState: '.auth/admin-storage.json' });
  65 | 
  66 |     test('Admin certification journey', async ({ page }) => {
  67 |       await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
  68 |       await page.waitForLoadState('domcontentloaded');
  69 |       await page.waitForTimeout(5000);
  70 | 
  71 |       expect(page.url()).toContain('/app/certifications/');
  72 |       const certId = await page.textContent('text=CERT-2026-24767');
  73 |       expect(certId).toContain('CERT-2026-24767');
  74 | 
  75 |       const pageContent = await page.content();
  76 |       expect(pageContent).toContain('Blockchain Information');
  77 |       expect(pageContent).toContain('Token ID');
  78 |       expect(pageContent).toContain('3');
  79 |     });
  80 |   });
  81 | });
  82 | 
```