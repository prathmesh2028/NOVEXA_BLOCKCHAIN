"""KavachTrust — Audit event model with hash-chain support."""

from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.user import _uuid, _utcnow
from app.core.database import Base


class AuditEvent(Base):
    """Append-oriented audit log. Records are never deleted.

    Supports optional hash-chaining: each event stores a hash of its
    payload and a reference to the previous event hash, making tampering
    detectable if the audit log is retained.
    """
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    actor_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("actors.id"), nullable=True)
    actor_did: Mapped[str | None] = mapped_column(String(255), nullable=True)
    actor_role: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # asset, evidence, certification, user
    resource_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    result: Mapped[str] = mapped_column(String(20), nullable=False, default="SUCCESS")  # SUCCESS, WARNING, FAILED
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    blockchain_tx_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payload_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    previous_event_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
