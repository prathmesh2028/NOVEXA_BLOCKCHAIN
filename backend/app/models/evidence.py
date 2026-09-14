"""KavachTrust — Evidence model with versioning support."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.user import _uuid, _utcnow
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.user import Actor


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    evidence_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)  # Internal storage name
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)  # User-facing name
    type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "Inspection Report"
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Processing")
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Lifecycle event this evidence relates to
    uploaded_by_actor_id: Mapped[str] = mapped_column(String(36), ForeignKey("actors.id"), nullable=False)
    integrity_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    blockchain_tx_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="evidence_records")
    uploaded_by: Mapped["Actor"] = relationship("Actor", foreign_keys=[uploaded_by_actor_id])
    versions: Mapped[list["EvidenceVersion"]] = relationship("EvidenceVersion", back_populates="evidence")


class EvidenceVersion(Base):
    __tablename__ = "evidence_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    evidence_id: Mapped[str] = mapped_column(String(36), ForeignKey("evidence.id"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    uploaded_by_actor_id: Mapped[str] = mapped_column(String(36), ForeignKey("actors.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    evidence: Mapped["Evidence"] = relationship("Evidence", back_populates="versions")
