import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying KavachTrustSBT with account:", deployer.address);

  const SBT = await ethers.getContractFactory("KavachTrustSBT");
  const sbt = await SBT.deploy();

  await sbt.waitForDeployment();
  console.log("KavachTrustSBT deployed to:", await sbt.getAddress());

  const metadataBaseUri = process.env.METADATA_BASE_URI;
  if (metadataBaseUri) {
    const tx = await sbt.setBaseTokenURI(metadataBaseUri.endsWith("/") ? metadataBaseUri : `${metadataBaseUri}/`);
    await tx.wait();
    console.log("Metadata base URI configured:", metadataBaseUri);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
