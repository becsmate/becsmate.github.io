import importlib
import os

import pytest

from extensions import db


@pytest.fixture()
def app(tmp_path, monkeypatch):
    upload_dir = tmp_path / "uploads"
    db_url = os.getenv("TEST_DATABASE_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("Set TEST_DATABASE_URL (preferred) or DATABASE_URL for tests.")

    monkeypatch.setenv("DATABASE_URL", db_url)
    monkeypatch.setenv("SECRET_KEY", "test-secret")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-jwt-secret")
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost")
    monkeypatch.setenv("UPLOAD_FOLDER", str(upload_dir))

    import app as app_module

    importlib.reload(app_module)
    test_app = app_module.create_app()
    test_app.config.update(TESTING=True)

    with test_app.app_context():
        db.drop_all()
        db.create_all()

    yield test_app

    with test_app.app_context():
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()
