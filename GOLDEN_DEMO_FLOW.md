# KAVACHTRUST GOLDEN SIH DEMO FLOW

**Purpose:** Deterministic demonstration path for SIH showcase

---

## Golden Path Overview

This document describes the complete end-to-end demonstration flow that should be executed for the SIH showcase:

```
LOGIN
→ DASHBOARD
→ ASSET VIEW
→ INSPECTION RECORD
→ EVIDENCE
→ SHA-256 INTEGRITY
→ CERTIFICATION
→ OUTBOX
→ WORKER
→ BESU TRANSACTION
→ BLOCKCHAIN RECEIPT
→ VERIFICATION CENTER
→ AUDIT TRAIL
```

---

## Prerequisites

### Services Running
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:8443`
- Besu: `http://localhost:8545`
- MinIO: `http://localhost:9000`

### Demo Data
Seed data must be loaded:
```bash
cd backend
npx prisma db seed
```

### Current Contract
- Address: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- Network: BEL-TRUST-CHAIN (Chain ID: 31337)

---

## Step-by-Step Golden Flow

### STEP 1: LOGIN

**Action:**
1. Navigate to `http://localhost:8443`
2. Enter credentials:
   - Email: `a.mehta@bel-defence.in`
   - Password: `password`
3. Click "Login"

**Expected Result:**
- Redirect to Dashboard
- User name displayed: "Arjun Mehta"
- Role displayed: "SYSTEM_ADMIN"

**Verification:**
```bash
# Check authentication
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a.mehta@bel-defence.in","password":"password"}'
```

---

### STEP 2: DASHBOARD

**Action:**
1. View dashboard metrics
2. Observe asset counts, certification status

**Expected Result:**
- Total assets displayed
- Pending certifications displayed
- Recent activity feed visible

**Verification:**
```bash
# Get assets count
curl http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer <token>"

# Get certifications
curl http://localhost:8000/api/v1/certifications \
  -H "Authorization: Bearer <token>"
```

---

### STEP 3: ASSET VIEW

**Action:**
1. Navigate to Assets page
2. Click on asset: `EF-2026-00421`

**Expected Result:**
- Asset details displayed:
  - Type: Electronic Fuze
  - Model: EF-MK4-SYNTH
  - Serial: SN-EF-00421
  - Batch: EF-BATCH-2026-017
  - Lifecycle: ACCEPTED_FOR_ASSEMBLY
  - Certification: CERT-2026-00089 (CONFIRMED)

**Verification:**
```bash
curl http://localhost:8000/api/v1/assets/EF-2026-00421 \
  -H "Authorization: Bearer <token>"
```

---

### STEP 4: INSPECTION RECORD

**Action:**
1. View inspection history for asset
2. Verify lifecycle transitions

**Expected Result:**
- Inspection records visible
- Lifecycle state transitions documented
- Supplier declaration visible

**Verification:**
```bash
# Get lifecycle transitions
curl http://localhost:8000/api/v1/lifecycle/transitions?assetId=EF-2026-00421 \
  -H "Authorization: Bearer <token>"
```

---

### STEP 5: EVIDENCE

**Action:**
1. Navigate to Evidence Vault
2. Filter by asset: `EF-2026-00421`
3. View evidence records

**Expected Result:**
- Evidence files displayed:
  - Inspection Report
  - Supplier Declaration
  - Receipt Confirmation
  - QA Approval
- SHA-256 hashes visible
- Integrity status: VERIFIED

**Verification:**
```bash
curl http://localhost:8000/api/v1/evidence?assetId=EF-2026-00421 \
  -H "Authorization: Bearer <token>"
```

---

### STEP 6: SHA-256 INTEGRITY

**Action:**
1. Click on an evidence file
2. View SHA-256 hash
3. Verify integrity status

**Expected Result:**
- SHA-256 hash displayed (64-character hex string)
- Status: "integrityVerified: true"
- Hash matches stored value

**Key Point:**
SHA-256 is a cryptographic hash function that produces a unique fingerprint. Any change to the file produces a different hash, enabling tamper detection. The hash itself does not provide immutability - the blockchain anchoring provides the immutability record.

---

### STEP 7: CERTIFICATION

**Action:**
1. View certification CERT-2026-00089
2. Verify certification details

**Expected Result:**
- Certification ID: CERT-2026-00089
- Status: CONFIRMED
- Token ID: 3
- Contract Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (old contract) OR `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` (new contract)
- Transaction Hash: `0xf9300537c50e6ebd95f93900bb39446b41fd975eec5cc8dc576583ee241d710a`
- Block Number: 1819

**Verification:**
```bash
curl http://localhost:8000/api/v1/certifications/CERT-2026-00089 \
  -H "Authorization: Bearer <token>"
```

---

### STEP 8: OUTBOX

**Action:**
1. Check worker health endpoint
2. Verify outbox status

**Expected Result:**
```json
{
  "status": "ok",
  "outbox": {
    "pending": 0,
    "failed": 0,
    "completed": 3,
    "processing": 0
  },
  "blockchain": {
    "pendingTransactions": 2
  }
}
```

**Verification:**
```bash
curl http://localhost:8000/api/v1/health/worker
```

---

### STEP 9: WORKER

**Action:**
1. Check backend logs for worker activity
2. Verify worker is processing events

