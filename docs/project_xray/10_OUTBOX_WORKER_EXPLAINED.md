# 10. Transactional Outbox & Polling Worker Explained

## 1. Why Do We Need the Outbox Pattern?

### The Dual-Write Problem
Suppose an officer issues a certification for a missile component. The system must do two things:
1. Save the certification record in PostgreSQL (`status: 'CONFIRMED'`).
2. Submit a transaction to the Hyperledger Besu blockchain (`mintCertification(...)`).

If the backend writes to PostgreSQL and then makes an HTTP RPC call to Besu:
- If the blockchain node is down, the database says the asset is certified, but the blockchain has no record.
- If the backend calls the blockchain first, and the database crashes before committing, an NFT was minted but the database has no record.

PostgreSQL and the blockchain node do not share a two-phase commit (2PC) transaction coordinator.

### The Solution: Transactional Outbox
Instead of talking to the blockchain directly inside the API request:
1. In a **single atomic PostgreSQL transaction**, the backend creates the `Certification` record (status `PENDING`) AND inserts a row into the `OutboxEvent` table (status `PENDING`).
2. The HTTP API returns `201 Created` immediately.
3. A resilient background `WorkerService` independently polls the `OutboxEvent` table, claims events, submits them to the blockchain, monitors receipt confirmation, and updates both records upon success.

---

## 2. Dispatch Workflow Diagram

```
POST /api/v1/certifications
           │
           ▼
[SINGLE PRISMA DB TRANSACTION]
   ├── 1. INSERT INTO certifications (status: 'PENDING')
   └── 2. INSERT INTO outbox_events  (eventType: 'PASSPORT_MINT_REQUESTED', status: 'PENDING')
           │
           ▼ (Committed to PostgreSQL)
    API Returns 201
           │
           ▼
[WORKER POLLING LOOP (Every 5 seconds)]
   ├── 1. Claim pending events via row-level locking:
   │      UPDATE outbox_events SET status = 'CLAIMED', claimed_by = worker_id
   │      WHERE status IN ('PENDING', 'FAILED') AND claimed_by IS NULL
   │
   ├── 2. Process Mint Request:
   │      - Reads certification, asset, and latest SHA-256 evidence hash
   │      - Acquires logical idempotency lock:
   │        INSERT INTO blockchain_transactions (idempotencyKey: 'MINT:<certId>', status: 'PENDING')
   │      - Calls BlockchainAdapter.submitTransaction() via viem
   │
   ├── 3. Receipt Polling:
   │      - Calls BlockchainAdapter.getTransactionReceipt(txHash)
   │      - If receipt is not yet mined: defers event for next cycle (PENDING_RECEIPT)
   │      - If receipt reverted: marks tx and cert as FAILED
   │      - If confirmed: decodes CertificationMinted event log to extract tokenId
   │
   └── 4. Final Atomic Update:
          - Marks blockchain_transaction as 'CONFIRMED'
          - Marks certification as 'CONFIRMED' with tokenId & txHash
          - Marks outbox_event as 'COMPLETED'
```

---

## 3. Failure Mode Analysis

| Failure Scenario | What Happens in the System | Outcome / Recovery |
| :--- | :--- | :--- |
| **PostgreSQL Down** | API request fails immediately; Outbox event is not created. | Clean error returned to user; no inconsistent state. |
| **Blockchain Offline** | Worker catches submission failure; updates `blockchainTransaction` to `FAILED` with error message. Outbox event attemptCount increments. | Worker will retry up to `maxAttempts: 5` with exponential backoff. |
| **Worker Crashes Mid-flight** | Event remains in status `CLAIMED` with `claimedAt` timestamp. | On restart or after timeout, unclaimed / failed events are re-evaluated. |
| **Two Workers Run Concurrently** | `OutboxService.claimPendingEvents` uses atomic `updateMany` with `claimedBy: null` condition. | Only one worker successfully claims a given row; no duplicate claims. |
| **Idempotency Lock** | `worker.service.ts` creates a unique constraint on `idempotencyKey: 'MINT:<certId>'`. | If a retry executes after a transaction was already submitted, Prisma throws P2002 and worker safely aborts. |

**SEMANTICS VERDICT**: The system provides genuine **at-least-once dispatch** with **idempotent receiver processing**, preventing duplicate NFT mints on the blockchain.