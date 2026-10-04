import { test, expect } from '@playwright/test';

test.describe('FINAL UI VERIFICATION - CORRECTED', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Inspector - RBAC-TEST-001 lifecycle', async ({ page }) => {
    console.log('\n=== INSPECTOR UI TEST ===\n');

    // Login as Inspector
    await page.goto(BASE_URL + '/login');
    await page.click('text=Rajesh Kumar');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Navigate to Inspections
    await page.goto(BASE_URL + '/app/inspections');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const pageText = await page.locator('body').innerText();
    console.log('Page contains RBAC-TEST-001:', pageText.includes('RBAC-TEST-001'));
    console.log('Page contains ACCEPTED_FOR_ASSEMBLY:', pageText.includes('ACCEPTED_FOR_ASSEMBLY'));

    // Look for ACCEPT/REJECT buttons
    const acceptButtons = await page.locator('button:has-text("ACCEPT")').count();
    const rejectButtons = await page.locator('button:has-text("REJECT")').count();
    console.log('ACCEPT buttons:', acceptButtons);
    console.log('REJECT buttons:', rejectButtons);
  });

  test('Procurement - CERT-2026-24767 Blockchain Proof', async ({ page }) => {
    console.log('\n=== PROCUREMENT UI TEST ===\n');

    // Login as Procurement
    await page.goto(BASE_URL + '/login');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Navigate to Certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const certText = await page.locator('body').innerText();
    console.log('Page contains CERT-2026-24767:', certText.includes('CERT-2026-24767'));

    // Navigate to Blockchain Proof
    await page.goto(BASE_URL + '/app/blockchain-proof');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const blockchainText = await page.locator('body').innerText();
    console.log('Blockchain Proof URL:', page.url());
    console.log('Contains contract 0xDc64...', blockchainText.includes('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'));
    console.log('Contains TX 0xea569f48...', blockchainText.includes('0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967'));
    console.log('Contains block 17156:', blockchainText.includes('17156'));
    console.log('Contains token 3:', blockchainText.includes('3'));
  });

  test('Auditor - Complete journey', async ({ page }) => {
    console.log('\n=== AUDITOR UI TEST ===\n');

    // Login as Auditor
    await page.goto(BASE_URL + '/login');
    await page.click('text=Deepa Nair');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('Certifications URL:', page.url());

    // System Activity
    await page.goto(BASE_URL + '/app/system-activity');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('System Activity URL:', page.url());

    const activityText = await page.locator('body').innerText();
    console.log('Contains CERT-2026-24767:', activityText.includes('CERT-2026-24767'));

    // Verification
    await page.goto(BASE_URL + '/app/verification');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('Verification URL:', page.url());

    // Evidence
    await page.goto(BASE_URL + '/app/evidence-integrity');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('Evidence URL:', page.url());

    // Blockchain Proof
    await page.goto(BASE_URL + '/app/blockchain-proof');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('Blockchain Proof URL:', page.url());
  });

  test('QR payload inspection', async ({ page }) => {
    console.log('\n=== QR PAYLOAD TEST ===\n');

    // Login as Auditor
    await page.goto(BASE_URL + '/login');
    await page.click('text=Deepa Nair');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Navigate to Certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Look for QR elements
    const qrElements = await page.locator('svg, canvas, img[alt*="QR"], [class*="qr"], [id*="qr"]').count();
    console.log('QR elements found:', qrElements);

    if (qrElements > 0) {
      // Get all text from QR elements
      for (let i = 0; i < Math.min(qrElements, 3); i++) {
        const qrElement = page.locator('svg, canvas, img[alt*="QR"], [class*="qr"], [id*="qr"]').nth(i);
        const qrText = await qrElement.innerText();
        console.log(`QR element ${i} text (first 200 chars):`, qrText.substring(0, 200));

        // Check for sensitive data
        console.log(`  Contains JWT pattern:`, qrText.includes('eyJ'));
        console.log(`  Contains password:`, qrText.toLowerCase().includes('password'));
        console.log(`  Contains 64-char hex (private key):`, /[a-f0-9]{64}/.test(qrText));
      }
    }
  });
});
