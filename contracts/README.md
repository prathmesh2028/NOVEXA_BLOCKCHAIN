# KavachTrust — Smart Contracts & EVM Layer

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow?style=flat-square&logo=ethereum&logoColor=white)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v5.0-blue?style=flat-square&logo=openzeppelin&logoColor=white)](https://www.openzeppelin.com/)
[![Standard](https://img.shields.io/badge/Standard-ERC721%20%2B%20ERC5192-green?style=flat-square)](https://eips.ethereum.org/EIPS/eip-5192)

The **KavachTrust Smart Contract Layer** provides non-transferable, tamper-evident cryptographic certification for defense and aerospace components. Built on Ethereum standards and deployed on a private **Hyperledger Besu (QBFT)** network, it permanently anchors digital asset passports to the blockchain.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    KavachTrust Backend Relayer       │
                      │  (Authorized Contract Owner Only)    │
                      └──────────────────┬───────────────────┘
                                         │
                 Calls mintCertification / revokeCertification
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │          KavachTrustSBT.sol          │
                      │    • ERC-721 Non-Transferable Base   │
                      │    • IERC5192 Minimal Soulbound      │
                      │    • OpenZeppelin Ownable Access     │
                      └──────────────────┬───────────────────┘
                                         │
                      ┌──────────────────┴───────────────────┐
                      │                                      │
                      ▼                                      ▼
             Locked Event Emitted                  On-Chain Certification
            (ERC-5192 non-transfer)                 Data Immutable Record
                                                (Asset ID, Batch, Evidence Hash)
```

---

## Contract Specifications

### `KavachTrustSBT.sol`
- **Token Name**: `KavachTrust Certification`
- **Token Symbol**: `KTC`
- **Base Standards**:
  - **ERC-721**: Standard token interface for unique asset representation.
  - **IERC5192 (Minimal Soulbound)**: Standardized event and query interface declaring the token as permanently locked upon minting.
  - **Ownable**: Restricts minting and revocation functions strictly to the authorized relayer wallet.

### Soulbound Mechanism (`_update`)
To guarantee that military-grade certifications cannot be sold, traded, or transferred between unauthorized wallets, `_update()` overrides standard ERC-721 transfer semantics:

```solidity
function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
    address from = _ownerOf(tokenId);
    if (from != address(0) && to != address(0)) {
        revert("KavachTrust: Certifications are non-transferable Soulbound Tokens");
    }
    return super._update(to, tokenId, auth);
}
```

### On-Chain Certification Record
Every issued Soulbound Token encapsulates key provenance metadata on-chain:

```solidity
struct CertificationData {
    string assetId;      // Unique asset display identifier (e.g., "EF-2026-00421")
    string batchId;      // Manufacturing batch reference
    string evidenceHash; // SHA-256 digest of comprehensive QA evidence package
    uint256 issuedAt;    // Unix timestamp of issuance
    uint256 revokedAt;   // Unix timestamp of revocation (0 if active)
}
```

---

## Repository Structure

```
contracts/
├── contracts/
│   ├── IERC5192.sol             # Minimal Soulbound Token interface standard
│   └── KavachTrustSBT.sol       # Core ERC-721 + ERC-5192 Soulbound implementation
├── scripts/
│   ├── deploy-standalone.js     # Standalone deployment script for Besu / local nodes
│   ├── deploy-with-ethers.js    # Hardhat ethers deployment runner
│   ├── verify-deployment.js     # Post-deployment validation script
│   └── check-old-tx.js          # On-chain transaction inspection utility
├── test/                        # Contract unit and security test suites
├── hardhat.config.ts            # Hardhat network and compiler configuration
└── package.json                 # Hardhat dependencies and task scripts
```

---

## Setup & Development

### 1. Install Dependencies
```bash
pnpm install
# Or from workspace root:
pnpm --dir contracts install
```

### 2. Compile Contracts
```bash
pnpm compile
# Or from workspace root:
pnpm --dir contracts compile
```

### 3. Run Local Hardhat Node
```bash
pnpm node
# Or from workspace root:
pnpm --dir contracts node
```

### 4. Run Unit Tests
```bash
pnpm test
# Or from workspace root:
pnpm --dir contracts test
```

---

## Deployment to Hyperledger Besu

To deploy `KavachTrustSBT` to the local Hyperledger Besu network (`http://localhost:8545`):

```bash
# Set your deployer private key and RPC endpoint in environment
export RPC_URL=http://localhost:8545
export PRIVATE_KEY=0x...

# Run deployment script
node scripts/deploy-standalone.js
```

After deployment, copy the logged contract address and update:
1. `backend/.env` -> `SBT_CONTRACT_ADDRESS=0x...`
2. `frontend/f1/.env` -> `VITE_SBT_CONTRACT_ADDRESS=0x...`

---

## Security Invariants

1. **Non-Transferability**: Tokens cannot be transferred under any circumstances once minted.
2. **Owner-Only Minting**: Only the verified system wallet address configured in the backend can mint or revoke tokens.
3. **Evidence Binding**: The `evidenceHash` immutable field ensures that no post-issuance modification of inspection records or test reports can occur without invalidating cryptographic proof.
4. **Permanent Audit Record**: Revocations record a non-zero `revokedAt` timestamp rather than deleting historical token data, preserving full forensic traceability.
