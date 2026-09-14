"""KavachTrust — Evidence API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.models.evidence import Evidence
from app.models.asset import Asset

router = APIRouter()


@router.get("")
def list_evidence(
    user: CurrentUser,
    db: Session = Depends(get_db),
    asset_id: str = Query(default=""),
    status_filter: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List evidence records with optional filters."""
    query = db.query(Evidence)

    if asset_id:
        # Look up by display ID
        asset = db.query(Asset).filter(Asset.asset_id == asset_id).first()
        if asset:
            query = query.filter(Evidence.asset_id == asset.id)
        else:
            query = query.filter(Evidence.asset_id == asset_id)

    if status_filter:
        query = query.filter(Evidence.status == status_filter)

    total = query.count()
    offset = (page - 1) * page_size
    records = query.order_by(Evidence.created_at.desc()).offset(offset).limit(page_size).all()

    items = []
    for e in records:
        asset = db.query(Asset).filter(Asset.id == e.asset_id).first()
        items.append({
            "id": e.id,
            "evidence_id": e.evidence_id,
            "asset_id": asset.asset_id if asset else e.asset_id,
            "filename": e.original_filename,
            "type": e.type,
            "mime_type": e.mime_type,
            "size_kb": round(e.size_bytes / 1024, 1),
            "status": e.status,
            "hash": e.sha256_hash,
            "event": e.event_type,
            "integrity_verified": e.integrity_verified,
            "blockchain_tx": e.blockchain_tx_hash,
            "created_at": e.created_at.isoformat(),
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": (offset + page_size) < total,
    }
