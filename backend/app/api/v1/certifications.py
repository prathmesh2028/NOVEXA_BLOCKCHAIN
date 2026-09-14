"""KavachTrust — Certifications API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.models.certification import Certification
from app.models.asset import Asset, Batch
from app.models.user import Actor

router = APIRouter()


@router.get("")
def list_certifications(
    user: CurrentUser,
    db: Session = Depends(get_db),
    status_filter: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List certifications with optional status filter."""
    query = db.query(Certification)

    if status_filter:
        query = query.filter(Certification.status == status_filter)

    total = query.count()
    offset = (page - 1) * page_size
    certs = query.order_by(Certification.issued_at.desc()).offset(offset).limit(page_size).all()

    items = []
    for c in certs:
        asset = db.query(Asset).filter(Asset.id == c.asset_id).first()
        batch = db.query(Batch).filter(Batch.id == c.batch_id).first()
        actor = db.query(Actor).filter(Actor.id == c.issued_by_actor_id).first()
        items.append({
            "id": c.id,
            "cert_id": c.cert_id,
            "asset_id": asset.asset_id if asset else c.asset_id,
            "batch_id": batch.batch_id if batch else c.batch_id,
            "token_id": c.token_id,
            "contract_address": c.contract_address,
            "network": c.network,
            "tx_hash": c.tx_hash,
            "block_number": c.block_number,
            "status": c.status,
            "issued_by": actor.did if actor else None,
            "issued_at": c.issued_at.isoformat(),
            "confirmed_at": c.confirmed_at.isoformat() if c.confirmed_at else None,
            "confirmations": c.confirmations,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": (offset + page_size) < total,
    }
