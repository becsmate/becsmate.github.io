from pathlib import Path

import routes.spa as spa


def setup_build_dir(tmp_path, monkeypatch):
    build_dir = tmp_path / "build"
    build_dir.mkdir()
    (build_dir / "index.html").write_text("<html>index</html>")
    (build_dir / "app.js").write_text("console.log('hi')")
    monkeypatch.setattr(spa, "BUILD_DIR", str(build_dir))
    return build_dir


def test_spa_serves_existing_asset(client, tmp_path, monkeypatch):
    setup_build_dir(tmp_path, monkeypatch)
    resp = client.get("/app.js")
    assert resp.status_code == 200
    assert b"console.log('hi')" in resp.data


def test_spa_fallback_to_index(client, tmp_path, monkeypatch):
    setup_build_dir(tmp_path, monkeypatch)
    resp = client.get("/some/route")
    assert resp.status_code == 200
    assert b"<html>index</html>" in resp.data


def test_spa_api_prefix_returns_404(client, tmp_path, monkeypatch):
    setup_build_dir(tmp_path, monkeypatch)
    resp = client.get("/api/does-not-exist")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Not found"
