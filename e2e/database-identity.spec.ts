import { test, expect } from '@playwright/test';

test.describe('DATABASE IDENTITY + BLOCKCHAIN INVESTIGATION', () => {
  const API_URL = 'http://localhost:8000/api/v1';
  const BLOCKCHAIN_RPC = 'http://localhost:8545';

  test('PHASE 1-2: Database identity and counts', async ({ request }) => {
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
      console.log(`  - ${c.id} (status: ${c.status}, asset: ${c.assetId})`);
    });

    // List all asset IDs
    console.log('\nALL ASSET IDs (first 10):');
    assetsData.items?.slice(0, 10).forEach((a: any) => {
      console.log(`  - ${a.id} (status: ${a.status}, lifecycle: ${a.lifecycleState})`);
    });
  });

  test('PHASE 4: Blockchain identity - Contract and Transaction', async ({ request }) => {
    console.log('\n=== BLOCKCHAIN IDENTITY ===\n');

    // Get chain ID
    const chainIdRes = await request.post(BLOCKCHAIN_RPC, {
      data: {
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      }
    });
    const chainIdData = await chainIdRes.json();
    console.log('Chain ID:', chainIdData.result);

    // Get latest block
    const blockRes = await request.post(BLOCKCHAIN_RPC, {
      data: {
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }
    });
    const blockData = await blockRes.json();
    console.log('Latest block:', parseInt(blockData.result, 16));

    // Get transaction receipt for 0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967
    const txReceiptRes = await request.post(BLOCKCHAIN_RPC, {
      data: {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: ['0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967'],
        id: 1
      }
    });
    const txReceiptData = await txReceiptRes.json();
    console.log('Transaction 0xea569f48... exists:', !!txReceiptData.result);
    if (txReceiptData.result) {
      console.log('  Block:', parseInt(txReceiptData.result.blockNumber, 16));
      console.log('  Status:', txReceiptData.result.status === '0x1' ? 'SUCCESS' : 'FAILED');
      console.log('  Contract:', txReceiptData.result.contractAddress);
      console.log('  Logs count:', txReceiptData.result.logs?.length);
    }

    // Get transaction details
    const txRes = await request.post(BLOCKCHAIN_RPC, {
      data: {
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: ['0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967'],
        id: 1
      }
    });
    const txData = await txRes.json();
    if (txData.result) {
      console.log('  From:', txData.result.from);
      console.log('  To:', txData.result.to);
      console.log('  Input length:', txData.result.input?.length);
    }
  });

  test('PHASE 5: Token 3 identity', async ({ request }) => {
    console.log('\n=== TOKEN 3 IDENTITY ===\n');

    const CONTRACT = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

    // Call tokenURI(3) to get metadata
    const tokenUriRes = await request.post('http://localhost:8545', {
      data: {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: CONTRACT,
          data: '0xc87b56dd' + '0000000000000000000000000000000000000000000000000000000000000003' // tokenURI(3)
        }, 'latest'],
        id: 1
      }
    });
    const tokenUriData = await tokenUriRes.json();
    console.log('Token 3 URI exists:', !!tokenUriData.result);
    if (tokenUriData.result) {
      // Decode hex to string
      const hex = tokenUriData.result;
      if (hex.startsWith('0x')) {
        const str = hex.slice(130).match(/.{1,2}/g)?.map((byte: string) => String.fromCharCode(parseInt(byte, 16))).join('');
        console.log('  Token URI string:', str);
      }
    }

    // Call ownerOf(3)
    const ownerRes = await request.post('http://localhost:8545', {
      data: {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: CONTRACT,
          data: '0x6352211e' + '0000000000000000000000000000000000000000000000000000000000000003' // ownerOf(3)
        }, 'latest'],
        id: 1
      }
    });
    const ownerData = await ownerRes.json();
    console.log('Token 3 owner:', ownerData.result);
  });
});
