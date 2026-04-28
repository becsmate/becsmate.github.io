import pytest
from datetime import datetime

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

def test_transactions_get_empty(client):
    token = get_auth_token(client, "t1@example.com", "T1 User")
    
    resp_create = client.post("/api/wallets", json={"name": "Wallet 1", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]
    
    resp = client.get(f"/api/wallets/{wallet_id}/transactions", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert "transactions" in data
    assert isinstance(data["transactions"], list)
    assert len(data["transactions"]) == 0

def test_transactions_create_and_get(client):
    token = get_auth_token(client, "t2@example.com", "T2 User")
    
    resp_create = client.post("/api/wallets", json={"name": "Wallet 2", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]

    payload = {
        "amount": 100.5,
        "category": "Food",
        "date": "2023-01-01T12:00:00",
        "currency": "USD",
        "description": "Lunch"
    }

    resp = client.post(f"/api/wallets/{wallet_id}/transactions", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    data = resp.get_json()
    assert "transaction" in data
    assert data["transaction"]["amount"] == 100.5
    assert data["transaction"]["category"] == "Food"

    # get again
    resp_get = client.get(f"/api/wallets/{wallet_id}/transactions", headers={"Authorization": f"Bearer {token}"})
    assert resp_get.status_code == 200
    txs = resp_get.get_json()["transactions"]
    assert len(txs) == 1
    assert txs[0]["category"] == "Food"

def test_transactions_update(client):
    token = get_auth_token(client, "t3@example.com", "T3 User")
    
    resp_create = client.post("/api/wallets", json={"name": "Wallet 3", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]

    payload = {
        "amount": 50,
        "category": "Transport",
        "date": "2023-01-01T12:00:00"
    }
    resp_tx = client.post(f"/api/wallets/{wallet_id}/transactions", json=payload, headers={"Authorization": f"Bearer {token}"})
    tx_id = resp_tx.get_json()["transaction"]["id"]
    
    update_payload = {"amount": 75}
    resp_patch = client.patch(f"/api/wallets/{wallet_id}/transactions/{tx_id}", json=update_payload, headers={"Authorization": f"Bearer {token}"})
    assert resp_patch.status_code == 200
    assert resp_patch.get_json()["transaction"]["amount"] == 75.0

def test_transactions_delete(client):
    token = get_auth_token(client, "t4@example.com", "T4 User")
    
    resp_create = client.post("/api/wallets", json={"name": "Wallet 4", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]

    payload = {
        "amount": 50,
        "category": "Transport",
        "date": "2023-01-01T12:00:00"
    }
    resp_tx = client.post(f"/api/wallets/{wallet_id}/transactions", json=payload, headers={"Authorization": f"Bearer {token}"})
    tx_id = resp_tx.get_json()["transaction"]["id"]
    
    resp_del = client.delete(f"/api/wallets/{wallet_id}/transactions/{tx_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp_del.status_code == 200
    
    resp_get = client.get(f"/api/wallets/{wallet_id}/transactions", headers={"Authorization": f"Bearer {token}"})
    assert len(resp_get.get_json()["transactions"]) == 0
