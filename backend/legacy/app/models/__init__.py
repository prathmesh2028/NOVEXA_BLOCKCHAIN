"""KavachTrust — Model registry. Import all models here so SQLAlchemy discovers them."""

from app.models.user import User, Actor, Role, UserRole  # noqa: F401
from app.models.asset import Asset, Batch  # noqa: F401
from app.models.evidence import Evidence, EvidenceVersion  # noqa: F401
from app.models.lifecycle import LifecycleEvent  # noqa: F401
from app.models.certification import Certification  # noqa: F401
from app.models.blockchain import BlockchainTransaction, BlockchainVerification  # noqa: F401
from app.models.audit import AuditEvent  # noqa: F401
