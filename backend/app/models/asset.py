"""KavachTrust — Asset and Batch models."""

from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.user import _uuid, _utcnow
from app.core.database import Base


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    batch_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="batch")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    asset_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    batch_id: Mapped[str] = mapped_column(String(36), ForeignKey("batches.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    lifecycle_state: Mapped[str] = mapped_column(
        String(30), nullable=False, default="UNREGISTERED", index=True
    )
    verification_status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")
    evidence_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    evidence_status: Mapped[str] = mapped_column(String(20), nullable=False, default="Processing")
    cert_status: Mapped[str] = mapped_column(String(20), nullable=False, default="NOT_CERTIFIED")
    cert_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    supplier: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    registered_by_actor_id: Mapped[str] = mapped_column(String(36), ForeignKey("actors.id"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # Optimistic locking
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    # Relationships
    batch: Mapped["Batch"] = relationship("Batch", back_populates="assets")
    registered_by: Mapped["app.models.user.Actor"] = relationship("Actor", foreign_keys=[registered_by_actor_id])
    evidence_records: Mapped[list["app.models.evidence.Evidence"]] = relationship("Evidence", back_populates="asset")
    lifecycle_events: Mapped[list["app.models.lifecycle.LifecycleEvent"]] = relationship("LifecycleEvent", back_populates="asset")
