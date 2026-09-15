"""KavachTrust — Certification and NFT record models."""

from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.user import _uuid, _utcnow
from app.core.database import Base


class Certification(Base):
    __tablename__ = "certifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    cert_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), nullable=False, index=True)
    batch_id: Mapped[str] = mapped_column(String(36), ForeignKey("batches.id"), nullable=False)
    token_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    contract_address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    network: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tx_hash: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    block_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", index=True)  # CONFIRMED, PENDING, FAILED, REVOKED
    issued_by_actor_id: Mapped[str] = mapped_column(String(36), ForeignKey("actors.id"), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmations: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
