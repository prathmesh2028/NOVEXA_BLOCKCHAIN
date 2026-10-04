import { test, expect } from '@playwright/test';

test.describe('USE EXISTING ASSETS FOR DEMO', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Use existing asset and create certification chain', async ({ request }) => {
    console.log('\n=== USING EXISTING ASSETS ===\n');

    // Login as System Admin
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get all assets
    const assetsRes = await request.get(`${API_URL}/assets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const assetsData = await assetsRes.json();

    console.log('Total assets:', assetsData.total);
    console.log('\nALL ASSETS:');
    assetsData.items?.forEach((a: any) => {
      console.log(`  - ${a.id}`);
      console.log(`    Name: ${a.name}`);
      console.log(`    Status: ${a.status}`);
      console.log(`    Lifecycle: ${a.lifecycleState}`);
    });

    // Pick first asset for demo
    const demoAsset = assetsData.items?.[0];
    if (demoAsset) {
      console.log('\nSELECTED DEMO ASSET:', demoAsset.id);
      console.log('Name:', demoAsset.name);

      // Create inspection for this asset
      const inspectRes = await request.post(`${API_URL}/inspections`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          assetId: demoAsset.id,
          inspectorId: 'r.kumar@bel-defence.in',
          status: 'PENDING',
          type: 'QUALITY',
          scheduledDate: new Date().toISOString()
        }
      });

      if (inspectRes.ok()) {
        const inspection = await inspectRes.json();
        console.log('Inspection created:', inspection.id);
      } else {
        console.log('Inspection creation failed:', await inspectRes.text());
      }

      // Create certification for this asset
      const certRes = await request.post(`${API_URL}/certifications`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          assetId: demoAsset.id,
          batchId: 'BATCH-DEMO-001',
          type: 'QUALITY_CERTIFICATE',
          status: 'PENDING'
        }
      });

      if (certRes.ok()) {
        const cert = await certRes.json();
        console.log('Certification created:', cert.id);
        console.log('Asset ID:', cert.assetId);
      } else {
        console.log('Certification creation failed:', await certRes.text());
      }
    }
  });
});
