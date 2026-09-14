"""KavachTrust — Seed database with initial mock data from frontend prototype."""

import asyncio
import os
import sys

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, Actor, Role, UserRole
from app.models.asset import Asset, Batch
from app.models.evidence import Evidence
from app.models.certification import Certification
from app.models.blockchain import BlockchainTransaction
from app.models.audit import AuditEvent
from datetime import datetime, timezone, timedelta

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_roles(db: Session):
    print("Seeding roles...")
    roles = [
        {"name": "ADMIN", "desc": "Administrator"},
        {"name": "NFT_CREATOR", "desc": "NFT Creator"},
        {"name": "TECHNICIAN", "desc": "Technician"},
        {"name": "AUDITOR", "desc": "Auditor"},
    ]
    for r in roles:
        role = db.query(Role).filter(Role.name == r["name"]).first()
        if not role:
            role = Role(name=r["name"], description=r["desc"])
            db.add(role)
    db.commit()

def seed_users(db: Session):
    print("Seeding users...")
    users = [
        {
            "id": "u1",
            "name": "Arjun Patel",
            "email": "admin@kavachtrust.bel.in",
            "role": "ADMIN",
            "did": "did:ethr:sepolia:0x1234abcd...",
            "wallet": "0x1234abcd00000000000000000000000000000001",
        },
        {
            "id": "u2",
            "name": "Priya Sharma",
            "email": "nft@kavachtrust.bel.in",
            "role": "NFT_CREATOR",
            "did": "did:ethr:sepolia:0x5678efgh...",
            "wallet": "0x5678efgh00000000000000000000000000000002",
        },
        {
            "id": "u3",
            "name": "Rahul Desai",
            "email": "tech@kavachtrust.bel.in",
            "role": "TECHNICIAN",
            "did": "did:ethr:sepolia:0x9012ijkl...",
            "wallet": "0x9012ijkl00000000000000000000000000000003",
        },
        {
            "id": "u4",
            "name": "Vikram Singh",
            "email": "audit@dod.gov.in",
            "role": "AUDITOR",
            "did": "did:ethr:sepolia:0x3456mnop...",
            "wallet": "0x3456mnop00000000000000000000000000000004",
        },
    ]

    for u in users:
        # Create User
        user = db.query(User).filter(User.email == u["email"]).first()
        if not user:
            user = User(
                id=u["id"],
                email=u["email"],
                name=u["name"],
                hashed_password=hash_password("password"), # Default password
                status="ACTIVE"
            )
            db.add(user)
            db.commit()
            
            # Create Actor
            actor = Actor(
                id=f"a_{u['id']}",
                user_id=user.id,
                did=u["did"],
                wallet_address=u["wallet"]
            )
            db.add(actor)
            
            # Assign Role
            role = db.query(Role).filter(Role.name == u["role"]).first()
            user_role = UserRole(user_id=user.id, role_id=role.id)
            db.add(user_role)
            db.commit()

