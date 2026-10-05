import { test, expect } from '@playwright/test';

test.describe('DATABASE IDENTITY + COUNTS', () => {
  const API_URL = 'http://localhost:8000/api/v1';

  test('Database identity and entity counts', async ({ request }) => {
    console.log('\n=== DATABASE IDENTITY ===\n');

    // Login
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'a.mehta@bel-defence.in', password: 'password' }
    });
    const token = (await loginRes.json()).access_token;

    // Get all entity counts
    const [assets, certs, inspections, outbox, blockchainTx, audit] = await Promise.all([
      request.get(`${API_URL}/assets`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${API_URL}/certifications`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${API_URL}/inspections`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${API_URL}/outbox`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${API_URL}/blockchain/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${API_URL}/audit/events`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const assetsData = await assets.json();
    const certsData = await certs.json();
    const inspectionsData = await inspections.json();
    const outboxData = await outbox.json();
    const blockchainTxData = await blockchainTx.json();
    const auditData = await audit.json();

    console.log('DATABASE COUNTS:');
    console.log('Assets:', assetsData.total);
    console.log('Certifications:', certsData.total);
    console.log('Inspections:', inspectionsData.total);
    console.log('Outbox events:', outboxData.total);
    console.log('Blockchain transactions:', blockchainTxData.total);
    console.log('Audit events:', auditData.total);

    // List all certification IDs
    console.log('\nALL CERTIFICATION IDs:');
    certsData.items?.forEach((c: any) => {
      console.log(`  - ${c.id} (status: ${c.status}, asset: ${c.assetId}, token: ${c.tokenId})`);
    });

    // List all asset IDs
    console.log('\nALL ASSET IDs (first 10):');
    assetsData.items?.slice(0, 10).forEach((a: any) => {
      console.log(`  - ${a.id} (status: ${a.status}, lifecycle: ${a.lifecycleState})`);
    });

    // List inspection asset IDs
    console.log('\nINSPECTION ASSET IDs:');
    inspectionsData.items?.forEach((i: any) => {
      console.log(`  - ${i.assetId} (status: ${i.status})`);
    });

    // List blockchain transactions
    console.log('\nBLOCKCHAIN TRANSACTIONS (first 5):');
    blockchainTxData.items?.slice(0, 5).forEach((tx: any) => {
      console.log(`  - ${tx.transactionHash} (block: ${tx.blockNumber}, status: ${tx.status})`);
    });
  });
});
