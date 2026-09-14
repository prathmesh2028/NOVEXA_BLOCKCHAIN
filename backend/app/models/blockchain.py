"""KavachTrust — Blockchain transaction and verification models."""

from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.user import _uuid, _utcnow
from app.core.database import Base


class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tx_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    network: Mapped[str] = mapped_column(String(100), nullable=False)
    block_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    asset_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("assets.id"), nullable=True)
    cert_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("certifications.id"), nullable=True)
    confirmations: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    gas_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    from_address: Mapped[str] = mapped_column(String(255), nullable=False)
    contract_address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    token_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class BlockchainVerification(Base):
    __tablename__ = "blockchain_verifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tx_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # VALID, INVALID, MISMATCH, UNVERIFIED
    chain_confirmed: Mapped[str] = mapped_column(String(20), nullable=False, default="UNKNOWN")
    block_number_verified: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    details: Mapped[str | None] = mapped_column(String(500), nullable=True)
    verified_by_actor_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("actors.id"), nullable=True)
