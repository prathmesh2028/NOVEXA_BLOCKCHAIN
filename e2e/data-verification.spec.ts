import { test, expect } from '@playwright/test';

test.describe('DATA VERIFICATION - API LEVEL', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Verify canonical records exist in database', async ({ request }) => {
    console.log('\n=== CANONICAL RECORDS VERIFICATION ===\n');

    // Login as System Admin
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'a.mehta@bel-defence.in',
        password: 'password'
      }
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token;

    // Check Asset RBAC-TEST-001
    const assetRes = await request.get(`${API_URL}/assets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const assetData = await assetRes.json();
    console.log('Assets response total:', assetData.total);
    console.log('Assets items:', assetData.items?.length);

    const rbacAsset = assetData.items?.find((a: any) => a.id === 'RBAC-TEST-001');
    console.log('RBAC-TEST-001 found:', !!rbacAsset);
    if (rbacAsset) {
      console.log('RBAC-TEST-001 lifecycle:', rbacAsset.lifecycleState);
      console.log('RBAC-TEST-001 status:', rbacAsset.status);
    }

    // Check Certification CERT-2026-24767
    const certRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const certData = await certRes.json();
    console.log('Certifications response total:', certData.total);
    console.log('Certifications items:', certData.items?.length);

    const cert24767 = certData.items?.find((c: any) => c.id === 'CERT-2026-24767');
    console.log('CERT-2026-24767 found:', !!cert24767);
    if (cert24767) {
      console.log('CERT-2026-24767 status:', cert24767.status);
      console.log('CERT-2026-24767 assetId:', cert24767.assetId);
      console.log('CERT-2026-24767 contract:', cert24767.contractAddress);
      console.log('CERT-2026-24767 transaction:', cert24767.transactionHash);
      console.log('CERT-2026-24767 block:', cert24767.blockNumber);
      console.log('CERT-2026-24767 tokenId:', cert24767.tokenId);
    }

    // Check Inspections for RBAC-TEST-001
    const inspectRes = await request.get(`${API_URL}/inspections`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const inspectData = await inspectRes.json();
    console.log('Inspections response total:', inspectData.total);
    console.log('Inspections items:', inspectData.items?.length);

    const rbacInspection = inspectData.items?.find((i: any) => i.assetId === 'RBAC-TEST-001');
    console.log('Inspection for RBAC-TEST-001 found:', !!rbacInspection);
    if (rbacInspection) {
      console.log('Inspection status:', rbacInspection.status);
      console.log('Inspection lifecycle:', rbacInspection.lifecycleState);
    }
  });
});
