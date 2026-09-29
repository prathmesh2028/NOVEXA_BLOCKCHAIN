const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('Deploying KavachTrustSBT with account:', wallet.address);

  const bytecode = require('./artifacts/contracts/KavachTrustSBT.sol/KavachTrustSBT.json').bytecode;
  const abi = require('./artifacts/contracts/KavachTrustSBT.sol/KavachTrustSBT.json').abi;

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log('KavachTrustSBT deployed to:', address);
}

main().catch(console.error);
