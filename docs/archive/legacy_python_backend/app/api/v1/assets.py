"""KavachTrust — Assets API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.models.asset import Asset, Batch

router = APIRouter()


class AssetResponse(BaseModel):
    id: str
    asset_id: str
    batch_id: str
    type: str
    model: str
    serial_number: str
    lifecycle_state: str
    verification_status: str
    evidence_count: int
    evidence_status: str
    cert_status: str
    cert_id: str | None
    supplier: str
    description: str | None
    registered_by_name: str | None = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class AssetListResponse(BaseModel):
    items: list[AssetResponse]
    total: int
    page: int
    page_size: int
    has_next: bool


@router.get("", response_model=AssetListResponse)
def list_assets(
    user: CurrentUser,
    db: Session = Depends(get_db),
    search: str = Query(default="", description="Search by asset ID, batch ID, or type"),
    lifecycle: str = Query(default="", description="Filter by lifecycle state"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List assets with filtering and pagination."""
    query = db.query(Asset)

    if search:
        term = f"%{search}%"
        query = query.filter(
            (Asset.asset_id.ilike(term))
            | (Asset.type.ilike(term))
        )
        # Also search by batch display ID
        batch_ids = db.query(Batch.id).filter(Batch.batch_id.ilike(term)).subquery()
        query = query.union(db.query(Asset).filter(Asset.batch_id.in_(batch_ids)))

    if lifecycle:
        query = query.filter(Asset.lifecycle_state == lifecycle)

    total = query.count()
    offset = (page - 1) * page_size
    assets = query.order_by(Asset.updated_at.desc()).offset(offset).limit(page_size).all()

    items = []
    for a in assets:
        batch = db.query(Batch).filter(Batch.id == a.batch_id).first()
        items.append(AssetResponse(
            id=a.id,
            asset_id=a.asset_id,
            batch_id=batch.batch_id if batch else a.batch_id,
            type=a.type,
            model=a.model,
            serial_number=a.serial_number,
            lifecycle_state=a.lifecycle_state,
            verification_status=a.verification_status,
            evidence_count=a.evidence_count,
            evidence_status=a.evidence_status,
            cert_status=a.cert_status,
            cert_id=a.cert_id,
            supplier=a.supplier,
            description=a.description,
            created_at=a.created_at.isoformat(),
            updated_at=a.updated_at.isoformat(),
        ))

    return AssetListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=(offset + page_size) < total,
    )


@router.get("/{asset_id}")
def get_asset(asset_id: str, user: CurrentUser, db: Session = Depends(get_db)):
    """Get a single asset by its display ID (e.g. EF-2026-00421)."""
    asset = db.query(Asset).filter(
        (Asset.asset_id == asset_id) | (Asset.id == asset_id)
    ).first()

    if not asset:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    batch = db.query(Batch).filter(Batch.id == asset.batch_id).first()

    return {
        "id": asset.id,
        "asset_id": asset.asset_id,
        "batch_id": batch.batch_id if batch else asset.batch_id,
        "type": asset.type,
        "model": asset.model,
        "serial_number": asset.serial_number,
        "lifecycle_state": asset.lifecycle_state,
        "verification_status": asset.verification_status,
        "evidence_count": asset.evidence_count,
        "evidence_status": asset.evidence_status,
        "cert_status": asset.cert_status,
        "cert_id": asset.cert_id,
        "supplier": asset.supplier,
        "description": asset.description,
        "created_at": asset.created_at.isoformat(),
        "updated_at": asset.updated_at.isoformat(),
    }
