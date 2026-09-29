const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Checking existing transaction on Besu...');

  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  const txHash = '0xf9300537c50e6ebd95f93900bb39446b41fd975eec5cc8dc576583ee241d710a';

  console.log(`Checking transaction: ${txHash}`);

  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (receipt) {
      console.log('Transaction found:');
      console.log(`Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Block: ${receipt.blockNumber}`);
      console.log(`Gas Used: ${receipt.gasUsed}`);
      console.log(`Contract: ${receipt.to}`);
    } else {
      console.log('Transaction not found (may be on different network)');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Check current block
  const blockNumber = await provider.getBlockNumber();
  console.log(`Current block: ${blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
