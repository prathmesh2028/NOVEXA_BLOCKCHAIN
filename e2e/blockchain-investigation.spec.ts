import { test, expect } from '@playwright/test';

test.describe('BLOCKCHAIN INVESTIGATION', () => {
  const BLOCKCHAIN_RPC = 'http://localhost:8545';

  test('Check specific transaction from previous reports', async ({ request }) => {
    console.log('\n=== BLOCKCHAIN TRANSACTION CHECK ===\n');

    const TX = '0xea569f48edccbfce9dc5f2e8c6354680356cd5a8ee21c8d58fca037a88d8e967';

    // Get transaction receipt
    const txReceiptRes = await request.post(BLOCKCHAIN_RPC, {
      data: {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [TX],
        id: 1
      }
    });
    const txReceiptData = await txReceiptRes.json();

    console.log('Transaction 0xea569f48...:');
    console.log('  Exists:', !!txReceiptData.result);

    if (txReceiptData.result) {
      console.log('  Block:', parseInt(txReceiptData.result.blockNumber, 16));
      console.log('  Status:', txReceiptData.result.status === '0x1' ? 'SUCCESS' : 'FAILED');
      console.log('  Contract:', txReceiptData.result.contractAddress);
      console.log('  From:', txReceiptData.result.from);
      console.log('  To:', txReceiptData.result.to);
      console.log('  Logs:', txReceiptData.result.logs?.length);

      // Print logs to see what was minted
      if (txReceiptData.result.logs && txReceiptData.result.logs.length > 0) {
        console.log('\n  LOGS:');
        txReceiptData.result.logs.forEach((log: any, idx: number) => {
          console.log(`    Log ${idx}:`);
          console.log(`      Address: ${log.address}`);
          console.log(`      Topics: ${log.topics}`);
          console.log(`      Data: ${log.data}`);
        });
      }
    } else {
      console.log('  ERROR:', txReceiptData.error);
    }
  });

  test('Check contract existence and token supply', async ({ request }) => {
    console.log('\n=== CONTRACT IDENTITY ===\n');

    const CONTRACT = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

    // Get contract code
    const codeRes = await request.post(BLOCKCHAIN_RPC, {
      data: {
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [CONTRACT, 'latest'],
        id: 1
      }
    });
    const codeData = await codeRes.json();
    console.log('Contract exists:', codeData.result !== '0x');

    // Get total supply
    const supplyRes = await request.post(BLOCKCHAIN_RPC, {
      data: {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: CONTRACT,
          data: '0x18160ddd' // totalSupply()
        }, 'latest'],
        id: 1
      }
    });
    const supplyData = await supplyRes.json();
    if (supplyData.result) {
      const supply = parseInt(supplyData.result, 16);
      console.log('Total supply:', supply);
    }
  });

  test('Get latest block number', async ({ request }) => {
    console.log('\n=== LATEST BLOCK ===\n');

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
  });
});
