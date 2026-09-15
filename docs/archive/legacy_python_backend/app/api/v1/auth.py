"""KavachTrust — Authentication API endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.core.dependencies import CurrentUser
from app.models.user import User, Actor, Role, UserRole

router = APIRouter()


# ── Schemas ──
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ActorResponse(BaseModel):
    id: str
    did: str
    credential_status: str
    identity_status: str
    wallet_address: str | None

    model_config = {"from_attributes": True}


class UserMeResponse(BaseModel):
    id: str
    email: str
    name: str
    status: str
    roles: list[str]
    actor: ActorResponse | None

    model_config = {"from_attributes": True}


# ── Endpoints ──
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password. Returns a JWT access token."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status.lower()}",
        )

    # Check credential status
    actor = db.query(Actor).filter(Actor.user_id == user.id).first()
    if actor and actor.credential_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Credential is {actor.credential_status.lower()}",
        )

    token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMeResponse)
def get_me(user: CurrentUser, db: Session = Depends(get_db)):
    """Get the current authenticated user profile."""
    # Fetch roles
    role_names = (
        db.query(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user.id)
        .all()
    )
    roles = [r[0] for r in role_names]

    # Fetch actor
    actor = db.query(Actor).filter(Actor.user_id == user.id).first()
    actor_resp = None
    if actor:
        actor_resp = ActorResponse(
            id=actor.id,
            did=actor.did,
            credential_status=actor.credential_status,
            identity_status=actor.identity_status,
            wallet_address=actor.wallet_address,
        )

    return UserMeResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        status=user.status,
        roles=roles,
        actor=actor_resp,
    )


@router.post("/logout")
def logout():
    """Logout — client should discard the token."""
    return {"message": "Logged out. Discard the access token."}
