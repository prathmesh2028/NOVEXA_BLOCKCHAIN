import { test, expect } from '@playwright/test';

test.describe('FIND ASSET BY UUID', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Get asset by UUID from certification', async ({ request }) => {
    console.log('\n=== FIND ASSET FOR CERT-2026-24767 ===\n');

    // Login
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get all assets
    const assetsRes = await request.get(`${API_URL}/assets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const assetsData = await assetsRes.json();

    // Find asset with UUID a2415a9b-c653-40c4-b79a-a2683b29c9b0
    const targetAsset = assetsData.items?.find((a: any) => a.id === 'a2415a9b-c653-40c4-b79a-a2683b29c9b0');

    if (targetAsset) {
      console.log('FOUND ASSET FOR CERT-2026-24767:');
      console.log('  UUID:', targetAsset.id);
      console.log('  Display ID:', targetAsset.asset_id);
      console.log('  Name/Type:', targetAsset.type, targetAsset.model);
      console.log('  Serial:', targetAsset.serial_number);
      console.log('  Lifecycle:', targetAsset.lifecycle_state);
      console.log('  Status:', targetAsset.cert_status);
    } else {
      console.log('Asset not found in list, trying direct get...');
      const directRes = await request.get(`${API_URL}/assets/a2415a9b-c653-40c4-b79a-a2683b29c9b0`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (directRes.ok()) {
        const directAsset = await directRes.json();
        console.log('DIRECT GET ASSET:');
        console.log('  Keys:', Object.keys(directAsset));
        for (const [key, value] of Object.entries(directAsset)) {
          console.log(`  ${key}: ${value}`);
        }
      } else {
        console.log('Direct get failed:', await directRes.text());
      }
    }
  });
});
