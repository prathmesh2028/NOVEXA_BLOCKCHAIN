# BLOCKCHAIN FORENSIC REPORT

## 1. Smart Contract Details
- **File**: `contracts/contracts/KavachTrustSBT.sol`
- **Language**: Solidity ^0.8.20
- **Base Standards**: OpenZeppelin `ERC721`, `Ownable`.
- **Custom Logic (Non-Transferability)**: The contract overrides the internal `_update` function to revert with `"KavachTrust: Certifications are non-transferable Soulbound Tokens"` if `from != address(0)` and `to != address(0)`. This effectively makes it a Soulbound Token (SBT).
- **Target Architecture Gap**: While it acts as an SBT, it does not fully implement the EIP-5192 standard interfaces (`locked` events/functions), which is typical for "ERC-5192-style" passports.

## 2. On-Chain Data (Trust Boundary)
- **Data Stored On-Chain**: The contract stores a `CertificationData` struct:
  - `assetId` (string)
  - `batchId` (string)
  - `evidenceHash` (string - SHA-256 hash of the verification evidence)
  - `issuedAt` (uint256 block timestamp)
- **What Blockchain Proves**: That the specific `evidenceHash` for `assetId` was certified by the contract owner (the Backend) at `issuedAt`.
- **What Blockchain DOES NOT Prove**: The validity of the physical asset itself, or whether the evidence file contains truthful information (this is application-layer/physical-world trust).

## 3. Network & Infrastructure
- **Current**: Hardhat local node (`npx hardhat node`).
- **Integration**: Legacy backend uses `Web3.py` connecting via HTTP RPC (`http://127.0.0.1:8545`).
- **Target**: Hyperledger Besu with QBFT consensus. The next agent must migrate the deployment scripts and connection logic to accommodate Besu.

## 4. API Integration (The "Blocking" Problem)
- **Implementation**: `app/api/v1/certifications.py` contains `mint_sbt()`.
- **Risk**: The API calls `web3.eth.send_raw_transaction` and then synchronously waits using `web3.eth.wait_for_transaction_receipt(tx_hash)`.
- **Verdict**: **UNACCEPTABLE FOR PRODUCTION**. This blocks the HTTP worker thread.
- **Target Architecture**: Must use a Transactional Outbox pattern. The API should insert an `OutboxEvent`, return 202 Accepted, and a background worker (e.g., BullMQ in NestJS) should process the transaction and update the DB asynchronously.

## 5. Contract Testing
- **Current**: Hardhat tests exist in `contracts/package.json` setup, but are not comprehensively mapped in CI.
- **Target**: Must migrate to Foundry (`forge test`) and integrate Slither for static analysis.
