"""KavachTrust — Users API endpoints."""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import CurrentUser, require_role
from app.models.user import User, Actor, Role, UserRole

router = APIRouter()


@router.get("")
def list_users(
    user: CurrentUser,
    db: Session = Depends(get_db),
    search: str = Query(default=""),
    role_filter: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    _admin=Depends(require_role("ADMIN")),
):
    """List all users. Admin only."""
    query = db.query(User)

    if search:
        term = f"%{search}%"
        query = query.filter((User.name.ilike(term)) | (User.email.ilike(term)))

    if role_filter:
        role = db.query(Role).filter(Role.name == role_filter).first()
        if role:
            user_ids = db.query(UserRole.user_id).filter(UserRole.role_id == role.id).subquery()
            query = query.filter(User.id.in_(user_ids))

    total = query.count()
    offset = (page - 1) * page_size
    users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()

    items = []
    for u in users:
        actor = db.query(Actor).filter(Actor.user_id == u.id).first()
        roles = (
            db.query(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .filter(UserRole.user_id == u.id)
            .all()
        )
        items.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "status": u.status,
            "roles": [r[0] for r in roles],
            "did": actor.did if actor else None,
            "identity_status": actor.identity_status if actor else None,
            "last_active": u.updated_at.isoformat(),
            "created_at": u.created_at.isoformat(),
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": (offset + page_size) < total,
    }
