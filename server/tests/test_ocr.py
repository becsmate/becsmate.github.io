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


def mock_smart_receipt_service(monkeypatch, result=None, error=None):
    class FakeService:
        def process(self, path):
            if error:
                raise error
            return result or {"ocr_text": "text", "parsed_data": {"total": 10}}

    module = types.SimpleNamespace(SmartReceiptService=FakeService)
    monkeypatch.setitem(sys.modules, "ocr.smart_receipt_service", module)


def test_ocr_process_no_file(client):
    token = get_auth_token(client, "ocr1@example.com", "OCR One")
    resp = client.post(
        "/api/ocr/process",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "No file provided"


def test_ocr_process_invalid_file_type(client):
    token = get_auth_token(client, "ocr2@example.com", "OCR Two")
    data = {"file": (BytesIO(b"fake"), "receipt.txt")}
    resp = client.post(
        "/api/ocr/process",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Invalid file type. Allowed: jpg, jpeg, png, pdf"


def test_ocr_process_success_and_jobs(client, monkeypatch):
    token = get_auth_token(client, "ocr3@example.com", "OCR Three")
    mock_smart_receipt_service(monkeypatch)

    data = {"file": (BytesIO(b"fake"), "receipt.jpg")}
    resp = client.post(
        "/api/ocr/process",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    job = resp.get_json()["job"]
    assert job["status"] == "completed"
    assert job["raw_text"] == "text"

    jobs_resp = client.get(
        "/api/ocr/jobs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert jobs_resp.status_code == 200
    jobs = jobs_resp.get_json()["jobs"]
    assert len(jobs) == 1

    job_id = job["id"]
    get_resp = client.get(
        f"/api/ocr/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200

    del_resp = client.delete(
        f"/api/ocr/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_resp.status_code == 200


def test_ocr_process_failure(client, monkeypatch):
    token = get_auth_token(client, "ocr4@example.com", "OCR Four")
    mock_smart_receipt_service(monkeypatch, error=Exception("boom"))

    data = {"file": (BytesIO(b"fake"), "receipt.png")}
    resp = client.post(
        "/api/ocr/process",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 500
    assert resp.get_json()["error"] == "OCR processing failed"


def test_ocr_confirm_receipt_errors(client):
    token = get_auth_token(client, "ocr5@example.com", "OCR Five")
    resp_no_data = client.post(
        "/api/ocr/confirm",
        json={},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_no_data.status_code == 400
    assert resp_no_data.get_json()["error"] == "No data provided"

    resp_missing = client.post(
        "/api/ocr/confirm",
        json={"wallet_id": "missing"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_missing.status_code == 400
    assert resp_missing.get_json()["error"] == "wallet_id, amount, category and date are required"

    resp_not_found = client.post(
        "/api/ocr/confirm",
        json={
            "wallet_id": "does-not-exist",
            "amount": 10,
            "category": "Food",
            "date": "2023-01-01T12:00:00",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_not_found.status_code == 404
    assert resp_not_found.get_json()["error"] == "Wallet not found"


def test_ocr_confirm_receipt_success(client):
    token = get_auth_token(client, "ocr6@example.com", "OCR Six")
    resp_create = client.post(
        "/api/wallets",
        json={"name": "OCR Wallet", "type": "personal"},
        headers={"Authorization": f"Bearer {token}"},
    )
    wallet_id = resp_create.get_json()["wallet"]["id"]

    resp = client.post(
        "/api/ocr/confirm",
        json={
            "wallet_id": wallet_id,
            "amount": 12.5,
            "category": "Food",
            "date": "2023-01-01T12:00:00",
            "merchant_name": "Store",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    tx = resp.get_json()["transaction"]
    assert tx["category"] == "Food"
    assert tx["amount"] == 12.5
    assert tx["description"] == "Store"
