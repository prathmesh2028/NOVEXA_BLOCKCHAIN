from fastapi.testclient import TestClient

def test_list_assets_unauthorized(client: TestClient):
    r = client.get("/api/v1/assets")
    assert r.status_code == 401

def test_list_assets_success(client: TestClient, auth_headers: dict):
    r = client.get("/api/v1/assets", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
