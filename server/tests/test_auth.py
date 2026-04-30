def test_auth_register(client):
    register_payload = {
        "email": "user_reg@example.com",
        "name": "Test User Reg",
        "password": "secret123",
    }
    register_resp = client.post("/api/auth/register", json=register_payload)
    assert register_resp.status_code == 201
    register_data = register_resp.get_json()
    assert "access_token" in register_data
    assert "refresh_token" in register_data

def test_auth_register_no_data(client):
    register_payload = {}
    register_resp = client.post("/api/auth/register", json=register_payload)
    assert register_resp.status_code == 400
    register_data = register_resp.get_json()
    assert "error" in register_data
    assert register_data["error"] == 'No data provided'

def test_auth_register_no_email(client):
    register_payload = {
        "name": "Test User Reg",
        "password": "secret123",
    }
    register_resp = client.post("/api/auth/register", json=register_payload)
    assert register_resp.status_code == 400
    register_data = register_resp.get_json()
    assert "error" in register_data
    assert register_data["error"] == 'Email, name and password are required'

def test_auth_register_password_length(client):
    register_payload = {
        "email": "user_reg@example.com",
        "name": "Test User Reg",
        "password": "12345",
    }
    register_resp = client.post("/api/auth/register", json=register_payload)
    assert register_resp.status_code == 400
    register_data = register_resp.get_json()
    assert "error" in register_data
    assert register_data["error"] == 'Password must be at least 6 characters'

def test_auth_register_duplicate_email(client):
    register_payload = {
        "email": "user_reg@example.com",
        "name": "Test User Reg",
        "password": "secret123",
    }
    # First registration should succeed
    register_resp1 = client.post("/api/auth/register", json=register_payload)
    assert register_resp1.status_code == 201

    # Second registration with same email should fail
    register_resp2 = client.post("/api/auth/register", json=register_payload)
    assert register_resp2.status_code == 409
    register_data = register_resp2.get_json()
    assert "error" in register_data
    assert register_data["error"] == 'Email already registered'


def test_auth_login(client):
    # Setup: Register first
    client.post("/api/auth/register", json={
        "email": "user_log@example.com",
        "name": "Test User Log",
        "password": "secret123",
    })

    login_resp = client.post(
        "/api/auth/login",
        json={"email": "user_log@example.com", "password": "secret123"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.get_json()
    assert "access_token" in login_data
    assert "refresh_token" in login_data

def test_auth_login_no_data(client):
    login_payload = {}
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 400
    login_data = login_resp.get_json()
    assert "error" in login_data
    assert login_data["error"] == 'No data provided'

def test_auth_login_invalid_credentials(client):
    # Setup: Register first
    client.post("/api/auth/register", json={
        "email": "user_log@example.com",
        "name": "Test User Log",
        "password": "secret123",
    })
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "user_log@example.com", "password": "wrongpassword"},
    )
    assert login_resp.status_code == 401
    login_data = login_resp.get_json()
    assert "error" in login_data
    assert login_data["error"] == 'Invalid email or password'

def test_auth_refresh(client):
    # Setup: Register and Login
    client.post("/api/auth/register", json={
        "email": "user_ref@example.com",
        "name": "Test User Ref",
        "password": "secret123",
    })
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "user_ref@example.com", "password": "secret123"},
    )
    login_data = login_resp.get_json()

    refresh_resp = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {login_data['refresh_token']}"},
    )
    assert refresh_resp.status_code == 200
    refresh_data = refresh_resp.get_json()
    assert "access_token" in refresh_data


def test_auth_me(client):
    # Setup: Register and Login
    client.post("/api/auth/register", json={
        "email": "user_me@example.com",
        "name": "Test User Me",
        "password": "secret123",
    })
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "user_me@example.com", "password": "secret123"},
    )
    login_data = login_resp.get_json()

    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_data['access_token']}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.get_json()
    assert me_data["user"]["email"] == "user_me@example.com"
