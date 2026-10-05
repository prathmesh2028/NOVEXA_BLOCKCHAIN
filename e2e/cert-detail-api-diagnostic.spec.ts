import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8443';

test.describe('Certification Detail API Diagnostic', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Programmatically extract and verify QR code payload', async ({ page }) => {
    // Navigate to certification detail for a known cert from seed data
    const certId = 'CERT-2026-00089';
    await page.goto(`${BASE_URL}/app/certifications/${certId}`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for QR code to be rendered
    await page.waitForSelector('img[alt="Certificate QR Code"]', { timeout: 10000 });
    
    // Slight delay to ensure image is fully loaded before drawing to canvas
    await page.waitForTimeout(2000);

    // Inject jsQR from CDN to extract the payload
    await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js' });

    // Extract QR code payload using browser canvas and jsQR
    const qrPayload = await page.evaluate(async () => {
      const img = document.querySelector('img[alt="Certificate QR Code"]') as HTMLImageElement;
      if (!img) return null;
      
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // @ts-ignore
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      return code ? code.data : null;
    });

    console.log('EXTRACTED QR PAYLOAD:', qrPayload);
    
    // Verify payload is a URL and contains the expected path
    expect(qrPayload).toBeTruthy();
    expect(qrPayload).toContain(`/verify/cert/${certId}`);
    
    // Navigate to the extracted URL to test resolution and binding authenticity
    console.log(`Resolving QR payload: ${qrPayload}`);
    await page.goto(qrPayload as string);
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the cert detail page to render cert ID (proves QR → route → API → render is working)
    await page.waitForSelector(`text=${certId}`, { timeout: 15000 });
    
    // Also confirm key cert data is present on the page
    const hasCertId = await page.locator(`text=${certId}`).count() > 0;
    expect(hasCertId).toBeTruthy();
    console.log(`QR Payload resolution verified: ${qrPayload} → cert page shows ${certId}. Binding is authentic.`);
  });
});
