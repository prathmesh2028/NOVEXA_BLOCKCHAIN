const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Deploying KavachTrustSBT using ethers.js...');

  // Load contract artifacts
  const artifactPath = path.join(__dirname, 'artifacts', 'contracts', 'KavachTrustSBT.sol', 'KavachTrustSBT.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Connect to Besu
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  console.log('Connected to RPC');

  // Use the private key from backend env
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Deployer address:', wallet.address);

  // Deploy contract
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  console.log('Deployment transaction hash:', contract.deploymentTransaction().hash);

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log('KavachTrustSBT deployed to:', address);

  // Verify deployment
  const code = await provider.getCode(address);
  console.log('Contract code exists:', code !== '0x');

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
