from fastapi.testclient import TestClient

def test_login_success(client: TestClient, db_session):
    login_data = {
        "email": "test@bel.co.in",
        "password": "admin123",
    }
    r = client.post("/api/v1/auth/login", json=login_data)
    assert r.status_code == 200
    tokens = r.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"

def test_login_wrong_password(client: TestClient, db_session):
    login_data = {
        "email": "test@bel.co.in",
        "password": "wrongpassword",
    }
    r = client.post("/api/v1/auth/login", json=login_data)
    assert r.status_code == 401
    assert "detail" in r.json()

def test_login_nonexistent_user(client: TestClient, db_session):
    login_data = {
        "email": "nobody@bel.co.in",
        "password": "admin123",
    }
    r = client.post("/api/v1/auth/login", json=login_data)
    assert r.status_code == 401
    
def test_get_current_user_me(client: TestClient, auth_headers: dict):
    r = client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "test@bel.co.in"
    assert data["status"] == "ACTIVE"
