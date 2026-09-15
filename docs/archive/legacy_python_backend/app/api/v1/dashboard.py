"""KavachTrust — Dashboard API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.models.asset import Asset
from app.models.certification import Certification
from app.models.blockchain import BlockchainTransaction
from app.models.audit import AuditEvent
from app.models.user import User

router = APIRouter()


@router.get("/summary")
def dashboard_summary(user: CurrentUser, db: Session = Depends(get_db)):
    """Get dashboard summary metrics from the database — NOT hardcoded."""
    total_assets = db.query(func.count(Asset.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.status == "ACTIVE").scalar() or 0
    pending_users = db.query(func.count(User.id)).filter(User.status == "PENDING").scalar() or 0
    total_certifications = db.query(func.count(Certification.id)).scalar() or 0
    pending_certs = db.query(func.count(Certification.id)).filter(Certification.status == "PENDING").scalar() or 0
    confirmed_certs = db.query(func.count(Certification.id)).filter(Certification.status == "CONFIRMED").scalar() or 0
    total_blockchain_txs = db.query(func.count(BlockchainTransaction.id)).scalar() or 0
    total_audit_events = db.query(func.count(AuditEvent.id)).scalar() or 0

    # Lifecycle breakdown
    lifecycle_counts = {}
    for state in ["UNREGISTERED", "SUPPLIER_DECLARED", "RECEIVED", "INSPECTION_RECORDED", "ACCEPTED_FOR_ASSEMBLY", "REJECTED_QUARANTINED"]:
        lifecycle_counts[state] = db.query(func.count(Asset.id)).filter(Asset.lifecycle_state == state).scalar() or 0

    # Verification issues
    failed_verifications = db.query(func.count(Asset.id)).filter(Asset.verification_status == "FAILED").scalar() or 0

    return {
        "total_assets": total_assets,
        "active_users": active_users,
        "pending_users": pending_users,
        "total_certifications": total_certifications,
        "pending_certifications": pending_certs,
        "confirmed_certifications": confirmed_certs,
        "total_blockchain_txs": total_blockchain_txs,
        "total_audit_events": total_audit_events,
        "lifecycle_breakdown": lifecycle_counts,
        "failed_verifications": failed_verifications,
    }
