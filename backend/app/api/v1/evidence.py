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

from pydantic import BaseModel
import datetime
from app.services.blockchain import blockchain_service

class EvidenceCreate(BaseModel):
    asset_id: str
    filename: str
    type: str
    mime_type: str
    size_bytes: int
    sha256_hash: str
    event_type: str

@router.post("")
def create_evidence(
    data: EvidenceCreate,
    user: CurrentUser,
    db: Session = Depends(get_db)
):
    """Upload new evidence and anchor it on the blockchain."""
    asset = db.query(Asset).filter(Asset.asset_id == data.asset_id).first()
    if not asset:
        return {"error": "Asset not found"}
        
    try:
        # Anchor on blockchain
        tx_data = blockchain_service.anchor_evidence(
            asset_id=asset.asset_id,
            evidence_hash=data.sha256_hash
        )
        
        ev = Evidence(
            evidence_id=f"EV-{datetime.datetime.now().year}-{data.sha256_hash[:6].upper()}",
            asset_id=asset.id,
            original_filename=data.filename,
            type=data.type,
            mime_type=data.mime_type,
            size_bytes=data.size_bytes,
            sha256_hash=data.sha256_hash,
            storage_path=f"mock/path/{data.filename}",
            event_type=data.event_type,
            uploaded_by_actor_id=user.actor.id if hasattr(user, "actor") else user.id,
            status="VERIFIED",
            integrity_verified=True,
            blockchain_tx_hash=tx_data['tx_hash'],
            created_at=datetime.datetime.utcnow()
        )
        db.add(ev)
        db.commit()
        db.refresh(ev)
        
        return {
            "success": True,
            "evidence": {
                "id": ev.id,
                "evidence_id": ev.evidence_id,
                "tx_hash": ev.blockchain_tx_hash
            }
        }
    except Exception as e:
        return {"error": str(e)}
