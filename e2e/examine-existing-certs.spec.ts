import { test, expect } from '@playwright/test';

test.describe('EXAMINE EXISTING CERTIFICATIONS', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Get full certification details to find usable records', async ({ request }) => {
    console.log('\n=== EXAMINING EXISTING CERTIFICATIONS ===\n');

    // Login
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get all certifications
    const certsRes = await request.get(`${API_URL}/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const certsData = await certsRes.json();

    console.log('Total certifications:', certsData.total);
    console.log('\nALL CERTIFICATIONS:');

    for (const cert of certsData.items || []) {
      console.log(`\n  Certification ID: ${cert.id}`);
      console.log(`    Status: ${cert.status}`);
      console.log(`    Asset ID: ${cert.assetId}`);
      console.log(`    Token ID: ${cert.tokenId}`);
      console.log(`    Transaction: ${cert.transactionHash}`);
      console.log(`    Block: ${cert.blockNumber}`);
      console.log(`    Contract: ${cert.contractAddress}`);

      // Get full details for CONFIRMED certifications
      if (cert.status === 'CONFIRMED') {
        const detailRes = await request.get(`${API_URL}/certifications/${cert.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (detailRes.ok()) {
          const detail = await detailRes.json();
          console.log(`    Asset Name: ${detail.asset?.name}`);
          console.log(`    Asset Type: ${detail.asset?.type}`);
          console.log(`    Batch ID: ${detail.batch?.id}`);
        }
      }
    }

    // Get blockchain transactions
    const txRes = await request.get(`${API_URL}/blockchain/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const txData = await txRes.json();

    console.log('\nBLOCKCHAIN TRANSACTIONS:');
    for (const tx of txData.items || []) {
      console.log(`  TX: ${tx.transactionHash}`);
      console.log(`    Block: ${tx.blockNumber}`);
      console.log(`    Status: ${tx.status}`);
      console.log(`    Certification ID: ${tx.certificationId}`);
    }
  });
});
