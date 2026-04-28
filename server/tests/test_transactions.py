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


def test_transactions_create_missing_fields(client):
    token = get_auth_token(client, "t5@example.com", "T5 User")
    resp_create = client.post(
        "/api/wallets",
        json={"name": "Wallet 5", "type": "personal"},
        headers={"Authorization": f"Bearer {token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp = client.post(
        f"/api/wallets/{wallet_id}/transactions",
        json={"amount": 10, "category": "Food"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Amount, category and date are required"


def test_transactions_wallet_not_found(client):
    token = get_auth_token(client, "t6@example.com", "T6 User")
    resp_get = client.get(
        "/api/wallets/does-not-exist/transactions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_get.status_code == 404

    resp_post = client.post(
        "/api/wallets/does-not-exist/transactions",
        json={"amount": 10, "category": "Food", "date": "2023-01-01T12:00:00"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_post.status_code == 404


def test_transactions_filters(client):
    token = get_auth_token(client, "t7@example.com", "T7 User")
    resp_create = client.post(
        "/api/wallets",
        json={"name": "Wallet 7", "type": "personal"},
        headers={"Authorization": f"Bearer {token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    client.post(
        f"/api/wallets/{wallet_id}/transactions",
        json={"amount": 10, "category": "Food", "date": "2023-01-01T12:00:00"},
        headers={"Authorization": f"Bearer {token}"},
    )
    client.post(
        f"/api/wallets/{wallet_id}/transactions",
        json={"amount": 30, "category": "Travel", "date": "2023-02-01T12:00:00"},
        headers={"Authorization": f"Bearer {token}"},
    )

    resp_filter = client.get(
        f"/api/wallets/{wallet_id}/transactions?category=Food&min_amount=5&max_amount=20",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_filter.status_code == 200
    txs = resp_filter.get_json()["transactions"]
    assert len(txs) == 1
    assert txs[0]["category"] == "Food"


def test_transactions_update_forbidden(client):
    owner_token = get_auth_token(client, "t8_owner@example.com", "T8 Owner")
    other_token = get_auth_token(client, "t8_other@example.com", "T8 Other")
    resp_create = client.post(
        "/api/wallets",
        json={"name": "Wallet 8", "type": "personal"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp_tx = client.post(
        f"/api/wallets/{wallet_id}/transactions",
        json={"amount": 20, "category": "Food", "date": "2023-01-01T12:00:00"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    tx_id = resp_tx.get_json()["transaction"]["id"]

    resp_patch = client.patch(
        f"/api/wallets/{wallet_id}/transactions/{tx_id}",
        json={"amount": 25},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp_patch.status_code == 404


def test_transactions_delete_forbidden(client):
    owner_token = get_auth_token(client, "t9_owner@example.com", "T9 Owner")
    other_token = get_auth_token(client, "t9_other@example.com", "T9 Other")
    resp_create = client.post(
        "/api/wallets",
        json={"name": "Wallet 9", "type": "personal"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp_tx = client.post(
        f"/api/wallets/{wallet_id}/transactions",
        json={"amount": 20, "category": "Food", "date": "2023-01-01T12:00:00"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    tx_id = resp_tx.get_json()["transaction"]["id"]

    resp_del = client.delete(
        f"/api/wallets/{wallet_id}/transactions/{tx_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp_del.status_code == 404
