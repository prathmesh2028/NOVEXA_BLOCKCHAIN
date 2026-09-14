"""KavachTrust — Search API endpoint."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.models.asset import Asset, Batch
from app.models.certification import Certification
from app.models.blockchain import BlockchainTransaction
from app.models.user import User, Actor

router = APIRouter()


@router.get("")
def global_search(
    user: CurrentUser,
    db: Session = Depends(get_db),
    q: str = Query(description="Search query"),
):
    """Global search across assets, batches, certifications, users, DIDs, and tx hashes."""
    results = []
    term = f"%{q}%"

    # Assets
    assets = db.query(Asset).filter(
        (Asset.asset_id.ilike(term))
        | (Asset.serial_number.ilike(term))
        | (Asset.type.ilike(term))
    ).limit(5).all()
    for a in assets:
        results.append({
            "type": "asset",
            "id": a.asset_id,
            "label": f"{a.type} — {a.asset_id}",
            "status": a.lifecycle_state,
            "match_reason": "Asset ID / Serial / Type",
        })

    # Batches
    batches = db.query(Batch).filter(Batch.batch_id.ilike(term)).limit(5).all()
    for b in batches:
        results.append({
            "type": "batch",
            "id": b.batch_id,
            "label": b.batch_id,
            "status": None,
            "match_reason": "Batch ID",
        })

    # Certifications
    certs = db.query(Certification).filter(
        (Certification.cert_id.ilike(term))
        | (Certification.token_id.ilike(term))
    ).limit(5).all()
    for c in certs:
        results.append({
            "type": "certification",
            "id": c.cert_id,
            "label": f"Certification {c.cert_id}",
            "status": c.status,
            "match_reason": "Cert ID / Token ID",
        })

    # Blockchain TX
    txs = db.query(BlockchainTransaction).filter(
        BlockchainTransaction.tx_hash.ilike(term)
    ).limit(5).all()
    for t in txs:
        results.append({
            "type": "blockchain",
            "id": t.tx_hash,
            "label": f"TX {t.tx_hash[:16]}...",
            "status": t.status,
            "match_reason": "Transaction Hash",
        })

    # Users/DIDs
    actors = db.query(Actor).filter(Actor.did.ilike(term)).limit(5).all()
    for a in actors:
        u = db.query(User).filter(User.id == a.user_id).first()
        results.append({
            "type": "identity",
            "id": a.did,
            "label": f"{u.name if u else 'Unknown'} — {a.did}",
            "status": a.credential_status,
            "match_reason": "DID",
        })

    return {"query": q, "results": results, "total": len(results)}
