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

from pydantic import BaseModel
import datetime
from app.services.blockchain import blockchain_service

class CertificationCreate(BaseModel):
    asset_id: str
    evidence_hash: str

@router.post("")
def create_certification(
    data: CertificationCreate,
    user: CurrentUser,
    db: Session = Depends(get_db)
):
    """Mint a new certification on the blockchain."""
    # Verify the asset
    asset = db.query(Asset).filter(Asset.asset_id == data.asset_id).first()
    if not asset:
        return {"error": "Asset not found"}
        
    batch = db.query(Batch).filter(Batch.id == asset.batch_id).first()
    batch_id_str = batch.batch_id if batch else "UNKNOWN"

    try:
        # 1. Call blockchain service to mint SBT
        # user.actor.did should ideally be used for `to_did`, 
        # but our service handles the mapping internally.
        tx_data = blockchain_service.mint_certification(
            to_did=user.actor.did if hasattr(user, "actor") else "did:mock",
            asset_id=asset.asset_id,
            batch_id=batch_id_str,
            evidence_hash=data.evidence_hash
        )
        
        # 2. Save record to DB
        cert = Certification(
            cert_id=f"CERT-{datetime.datetime.now().year}-{tx_data['token_id']:05d}",
            asset_id=asset.id,
            batch_id=batch.id if batch else asset.id, # Mocking batch id requirement
            token_id=str(tx_data['token_id']),
            contract_address="0xMockAddress", # Will be fetched dynamically normally
            network="BEL-TRUST-CHAIN",
            tx_hash=tx_data['tx_hash'],
            block_number=tx_data['block_number'],
            status="ACTIVE",
            issued_by_actor_id=user.actor.id if hasattr(user, "actor") else user.id,
            issued_at=datetime.datetime.utcnow(),
            confirmed_at=datetime.datetime.utcnow(),
            confirmations=1
        )
        db.add(cert)
        db.commit()
        db.refresh(cert)
        
        return {
            "success": True,
            "certification": {
                "id": cert.id,
                "cert_id": cert.cert_id,
                "tx_hash": cert.tx_hash,
                "token_id": cert.token_id
            }
        }
    except Exception as e:
        return {"error": str(e)}
