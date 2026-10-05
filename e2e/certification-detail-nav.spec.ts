import { test, expect } from '@playwright/test';

test.describe('CERTIFICATION DETAIL NAVIGATION', () => {
  const BASE_URL = 'http://localhost:8443';
  const API_URL = 'http://localhost:8000/api/v1';

  test('Verify certification detail navigation with real cert_id', async ({ page, request }) => {
    console.log('\n=== CERTIFICATION DETAIL NAVIGATION ===\n');

    // Login as Procurement
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'p.sharma@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get certifications
    const certsRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const certsData = await certsRes.json();

    console.log(`Total certifications: ${certsData.total}`);

    // Find CERT-2026-24767
    const targetCert = certsData.items?.find((c: any) => c.cert_id === 'CERT-2026-24767');
    if (targetCert) {
      console.log(`Found CERT-2026-24767:`);
      console.log(`  ID (UUID): ${targetCert.id}`);
      console.log(`  cert_id: ${targetCert.cert_id}`);
      console.log(`  status: ${targetCert.status}`);

      // Try to fetch detail by UUID
      const detailByUuid = await request.get(`${API_URL}/certifications/${targetCert.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`\nDetail by UUID (${targetCert.id}): ${detailByUuid.status()}`);

      // Try to fetch detail by cert_id
      const detailByCertId = await request.get(`${API_URL}/certifications/${targetCert.cert_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Detail by cert_id (${targetCert.cert_id}): ${detailByCertId.status()}`);

      if (detailByCertId.ok()) {
        const detailData = await detailByCertId.json();
        console.log(`\nDetail data:`);
        console.log(`  cert_id: ${detailData.cert_id}`);
        console.log(`  asset_id: ${detailData.asset_id}`);
        console.log(`  token_id: ${detailData.token_id}`);
        console.log(`  tx_hash: ${detailData.tx_hash}`);
      }
    } else {
      console.log('CERT-2026-24767 not found in API response');
      console.log('Available cert_ids:', certsData.items?.map((c: any) => c.cert_id));
    }

    // Now test UI navigation
    await page.goto(BASE_URL);
    await page.evaluate(({ token }) => {
      localStorage.setItem('kavach_token', token);
    }, { token });

    await page.evaluate(() => {
      localStorage.setItem('kavach_user', JSON.stringify({
        id: 'usr-002',
        email: 'p.sharma@bel-defence.in',
        name: 'Priya Sharma',
        roles: ['PROCUREMENT_SUPPLY_CHAIN_OFFICER']
      }));
    });

    // Navigate directly to certification detail
    if (targetCert) {
      await page.goto(`${BASE_URL}/app/certifications/${targetCert.cert_id}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      const detailText = await page.locator('body').innerText();
      console.log(`\nCertification detail page loaded`);
      console.log(`Contains CERT-2026-24767: ${detailText.includes('CERT-2026-24767')}`);
      console.log(`Contains RBAC-TEST-001: ${detailText.includes('RBAC-TEST-001')}`);
      console.log(`Contains 0xDc64: ${detailText.includes('0xDc64')}`);
    }
  });
});
