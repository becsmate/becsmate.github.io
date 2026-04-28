import sys
from io import BytesIO
import types


def get_auth_token(client, email, name, password="password123"):
    client.post(
        "/api/auth/register",
        json={"email": email, "name": name, "password": password},
    )
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    return login_resp.get_json()["access_token"]


def mock_storage_service(monkeypatch, url="https://example.com/profile.jpg"):
    class FakeStorage:
        def __init__(self, conn_str):
            self.conn_str = conn_str

        def upload_profile_image(self, stream, user_id):
            return url

    module = types.SimpleNamespace(AzureStorageService=FakeStorage)
    monkeypatch.setitem(sys.modules, "azure_services.storage", module)


def test_profile_picture_no_config(client, monkeypatch):
    token = get_auth_token(client, "pp1@example.com", "PP One")
    monkeypatch.delenv("AZURE_STORAGE_CONNECTION_STRING", raising=False)
    client.application.config["AZURE_STORAGE_CONNECTION_STRING"] = None
    resp = client.post(
        "/api/users/profile-picture",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 503
    assert resp.get_json()["error"] == "Profile picture storage not configured"


def test_profile_picture_no_file(client):
    token = get_auth_token(client, "pp2@example.com", "PP Two")
    client.application.config["AZURE_STORAGE_CONNECTION_STRING"] = "fake"
    resp = client.post(
        "/api/users/profile-picture",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "No file provided"


def test_profile_picture_invalid_file(client):
    token = get_auth_token(client, "pp3@example.com", "PP Three")
    client.application.config["AZURE_STORAGE_CONNECTION_STRING"] = "fake"
    data = {"file": (BytesIO(b"fake"), "photo.gif")}
    resp = client.post(
        "/api/users/profile-picture",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Invalid file type. Allowed: jpg, jpeg, png"


def test_profile_picture_success_and_get_url(client, monkeypatch):
    token = get_auth_token(client, "pp4@example.com", "PP Four")
    client.application.config["AZURE_STORAGE_CONNECTION_STRING"] = "fake"
    mock_storage_service(monkeypatch)

    data = {"file": (BytesIO(b"fake"), "photo.jpg")}
    resp = client.post(
        "/api/users/profile-picture",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.get_json()["image_url"] == "https://example.com/profile.jpg"

    get_resp = client.get(
        "/api/users/profile-picture/url",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.get_json()["image_url"] == "https://example.com/profile.jpg"


def test_profile_picture_get_url_empty(client):
    token = get_auth_token(client, "pp5@example.com", "PP Five")
    get_resp = client.get(
        "/api/users/profile-picture/url",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.get_json()["image_url"] is None
