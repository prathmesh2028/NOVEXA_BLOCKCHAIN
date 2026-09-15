"""KavachTrust — Blockchain API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.models.blockchain import BlockchainTransaction

router = APIRouter()


@router.get("/transactions")
def list_blockchain_transactions(
    user: CurrentUser,
    db: Session = Depends(get_db),
    status_filter: str = Query(default=""),
    network: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List blockchain transactions."""
    query = db.query(BlockchainTransaction)

    if status_filter:
        query = query.filter(BlockchainTransaction.status == status_filter)
    if network:
        query = query.filter(BlockchainTransaction.network == network)

    total = query.count()
    offset = (page - 1) * page_size
    txs = query.order_by(BlockchainTransaction.timestamp.desc()).offset(offset).limit(page_size).all()

    items = []
    for t in txs:
        items.append({
            "id": t.id,
            "tx_hash": t.tx_hash,
            "network": t.network,
            "block_number": t.block_number,
            "status": t.status,
            "action": t.action,
            "confirmations": t.confirmations,
            "gas_used": t.gas_used,
            "from_address": t.from_address,
            "contract_address": t.contract_address,
            "token_id": t.token_id,
            "timestamp": t.timestamp.isoformat(),
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": (offset + page_size) < total,
    }
