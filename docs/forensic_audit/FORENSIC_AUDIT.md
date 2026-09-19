# Complete Whole-Project Forensic Audit

## Overview
This audit was conducted by inspecting the source code directly. No assumptions were made. The results represent the absolute current state of the repository.

## Top Discoveries
1. **Frontend Duplication**: There are three identical frontend directories (`f1`, `f2`, `f3`). Only `f1` is active and wired.
2. **Supply Chain**: Completely missing. Only a `Batch` model exists.
3. **Blockchain**: No Besu/QBFT node is configured or running. Only Hardhat local network is configured, and a simulation fallback is used in demo mode.
4. **Demo Mode**: `APP_ENV=demo` bypasses database persistence, cryptographic challenge generation, and blockchain transaction submission.
5. **Storage**: MinIO has a local disk fallback that actually works if MinIO is unreachable.
