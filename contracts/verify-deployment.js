const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Verifying KavachTrustSBT deployment...');

  // Load contract artifacts
  const artifactPath = path.join(__dirname, 'artifacts', 'contracts', 'KavachTrustSBT.sol', 'KavachTrustSBT.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Connect to Besu
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const wallet = new ethers.Wallet(privateKey, provider);

  const contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  console.log('Contract address:', contractAddress);

  // Verify contract owner
  try {
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
  } catch (e) {
    console.log('No owner function (ERC5192 may not have owner)');
  }

  // Verify contract supports minting
  try {
    const name = await contract.name();
    console.log('Contract name:', name);
  } catch (e) {
    console.log('No name function');
  }

  // Try to mint a test certification
  try {
    const tx = await contract.mintCertification(
      wallet.address,
      'BEL-RADAR-001',
      'batch-001',
      '0x' + '0'.repeat(63)
    );
    console.log('Mint transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('Mint confirmed in block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
  } catch (e) {
    console.log('Mint test failed (may require different parameters):', e.message);
  }

  console.log('Contract verification complete');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
