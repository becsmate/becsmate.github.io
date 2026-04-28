def test_auth_register_login_refresh_me(client):
    register_payload = {
        "email": "user@example.com",
        "name": "Test User",
        "password": "secret123",
    }
    register_resp = client.post("/api/auth/register", json=register_payload)
    assert register_resp.status_code == 201
    register_data = register_resp.get_json()
    assert "access_token" in register_data
    assert "refresh_token" in register_data

    login_resp = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "secret123"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.get_json()
    assert "access_token" in login_data
    assert "refresh_token" in login_data

    refresh_resp = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {login_data['refresh_token']}"},
    )
    assert refresh_resp.status_code == 200
    refresh_data = refresh_resp.get_json()
    assert "access_token" in refresh_data

    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_data['access_token']}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.get_json()
    assert me_data["user"]["email"] == "user@example.com"
