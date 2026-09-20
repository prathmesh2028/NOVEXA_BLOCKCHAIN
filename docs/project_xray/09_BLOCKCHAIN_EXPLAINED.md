# 09. Blockchain Layer Explained

## 1. Separation of Blockchain Concepts

To eliminate confusion, we explicitly separate the distinct components of the blockchain layer:

1. **Smart Contract Exists**: YES. `contracts/contracts/KavachTrustSBT.sol` is compiled and ready.
2. **Blockchain Adapter Exists**: YES. `backend/src/trust/blockchain/blockchain.adapter.ts` wraps `viem`.
3. **Blockchain Configuration Exists**: YES. `.env` defines `BLOCKCHAIN_RPC_URL=http://localhost:8545`, Chain ID 1337 (`BEL-TRUST-CHAIN`).
4. **Real Blockchain Node Running**: NO. In the current workspace, no local Besu/Hardhat/Geth container is running on port 8545.
5. **Real Transactions Executed**: NO. Because the RPC port is offline, live transactions cannot be mined on-chain.
6. **Real Receipt Verified**: NO. Receipt fetching requires a live JSON-RPC node.

---

## 2. Target Networks: Besu vs Sepolia vs Demo

- **Hyperledger Besu (QBFT Consensus)**: This is the **primary production target** for BEL. It is a private, permissioned Ethereum client supporting enterprise QBFT consensus with zero gas fees and private transactions.
- **Ethereum Sepolia**: A public Ethereum proof-of-stake testnet. Can be targeted by setting `BLOCKCHAIN_RPC_URL` and `BLOCKCHAIN_CHAIN_ID=11155111`.
- **Demo Mode (`APP_ENV=demo` or `BLOCKCHAIN_MODE=demo`)**:
  - When the blockchain node is unreachable in demo mode, `BlockchainAdapter.submitTransaction` returns:
    ```typescript
    { txHash: `0xDEMO-mocktx${Date.now()}`, status: 'SIMULATED' }
    ```
- **Development/Real Mode (`BLOCKCHAIN_MODE=real`)**:
  - When the blockchain node is unreachable in real mode, `BlockchainAdapter.submitTransaction` logs an error and returns `{ txHash: '', status: 'FAILED' }`.
  - The `WorkerService` catches this, marks the transaction as `FAILED`, and records the RPC failure error. It **does not** fake confirmation.

---

## 3. The Smart Contract: `KavachTrustSBT.sol`

- **Type**: ERC-721 Soulbound Token implementing EIP-5192 (`IERC5192.sol`).
- **Immutability & Non-transferability**: Overrides OpenZeppelin's internal `_update` function:
  ```solidity
  function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
      address from = _ownerOf(tokenId);
      if (from != address(0) && to != address(0)) {
          revert("KavachTrust: Certifications are non-transferable Soulbound Tokens");
      }
      return super._update(to, tokenId, auth);
  }
  ```
  - Minting (`from == address(0)`) is allowed.
  - Burning (`to == address(0)`) is allowed.
  - Any transfer between two users reverts immediately.
- **On-Chain Payload**:
  ```solidity
  struct CertificationData {
      string assetId;
      string batchId;
      string evidenceHash; // SHA-256 of verification evidence
      uint256 issuedAt;
  }
  ```
  This guarantees that once an asset certificate is minted to an address, its display ID, batch, and evidence checksum can never be altered or traded.