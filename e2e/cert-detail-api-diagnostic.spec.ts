import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8444';

test.describe('Certification Detail API Diagnostic', () => {
  test.use({ storageState: '.auth/procurement-storage.json' });

  test('Trace API call and console logs', async ({ page }) => {
    // Set up console logging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to certification detail
    await page.goto(`${BASE_URL}/app/certifications/73771de4-8b74-4045-92e4-9b854b7bd48a`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for page to load
    await page.waitForTimeout(8000);

    // Print all console logs
    console.log('=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));

    // Take screenshot
    await page.screenshot({ path: 'cert-detail-api-diagnostic.png', fullPage: true });

    // Check page content
    const content = await page.content();
    console.log('=== PAGE CONTENT ANALYSIS ===');
    console.log('Has CERT-2026-24767:', content.includes('CERT-2026-24767'));
    console.log('Has Loading:', content.includes('Loading certification'));
    console.log('Has Error:', content.includes('ERROR LOADING CERTIFICATION'));
    console.log('Has Not Found:', content.includes('CERTIFICATION RECORD NOT FOUND'));
    console.log('Has 0xDc64:', content.includes('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'));
    console.log('Has Dc64:', content.includes('Dc64'));
    console.log('Has contract_address:', content.includes('contract_address'));
    console.log('Has Blockchain Information:', content.includes('Blockchain Information'));
    console.log('Has Token ID:', content.includes('Token ID'));
    console.log('Has Transaction Hash:', content.includes('Transaction Hash'));
    console.log('Has Block Number:', content.includes('Block Number'));

    // Take screenshot
    await page.screenshot({ path: 'cert-detail-blockchain-section.png', fullPage: true });
  });
});
