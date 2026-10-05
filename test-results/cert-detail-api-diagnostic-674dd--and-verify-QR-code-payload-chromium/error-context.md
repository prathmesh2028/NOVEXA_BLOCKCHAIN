# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cert-detail-api-diagnostic.spec.ts >> Certification Detail API Diagnostic >> Programmatically extract and verify QR code payload
- Location: e2e\cert-detail-api-diagnostic.spec.ts:8:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('img[alt="Certificate QR Code"]') to be visible

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:8443';
  4  | 
  5  | test.describe('Certification Detail API Diagnostic', () => {
  6  |   test.use({ storageState: '.auth/procurement-storage.json' });
  7  | 
  8  |   test('Programmatically extract and verify QR code payload', async ({ page }) => {
  9  |     // Navigate to certification detail for a known cert from seed data
  10 |     const certId = 'CERT-2026-00089';
  11 |     await page.goto(`${BASE_URL}/app/certifications/${certId}`);
  12 |     await page.waitForLoadState('domcontentloaded');
  13 | 
  14 |     // Wait for QR code to be rendered
> 15 |     await page.waitForSelector('img[alt="Certificate QR Code"]', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  16 |     
  17 |     // Slight delay to ensure image is fully loaded before drawing to canvas
  18 |     await page.waitForTimeout(2000);
  19 | 
  20 |     // Inject jsQR from CDN to extract the payload
  21 |     await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js' });
  22 | 
  23 |     // Extract QR code payload using browser canvas and jsQR
  24 |     const qrPayload = await page.evaluate(async () => {
  25 |       const img = document.querySelector('img[alt="Certificate QR Code"]') as HTMLImageElement;
  26 |       if (!img) return null;
  27 |       
  28 |       const canvas = document.createElement('canvas');
  29 |       canvas.width = img.naturalWidth || img.width;
  30 |       canvas.height = img.naturalHeight || img.height;
  31 |       const ctx = canvas.getContext('2d');
  32 |       if (!ctx) return null;
  33 |       
  34 |       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  35 |       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  36 |       
  37 |       // @ts-ignore
  38 |       const code = jsQR(imageData.data, imageData.width, imageData.height);
  39 |       return code ? code.data : null;
  40 |     });
  41 | 
  42 |     console.log('EXTRACTED QR PAYLOAD:', qrPayload);
  43 |     
  44 |     // Verify payload is a URL and contains the expected path
  45 |     expect(qrPayload).toBeTruthy();
  46 |     expect(qrPayload).toContain(`/verify/cert/${certId}`);
  47 |     
  48 |     // Navigate to the extracted URL to test resolution and binding authenticity
  49 |     console.log(`Resolving QR payload: ${qrPayload}`);
  50 |     await page.goto(qrPayload as string);
  51 |     await page.waitForLoadState('domcontentloaded');
  52 |     
  53 |     // Wait for the cert detail page to render cert ID (proves QR → route → API → render is working)
  54 |     await page.waitForSelector(`text=${certId}`, { timeout: 15000 });
  55 |     
  56 |     // Also confirm key cert data is present on the page
  57 |     const hasCertId = await page.locator(`text=${certId}`).count() > 0;
  58 |     expect(hasCertId).toBeTruthy();
  59 |     console.log(`QR Payload resolution verified: ${qrPayload} → cert page shows ${certId}. Binding is authentic.`);
  60 |   });
  61 | });
  62 | 
```