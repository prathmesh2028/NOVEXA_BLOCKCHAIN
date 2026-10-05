import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-toolbox";
import { KavachTrustSBT } from "../typechain-types";

describe("KavachTrustSBT", function () {
  let sbt: KavachTrustSBT;
  let owner: any;
  let user: any;
  let otherAccount: any;

  beforeEach(async function () {
    [owner, user, otherAccount] = await ethers.getSigners();
    const SBT = await ethers.getContractFactory("KavachTrustSBT");
    sbt = await SBT.deploy();
  });

  it("Should set the right owner", async function () {
    expect(await sbt.owner()).to.equal(owner.address);
  });

  it("Should mint a certification and emit Locked (ERC-5192) and CertificationMinted", async function () {
    const assetId = "AST-2026-001";
    const batchId = "BCH-2026-X1";
    const evidenceHash = "hash123";

    await expect(sbt.mintCertification(user.address, assetId, batchId, evidenceHash))
      .to.emit(sbt, "Locked")
      .withArgs(1)
      .and.to.emit(sbt, "CertificationMinted")
      .withArgs(1, assetId, batchId, evidenceHash, (anyValue: any) => true);

    expect(await sbt.ownerOf(1)).to.equal(user.address);
  });

  it("Should prevent transferring a minted certification (Soulbound)", async function () {
    await sbt.mintCertification(user.address, "AST-1", "BCH-1", "hash");

    await expect(
      sbt.connect(user).transferFrom(user.address, otherAccount.address, 1)
    ).to.be.revertedWith("KavachTrust: Certifications are non-transferable Soulbound Tokens");
  });

  it("Should allow the owner to mint multiple certifications", async function () {
    await sbt.mintCertification(user.address, "AST-1", "BCH-1", "hash1");
    await sbt.mintCertification(otherAccount.address, "AST-2", "BCH-1", "hash2");

    expect(await sbt.ownerOf(1)).to.equal(user.address);
    expect(await sbt.ownerOf(2)).to.equal(otherAccount.address);
  });

  it("Should return true for locked() (ERC-5192)", async function () {
    await sbt.mintCertification(user.address, "AST-1", "BCH-1", "hash");
    expect(await sbt.locked(1)).to.be.true;
  });

  it("Should support IERC5192 interface", async function () {
    // IERC5192 interface ID is 0xb45a3c0e
    expect(await sbt.supportsInterface("0xb45a3c0e")).to.be.true;
  });

  it("Should expose wallet-readable metadata without changing soulbound behavior", async function () {
    await sbt.setBaseTokenURI("https://metadata.example.test/certifications/");
    await sbt.mintCertification(user.address, "AST-1", "BCH-1", "hash");
    expect(await sbt.tokenURI(1)).to.equal("https://metadata.example.test/certifications/1.json");
  });

  describe("Revocation", function () {
    beforeEach(async function () {
      await sbt.mintCertification(user.address, "AST-1", "BCH-1", "hash");
    });

    it("Should allow the owner to revoke a certification", async function () {
      await expect(sbt.revokeCertification(1))
        .to.emit(sbt, "CertificationRevoked")
        .withArgs(1, (anyValue: any) => true);

      const details = await sbt.getCertification(1);
      expect(details.revokedAt).to.be.greaterThan(0);
    });

    it("Should prevent non-owners from revoking a certification", async function () {
      await expect(
        sbt.connect(user).revokeCertification(1)
      ).to.be.revertedWithCustomError(sbt, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Should revert if revoking a non-existent certification", async function () {
      await expect(
        sbt.revokeCertification(999)
      ).to.be.revertedWithCustomError(sbt, "ERC721NonexistentToken");
    });
  });
});
