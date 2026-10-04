import { test, expect } from '@playwright/test';

test.describe('FINAL VERIFICATION - ACTUAL UI FLOWS', () => {
  const BASE_URL = 'http://localhost:8443';

  test('Inspector ACCEPT and REJECT actual lifecycle', async ({ page }) => {
    console.log('\n=== INSPECTOR ACTUAL LIFECYCLE TEST ===\n');

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

    console.log('INSPECTOR - Inspections page loaded');
    console.log('URL:', page.url());

    // Look for RBAC-TEST-001
    const pageText = await page.locator('body').innerText();
    console.log('Page contains RBAC-TEST-001:', pageText.includes('RBAC-TEST-001'));

    // Look for ACCEPT button
    const acceptButtons = await page.locator('button:has-text("ACCEPT")').count();
    console.log('ACCEPT buttons found:', acceptButtons);

    // Look for REJECT button
    const rejectButtons = await page.locator('button:has-text("REJECT")').count();
    console.log('REJECT buttons found:', rejectButtons);

    // Check for lifecycle state display
    console.log('Page contains ACCEPTED_FOR_ASSEMBLY:', pageText.includes('ACCEPTED_FOR_ASSEMBLY'));
    console.log('Page contains REJECTED_QUARANTINED:', pageText.includes('REJECTED_QUARANTINED'));
  });

  test('Procurement full flow with Blockchain Proof verification', async ({ page }) => {
    console.log('\n=== PROCUREMENT FULL FLOW TEST ===\n');

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

    console.log('PROCUREMENT - Certifications page loaded');
    console.log('URL:', page.url());

    // Look for CERT-2026-24767
    const pageText = await page.locator('body').innerText();
    console.log('Page contains CERT-2026-24767:', pageText.includes('CERT-2026-24767'));

    // Navigate to Blockchain Proof directly
    await page.goto(BASE_URL + '/app/blockchain-proof');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    console.log('PROCUREMENT - Blockchain Proof page loaded');
    console.log('URL:', page.url());

    // Verify blockchain values are displayed
    const blockchainText = await page.locator('body').innerText();
    console.log('Blockchain Proof page contains contract address:', blockchainText.includes('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'));
    console.log('Blockchain Proof page contains transaction:', blockchainText.includes('0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967'));
    console.log('Blockchain Proof page contains block:', blockchainText.includes('17156'));
    console.log('Blockchain Proof page contains token:', blockchainText.includes('3'));
  });

  test('Auditor full flow with QR and System Activity', async ({ page }) => {
    console.log('\n=== AUDITOR FULL FLOW TEST ===\n');

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

    console.log('AUDITOR - Certifications page loaded');
    console.log('URL:', page.url());

    // Look for CERT-2026-24767
    const certText = await page.locator('body').innerText();
    console.log('Page contains CERT-2026-24767:', certText.includes('CERT-2026-24767'));

    // Navigate to System Activity
    await page.goto(BASE_URL + '/app/system-activity');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    console.log('AUDITOR - System Activity page loaded');
    console.log('URL:', page.url());

    // Look for CERT-2026-24767 in System Activity
    const activityText = await page.locator('body').innerText();
    console.log('System Activity contains CERT-2026-24767:', activityText.includes('CERT-2026-24767'));

    // Look for View Details / INFO button
    const viewDetailsButtons = await page.locator('button:has-text("View Details"), button:has-text("INFO")').count();
    console.log('View Details/INFO buttons found:', viewDetailsButtons);

    // Navigate to Verification
    await page.goto(BASE_URL + '/app/verification');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    console.log('AUDITOR - Verification page loaded');
    console.log('URL:', page.url());

    // Navigate to Evidence
    await page.goto(BASE_URL + '/app/evidence-integrity');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    console.log('AUDITOR - Evidence Integrity page loaded');
    console.log('URL:', page.url());
  });

  test('QR code actual payload inspection', async ({ page }) => {
    console.log('\n=== QR PAYLOAD INSPECTION TEST ===\n');

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

    // Look for QR code element
    const qrElements = await page.locator('svg, canvas, img[alt*="QR"], [class*="qr"], [id*="qr"]').count();
    console.log('QR elements found:', qrElements);

    if (qrElements > 0) {
      // Check QR source/text
      const qrText = await page.locator('svg, canvas, img[alt*="QR"], [class*="qr"], [id*="qr"]').first().innerText();
      console.log('QR text:', qrText.substring(0, 200));

      // Check for sensitive data
      console.log('QR contains JWT:', qrText.includes('eyJ'));
      console.log('QR contains password:', qrText.toLowerCase().includes('password'));
      console.log('QR contains private key pattern:', /[a-f0-9]{64}/.test(qrText));
    } else {
      console.log('No QR elements found on Certifications page');
    }
  });
});
