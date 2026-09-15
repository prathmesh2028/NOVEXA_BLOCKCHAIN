import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app as main_app
from app.core.database import Base, get_db
from app.models.user import User, Actor

# Use a test file so multiple connections see the same tables
TEST_DB = "./test_db.sqlite"
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import app.models # Ensure all models are registered
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

main_app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(main_app) as c:
        yield c

@pytest.fixture(scope="module")
def db_session() -> Generator:
    db = TestingSessionLocal()
    
    # Create test user
    from app.core.security import hash_password
    test_user = User(
        id="USR-TEST-001",
        email="test@bel.co.in",
        hashed_password=hash_password("admin123"),
        name="Test User",
        status="ACTIVE"
    )
    db.add(test_user)
    db.commit()

    test_actor = Actor(
        id="ACT-TEST-001",
        user_id=test_user.id,
        did="did:bel:actor:test",
        credential_status="ACTIVE",
        wallet_address="0x123",
        identity_status="VERIFIED"
    )
    db.add(test_actor)
    db.commit()
    
    yield db
    
    # Teardown
    db.query(User).delete()
    db.query(Actor).delete()
    db.commit()
    db.close()

@pytest.fixture(scope="module")
def auth_headers(client: TestClient, db_session) -> dict[str, str]:
    login_data = {
        "email": "test@bel.co.in",
        "password": "admin123",
    }
    r = client.post("/api/v1/auth/login", json=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
