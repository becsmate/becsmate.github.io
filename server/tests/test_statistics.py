import pytest

def get_auth_token(client, email, name, password="password123"):
    client.post("/api/auth/register", json={
        "email": email,
        "name": name,
        "password": password,
    })
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    return login_resp.get_json()["access_token"]

def test_statistics_summary_empty(client):
    token = get_auth_token(client, "s1@example.com", "S1 User")
    
    resp_create = client.post("/api/wallets", json={"name": "Wallet S1", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]
    
    resp_summ = client.get(f"/api/statistics/{wallet_id}/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp_summ.status_code == 200
    data = resp_summ.get_json()
    assert data["total"] == 0.0
    assert data["income"] == 0.0
    assert data["expenses"] == 0.0
    assert data["transaction_count"] == 0

def test_statistics_summary_with_tx(client):
    token = get_auth_token(client, "s2@example.com", "S2 User")
    
    resp_create = client.post("/api/wallets", json={"name": "Wallet S2", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]

    # income
    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": 100, "category": "Salary", "date": "2023-01-01T00:00:00"}, headers={"Authorization": f"Bearer {token}"})
    # expense
    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": -40, "category": "Food", "date": "2023-01-02T00:00:00"}, headers={"Authorization": f"Bearer {token}"})
    # expense
    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": -10.5, "category": "Transport", "date": "2023-01-03T00:00:00"}, headers={"Authorization": f"Bearer {token}"})
    
    resp_summ = client.get(f"/api/statistics/{wallet_id}/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp_summ.status_code == 200
    data = resp_summ.get_json()
    assert data["total"] == 49.5
    assert data["income"] == 100.0
    assert data["expenses"] == -50.5
    assert data["transaction_count"] == 3

def test_statistics_monthly(client):
    token = get_auth_token(client, "s3@example.com", "S3 User")
    resp_create = client.post("/api/wallets", json={"name": "Wallet S3", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]

    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": 100, "category": "Salary", "date": "2023-01-01T12:00:00"}, headers={"Authorization": f"Bearer {token}"})
    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": -20, "category": "Food", "date": "2023-01-02T12:00:00"}, headers={"Authorization": f"Bearer {token}"})
    
    resp_monthly = client.get(f"/api/statistics/{wallet_id}/monthly", headers={"Authorization": f"Bearer {token}"})
    assert resp_monthly.status_code == 200
    monthly = resp_monthly.get_json()["monthly"]
    assert len(monthly) == 1
    assert monthly[0]["month"] == "2023-01"
    assert monthly[0]["income"] == 100.0
    assert monthly[0]["expenses"] == -20.0

def test_statistics_categories(client):
    token = get_auth_token(client, "s4@example.com", "S4 User")
    resp_create = client.post("/api/wallets", json={"name": "Wallet S4", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]

    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": -20, "category": "Food", "date": "2023-01-01T12:00:00"}, headers={"Authorization": f"Bearer {token}"})
    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": -10, "category": "Food", "date": "2023-01-02T12:00:00"}, headers={"Authorization": f"Bearer {token}"})
    
    resp_cat = client.get(f"/api/statistics/{wallet_id}/categories", headers={"Authorization": f"Bearer {token}"})
    assert resp_cat.status_code == 200
    cats = resp_cat.get_json()["categories"]
    assert len(cats) == 1
    assert cats[0]["category"] == "Food"
    assert cats[0]["total"] == -30.0

def test_statistics_user_summary(client):
    token = get_auth_token(client, "s5@example.com", "S5 User")
    resp_create = client.post("/api/wallets", json={"name": "Wallet S5", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]

    client.post(f"/api/wallets/{wallet_id}/transactions", json={"amount": 100, "category": "Salary", "date": "2023-01-01T12:00:00"}, headers={"Authorization": f"Bearer {token}"})
    
    resp_summ = client.get(f"/api/statistics/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp_summ.status_code == 200
    assert resp_summ.get_json()["total"] == 100.0