def seed_assets(db: Session):
    print("Seeding batches and assets...")
    # Batches
    b1 = Batch(id="b1", batch_id="BEL-B-2026-0042")
    b2 = Batch(id="b2", batch_id="BEL-B-2026-0089")
    b3 = Batch(id="b3", batch_id="BEL-B-2026-0012")
    for b in [b1, b2, b3]:
        if not db.query(Batch).filter(Batch.id == b.id).first():
            db.add(b)
    db.commit()

    # Assets (matching mockData)
    assets = [
        {
            "id": "ast1",
            "asset_id": "EF-2026-00421",
            "batch_id": "b1",
            "type": "Radar Subsystem",
            "model": "Mk-II AESA Module",
            "serial_number": "SN-9982-A",
            "lifecycle_state": "ACCEPTED_FOR_ASSEMBLY",
            "verification_status": "VERIFIED",
            "evidence_count": 3,
            "evidence_status": "Complete",
            "cert_status": "CONFIRMED",
            "cert_id": "cert1",
            "supplier": "Alpha Defense Corp",
            "registered_by_actor_id": "a_u3",
        },
        {
            "id": "ast2",
            "asset_id": "EF-2026-00422",
            "batch_id": "b1",
            "type": "Navigation Control Unit",
            "model": "NavCore-X",
            "serial_number": "SN-1029-B",
            "lifecycle_state": "INSPECTION_RECORDED",
            "verification_status": "PENDING",
            "evidence_count": 1,
            "evidence_status": "Processing",
            "cert_status": "PENDING",
            "cert_id": None,
            "supplier": "Beta Electronics",
            "registered_by_actor_id": "a_u3",
        },
        {
            "id": "ast3",
            "asset_id": "EF-2026-00423",
            "batch_id": "b2",
            "type": "Thermal Imaging Sensor",
            "model": "TIS-4000",
            "serial_number": "SN-4451-C",
            "lifecycle_state": "SUPPLIER_DECLARED",
            "verification_status": "UNAVAILABLE",
            "evidence_count": 0,
            "evidence_status": "Processing",
            "cert_status": "NOT_CERTIFIED",
            "cert_id": None,
            "supplier": "Gamma Optronics",
            "registered_by_actor_id": "a_u3",
        },
        {
            "id": "ast4",
            "asset_id": "EF-2026-00424",
            "batch_id": "b3",
            "type": "Power Distribution Module",
            "model": "PDM-V2",
            "serial_number": "SN-8876-D",
            "lifecycle_state": "REJECTED_QUARANTINED",
            "verification_status": "FAILED",
            "evidence_count": 2,
            "evidence_status": "Complete",
            "cert_status": "FAILED",
            "cert_id": None,
            "supplier": "Delta Power Systems",
            "registered_by_actor_id": "a_u3",
        },
        {
            "id": "ast5",
            "asset_id": "EF-2026-00425",
            "batch_id": "b1",
            "type": "Communication Array",
            "model": "CommLink-Secure",
            "serial_number": "SN-2234-E",
            "lifecycle_state": "ACCEPTED_FOR_ASSEMBLY",
            "verification_status": "VERIFIED",
            "evidence_count": 4,
            "evidence_status": "Complete",
            "cert_status": "CONFIRMED",
            "cert_id": "cert2",
            "supplier": "Alpha Defense Corp",
            "registered_by_actor_id": "a_u3",
        },
    ]

    for a in assets:
        if not db.query(Asset).filter(Asset.id == a["id"]).first():
            db.add(Asset(**a))
    db.commit()

def seed_evidence(db: Session):
    print("Seeding evidence...")
    evidences = [
        {
            "id": "ev1",
            "evidence_id": "EV-9982-1",
            "asset_id": "ast1",
            "filename": "supplier_manifest_9982.pdf",
            "original_filename": "supplier_manifest.pdf",
            "type": "Supplier Manifest",
            "mime_type": "application/pdf",
            "size_bytes": 2400 * 1024,
            "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "status": "Complete",
            "event_type": "SUPPLIER_DECLARED",
            "uploaded_by_actor_id": "a_u3",
            "integrity_verified": True,
            "blockchain_tx_hash": "0x4f3a...b2c1",
        },
        {
            "id": "ev2",
            "evidence_id": "EV-9982-2",
            "asset_id": "ast1",
            "filename": "inspection_report_mkII.pdf",
            "original_filename": "inspection_report.pdf",
            "type": "Inspection Report",
            "mime_type": "application/pdf",
            "size_bytes": 4100 * 1024,
            "sha256_hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
            "status": "Complete",
            "event_type": "INSPECTION_RECORDED",
            "uploaded_by_actor_id": "a_u3",
            "integrity_verified": True,
            "blockchain_tx_hash": "0x9a8b...7c6d",
        }
    ]
    for e in evidences:
        if not db.query(Evidence).filter(Evidence.id == e["id"]).first():
            db.add(Evidence(**e))
    db.commit()

def seed_certifications(db: Session):
    print("Seeding certifications...")
    certs = [
        {
            "id": "cert1",
            "cert_id": "CERT-8842-A",
            "asset_id": "ast1",
            "batch_id": "b1",
            "token_id": "8842",
            "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            "network": "Ethereum Sepolia",
            "tx_hash": "0xabc123...def456",
            "status": "CONFIRMED",
            "issued_by_actor_id": "a_u2",
        },
        {
            "id": "cert2",
            "cert_id": "CERT-2234-E",
            "asset_id": "ast5",
            "batch_id": "b1",
            "token_id": "2234",
            "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            "network": "Ethereum Sepolia",
            "tx_hash": "0xdef456...abc123",
            "status": "CONFIRMED",
            "issued_by_actor_id": "a_u2",
        }
    ]
    for c in certs:
        if not db.query(Certification).filter(Certification.id == c["id"]).first():
            db.add(Certification(**c))
    db.commit()

def run():
    db = next(get_db())
    try:
        # Create tables just in case
        Base.metadata.create_all(bind=engine)
        
        seed_roles(db)
        seed_users(db)
        seed_assets(db)
        seed_evidence(db)
        seed_certifications(db)
        
        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run()
