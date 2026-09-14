"""KavachTrust Backend — FastAPI Application Entry Point."""

import uuid
import time
import structlog

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine
from app.api.v1 import auth as auth_router
from app.api.v1 import assets as assets_router
from app.api.v1 import users as users_router
from app.api.v1 import dashboard as dashboard_router
from app.api.v1 import audit as audit_router
from app.api.v1 import evidence as evidence_router
from app.api.v1 import certifications as certifications_router
from app.api.v1 import blockchain as blockchain_router
from app.api.v1 import search as search_router

# Ensure all models are registered
import app.models  # noqa: F401

settings = get_settings()

logger = structlog.get_logger()

app = FastAPI(
    title="KavachTrust API",
    description="BEL Defence Asset Trust — Secure Platform API",
    version="1.0.0",
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request ID + Logging Middleware ──
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start = time.time()

    response: Response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 2)

    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=duration_ms,
        request_id=request_id,
    )

    response.headers["X-Request-ID"] = request_id
    return response


# ── Routes ──
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(dashboard_router.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(assets_router.router, prefix="/api/v1/assets", tags=["Assets"])
app.include_router(evidence_router.router, prefix="/api/v1/evidence", tags=["Evidence"])
app.include_router(certifications_router.router, prefix="/api/v1/certifications", tags=["Certifications"])
app.include_router(blockchain_router.router, prefix="/api/v1/blockchain", tags=["Blockchain"])
app.include_router(audit_router.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(users_router.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(search_router.router, prefix="/api/v1/search", tags=["Search"])


# ── Health / Readiness ──
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": "kavachtrust-api"}


@app.get("/readiness", tags=["System"])
def readiness():
    """Check if database is reachable."""
    from sqlalchemy import text
    from app.core.database import SessionLocal

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "not_ready", "database": str(e)}


# ── Create tables for development (use Alembic in production) ──
@app.on_event("startup")
def on_startup():
    if settings.is_development:
        Base.metadata.create_all(bind=engine)
        logger.info("dev_startup", msg="Tables created via create_all (dev only)")
