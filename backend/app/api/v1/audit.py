"""KavachTrust — Audit API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.models.audit import AuditEvent

router = APIRouter()


@router.get("/events")
def list_audit_events(
    user: CurrentUser,
    db: Session = Depends(get_db),
    resource_id: str = Query(default=""),
    event_type: str = Query(default=""),
    actor_role: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List audit events with optional filters."""
    query = db.query(AuditEvent)

    if resource_id:
        query = query.filter(AuditEvent.resource_id == resource_id)
    if event_type:
        query = query.filter(AuditEvent.event_type == event_type)
    if actor_role:
        query = query.filter(AuditEvent.actor_role == actor_role)

    total = query.count()
    offset = (page - 1) * page_size
    events = query.order_by(AuditEvent.timestamp.desc()).offset(offset).limit(page_size).all()

    items = []
    for e in events:
        items.append({
            "id": e.id,
            "event_type": e.event_type,
            "actor_did": e.actor_did,
            "actor_role": e.actor_role,
            "action": e.action,
            "resource_type": e.resource_type,
            "resource_id": e.resource_id,
            "timestamp": e.timestamp.isoformat(),
            "result": e.result,
            "details": e.details,
            "blockchain_tx_hash": e.blockchain_tx_hash,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": (offset + page_size) < total,
    }
