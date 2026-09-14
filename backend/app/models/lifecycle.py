"""KavachTrust — Lifecycle event model."""

from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.user import _uuid, _utcnow
from app.core.database import Base


class LifecycleEvent(Base):
    __tablename__ = "lifecycle_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), nullable=False, index=True)
    from_state: Mapped[str] = mapped_column(String(30), nullable=False)
    to_state: Mapped[str] = mapped_column(String(30), nullable=False)
    actor_id: Mapped[str] = mapped_column(String(36), ForeignKey("actors.id"), nullable=False)
    audit_event_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("audit_events.id"), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)

    # Relationships
    asset: Mapped["app.models.asset.Asset"] = relationship("Asset", back_populates="lifecycle_events")
    actor: Mapped["app.models.user.Actor"] = relationship("Actor", foreign_keys=[actor_id])