**Expected Result:**
Logs show:
```
[WorkerService] Worker worker-<id> started
[WorkerService] Mint request for certification CERT-2026-00089
```

**Verification:**
```bash
# Check backend logs
tail -f backend/backend.log | grep WorkerService
```

---

### STEP 10: BESU TRANSACTION

**Action:**
1. Verify transaction on Besu
2. Check transaction receipt

**Expected Result:**
```bash
cd contracts
node -e "
const { createPublicClient, http } = require('viem');
const client = createPublicClient({ transport: http('http://localhost:8545') });
async function main() {
  const tx = await client.getTransaction({ hash: '0xf9300537c50e6ebd95f93900bb39446b41fd975eec5cc8dc576583ee241d710a' });
  console.log('Transaction:', tx.hash);
  console.log('Block:', tx.blockNumber);
  console.log('From:', tx.from);
  console.log('To:', tx.to);
}
main().catch(console.error);
"
```

Output:
```
Transaction: 0xf9300537c50e6ebd95f93900bb39446b41fd975eec5cc8dc576583ee241d710a
Block: 1819
From: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
To: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

### STEP 11: BLOCKCHAIN RECEIPT

**Action:**
1. Get transaction receipt
2. Verify receipt status
3. Decode events

**Expected Result:**
```bash
cd contracts
node -e "
const { createPublicClient, http, decodeEventLog } = require('viem');
const client = createPublicClient({ transport: http('http://localhost:8545') });
const abi = require('./artifacts/contracts/KavachTrustSBT.sol/KavachTrustSBT.json').abi;
async function main() {
  const receipt = await client.getTransactionReceipt({ hash: '0xf9300537c50e6ebd95f93900bb39446b41fd975eec5cc8dc576583ee241d710a' });
  console.log('Status:', receipt.status);
  console.log('Gas used:', receipt.gasUsed);
  console.log('Block:', receipt.blockNumber);
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({ abi, data: log.data, topics: log.topics });
      console.log('Event:', decoded.eventName);
      console.log('Args:', decoded.args);
    } catch (e) {}
  }
}
main().catch(console.error);
"
```

Output:
```
Status: success
Gas used: 211056
Block: 1819
Event: Transfer
Event: Locked
Event: CertificationMinted
```

---

### STEP 12: VERIFICATION CENTER

**Action:**
1. Navigate to Verification Center
2. Enter asset ID: `EF-2026-00421`
3. Click "Verify"

**Expected Result:**
All checks pass:
- Identity & Supplier: VERIFIED
- Evidence Integrity: VERIFIED
- Lifecycle Sequence: VERIFIED
- Certification: VERIFIED
- Blockchain Proof: VERIFIED
- Audit Trail Integrity: REVIEW

**Verification:**
```bash
curl http://localhost:8000/api/v1/assets/EF-2026-00421/verify \
  -H "Authorization: Bearer <token>"
```

---

### STEP 13: AUDIT TRAIL

**Action:**
1. View audit events for asset
2. Verify hash chain integrity

**Expected Result:**
- Audit events displayed
- Each event has `payloadHash` and `previousHash`
- Hash chain proves chronological integrity

**Verification:**
```bash
curl http://localhost:8000/api/v1/audit?resourceId=EF-2026-00421 \
  -H "Authorization: Bearer <token>"
```

---

## Current-Contract Golden Flow (CERT-2026-17387)

For demonstrating the CURRENT deployed contract:

### Asset
- Asset ID: `EF-2026-00422`
- Certification: `CERT-2026-17387`

### Blockchain Transaction
- Transaction Hash: `0xa2a337ada9b94e510b2881f21db0cb0ccc817e009479babc70f328cf7c610d55`
- Block: 8102
- Contract: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- Token ID: 2

### Verification Steps
1. Navigate to Verification Center
2. Enter: `EF-2026-00422`
3. Verify all checks pass
4. Click on certification to view blockchain transaction
5. Verify transaction exists on Besu

---

## Demo Script Summary

**Total Steps:** 13
**Estimated Time:** 5-7 minutes
**Key Artifacts:**
- Asset: EF-2026-00421 (historical) or EF-2026-00422 (current contract)
- Certification: CERT-2026-00089 (historical) or CERT-2026-17387 (current contract)
- Transaction: On-chain verified transaction
- Evidence: SHA-256 verified files

**Demonstration Highlights:**
1. Real blockchain transaction (not mocked)
2. SHA-256 cryptographic integrity (not IPFS)
3. Deterministic audit trail (hash-chained)
4. Role-based access control
5. End-to-end traceability

---

## Troubleshooting Demo Flow

### Certification Not Minting
- Check worker is running: `curl http://localhost:8000/api/v1/health/worker`
- Check Besu is accessible: `curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`
- Check contract address in `.env`

### Evidence Not Loading
- Check MinIO is running: Access `http://localhost:9001`
- Check bucket exists: `kavachtrust-evidence`
- Check evidence API: `curl http://localhost:8000/api/v1/evidence`

### Verification Failing
- Check blockchain RPC connectivity
- Check transaction exists on-chain
- Check contract ABI matches deployed contract

---

**Golden Demo Flow Version:** 1.0
**Last Updated:** 2026-09-29
**Maintainer:** KavachTrust Team
