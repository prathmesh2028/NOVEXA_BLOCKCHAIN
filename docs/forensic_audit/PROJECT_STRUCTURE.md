# Project Structure

## File Tree Analysis

### Frontend
- `/frontend/f1/`: **ACTIVE**. Imported by `main.tsx`. Contains the actual React app.
- `/frontend/f2/`: **DUPLICATE / DEAD CODE**. Not imported.
- `/frontend/f3/`: **DUPLICATE / DEAD CODE**. Not imported.

### Backend
- `/backend/src/`: Contains core, identity, trust, asset-management modules.
- **Missing**: `/backend/src/supply-chain/` does not exist.

### Contracts
- `/contracts/`: Contains Hardhat configuration and `KavachTrustSBT.sol`.

## Conclusion
The repository suffers from massive frontend duplication. Part A and Part B code are mixed in the backend `src/` directory.
