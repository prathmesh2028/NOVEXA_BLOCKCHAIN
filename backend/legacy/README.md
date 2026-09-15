# KavachTrust Backend API (Legacy)

> **⚠️ DEPRECATED**: This is the legacy Python/FastAPI backend implementation preserved for reference. The current production backend is the NestJS implementation in the parent directory.

FastAPI backend for the BEL Defence Asset Trust prototype.

## Requirements
- Python 3.12+
- Node.js & pnpm (for Smart Contract compilation)

## Setup

1. **Virtual Environment**
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. **Database**
   The backend uses SQLite (`dev.db`). To seed the database with mock cryptographic records:
   ```bash
   python scripts/seed_data.py
   ```

3. **Smart Contracts (Blockchain)**
   Initialize the synthetic local blockchain (Hardhat):
   ```bash
   cd ../../contracts
   pnpm install
   npx hardhat compile
   # Run node in a separate terminal:
   npx hardhat node
   ```

4. **Run Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Testing
Integration tests use `pytest` and an in-memory SQLite database (`sqlite:///:memory:`).
```bash
pytest tests/ -v
```

## API Documentation
Once the server is running, interactive API documentation is available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
