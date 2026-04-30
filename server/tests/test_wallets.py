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

def test_wallets_get_empty(client):
    token = get_auth_token(client, "w1@example.com", "W1 User")
    resp = client.get("/api/wallets", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert "wallets" in data
    assert isinstance(data["wallets"], list)
    assert len(data["wallets"]) == 0

def test_wallets_create(client):
    token = get_auth_token(client, "w2@example.com", "W2 User")
    payload = {"name": "My New Wallet", "type": "personal"}
    resp = client.post("/api/wallets", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    data = resp.get_json()
    assert "wallet" in data
    assert data["wallet"]["name"] == "My New Wallet"
    assert data["wallet"]["type"] == "personal"

def test_wallets_get_one(client):
    token = get_auth_token(client, "w3@example.com", "W3 User")
    # Create wallet
    resp_create = client.post("/api/wallets", json={"name": "Test get", "type": "group"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]
    
    # Get it
    resp_get = client.get(f"/api/wallets/{wallet_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp_get.status_code == 200
    assert resp_get.get_json()["wallet"]["name"] == "Test get"

def test_wallets_update(client):
    token = get_auth_token(client, "w4@example.com", "W4 User")
    # Create wallet
    resp_create = client.post("/api/wallets", json={"name": "Before Update", "type": "personal"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]
    
    # Update it
    resp_update = client.patch(f"/api/wallets/{wallet_id}", json={"name": "After Update", "type": "group"}, headers={"Authorization": f"Bearer {token}"})
    assert resp_update.status_code == 200
    updated_wallet = resp_update.get_json()["wallet"]
    assert updated_wallet["name"] == "After Update"
    assert updated_wallet["type"] == "group"

def test_wallets_delete(client):
    token = get_auth_token(client, "w5@example.com", "W5 User")
    # Create wallet
    resp_create = client.post("/api/wallets", json={"name": "To Delete"}, headers={"Authorization": f"Bearer {token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]
    
    # Delete it
    resp_del = client.delete(f"/api/wallets/{wallet_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp_del.status_code == 200
    
    # Get it again to ensure 404
    resp_get = client.get(f"/api/wallets/{wallet_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp_get.status_code == 404

def test_wallets_members(client):
    owner_token = get_auth_token(client, "w6_owner@example.com", "w6 Owner")
    member_email = "w6_member@example.com"
    # we need the member user to exist in the db so we can invite them
    get_auth_token(client, member_email, "W6 Member")
    
    # Create group wallet
    resp_create = client.post("/api/wallets", json={"name": "Group Wal", "type": "group"}, headers={"Authorization": f"Bearer {owner_token}"})
    wallet_id = resp_create.get_json()["wallet"]["id"]
    
    # Send invite
    resp_invite = client.post(f"/api/wallets/{wallet_id}/members", json={"email": member_email}, headers={"Authorization": f"Bearer {owner_token}"})
    assert resp_invite.status_code == 201
    
    # Get members list (currently just the owner + no one because it's only pending invite)
    resp_members = client.get(f"/api/wallets/{wallet_id}/members", headers={"Authorization": f"Bearer {owner_token}"})
    assert resp_members.status_code == 200
    members = resp_members.get_json()["members"]
    assert len(members) == 1
    assert members[0]["role"] == "owner"


def test_wallets_invitation_accept_flow(client):
    owner_token = get_auth_token(client, "w7_owner@example.com", "W7 Owner")
    member_token = get_auth_token(client, "w7_member@example.com", "W7 Member")

    resp_create = client.post(
        "/api/wallets",
        json={"name": "W7 Group", "type": "group"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp_invite = client.post(
        f"/api/wallets/{wallet_id}/members",
        json={"email": "w7_member@example.com"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp_invite.status_code == 201
    invitation_id = resp_invite.get_json()["invitation"]["id"]

    resp_list = client.get(
        "/api/wallets/invitations",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert resp_list.status_code == 200
    invitations = resp_list.get_json()["invitations"]
    assert len(invitations) == 1

    resp_accept = client.post(
        f"/api/wallets/invitations/{invitation_id}/accept",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert resp_accept.status_code == 200

    resp_wallet = client.get(
        f"/api/wallets/{wallet_id}",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert resp_wallet.status_code == 200


def test_wallets_invitation_decline_flow(client):
    owner_token = get_auth_token(client, "w8_owner@example.com", "W8 Owner")
    member_token = get_auth_token(client, "w8_member@example.com", "W8 Member")

    resp_create = client.post(
        "/api/wallets",
        json={"name": "W8 Group", "type": "group"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp_invite = client.post(
        f"/api/wallets/{wallet_id}/members",
        json={"email": "w8_member@example.com"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    invitation_id = resp_invite.get_json()["invitation"]["id"]

    resp_decline = client.post(
        f"/api/wallets/invitations/{invitation_id}/decline",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert resp_decline.status_code == 200

    resp_list = client.get(
        "/api/wallets/invitations?status=declined",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert resp_list.status_code == 200
    invitations = resp_list.get_json()["invitations"]
    assert len(invitations) == 1


def test_wallets_invitation_invalid_status_filter(client):
    token = get_auth_token(client, "w9@example.com", "W9 User")
    resp = client.get(
        "/api/wallets/invitations?status=unknown",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


def test_wallets_add_member_errors(client):
    owner_token = get_auth_token(client, "w10_owner@example.com", "W10 Owner")
    get_auth_token(client, "w10_member@example.com", "W10 Member")

    resp_create = client.post(
        "/api/wallets",
        json={"name": "W10 Personal", "type": "personal"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp_personal = client.post(
        f"/api/wallets/{wallet_id}/members",
        json={"email": "w10_member@example.com"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp_personal.status_code == 400

    resp_missing = client.post(
        f"/api/wallets/{wallet_id}/members",
        json={},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp_missing.status_code == 400

    resp_not_found = client.post(
        f"/api/wallets/{wallet_id}/members",
        json={"email": "missing@example.com"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp_not_found.status_code == 400


def test_wallets_remove_member_self_and_owner_block(client):
    owner_token = get_auth_token(client, "w11_owner@example.com", "W11 Owner")
    member_token = get_auth_token(client, "w11_member@example.com", "W11 Member")

    resp_create = client.post(
        "/api/wallets",
        json={"name": "W11 Group", "type": "group"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp_invite = client.post(
        f"/api/wallets/{wallet_id}/members",
        json={"email": "w11_member@example.com"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    invitation_id = resp_invite.get_json()["invitation"]["id"]

    client.post(
        f"/api/wallets/invitations/{invitation_id}/accept",
        headers={"Authorization": f"Bearer {member_token}"},
    )

    resp_remove_missing = client.delete(
        f"/api/wallets/{wallet_id}/members/does-not-exist",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert resp_remove_missing.status_code == 403

    member_id = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {member_token}"},
    ).get_json()["user"]["id"]

    resp_remove_self = client.delete(
        f"/api/wallets/{wallet_id}/members/{member_id}",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert resp_remove_self.status_code == 200

    owner_id = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {owner_token}"},
    ).get_json()["user"]["id"]

    resp_owner_leave = client.delete(
        f"/api/wallets/{wallet_id}/members/{owner_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp_owner_leave.status_code == 400
