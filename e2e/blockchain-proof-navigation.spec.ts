import { test, expect } from '@playwright/test';

test.describe('BLOCKCHAIN PROOF NAVIGATION', () => {
  const BASE_URL = 'http://localhost:8443';
  const API_URL = 'http://localhost:8000/api/v1';

  test('Navigate to Blockchain Proof with certification context', async ({ page, request }) => {
    console.log('\n=== BLOCKCHAIN PROOF WITH CONTEXT ===\n');

    // First get certification details via API
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    const certsRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const certsData = await certsRes.json();

    const cert24767 = certsData.items?.find((c: any) => c.cert_id === 'CERT-2026-24767');
    console.log('CERT-2026-24767 API data:');
    console.log('  UUID:', cert24767?.id);
    console.log('  cert_id:', cert24767?.cert_id);
    console.log('  asset_id:', cert24767?.asset_id);
    console.log('  token_id:', cert24767?.token_id);
    console.log('  tx_hash:', cert24767?.tx_hash);
    console.log('  block_number:', cert24767?.block_number);
    console.log('  contract_address:', cert24767?.contract_address);

    // Now navigate in UI as Procurement
    await page.goto(BASE_URL + '/login');
    await page.click('text=Priya Sharma');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Go to certifications
    await page.goto(BASE_URL + '/app/certifications');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const certText = await page.locator('body').innerText();
    console.log('Certifications page text (first 500 chars):', certText.substring(0, 500));

    // Try to click on CERT-2026-24767
    if (certText.includes('CERT-2026-24767')) {
      console.log('Clicking on CERT-2026-24767...');
      await page.click('text=CERT-2026-24767');
      await page.waitForTimeout(2000);
      console.log('After click, URL:', page.url());

      // Check if we're on a detail page
      const detailText = await page.locator('body').innerText();
      console.log('Detail page text (first 500 chars):', detailText.substring(0, 500));
    }
  });
});
