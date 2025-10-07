"""SPA and static file handling."""
from flask import send_from_directory, jsonify, request
from pathlib import Path

def register_spa_routes(app):
    """Register routes for serving the React SPA and static files."""
    
    @app.route("/")
    def spa_index():
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/<path:filename>")
    def spa_static_or_fallback(filename):
        # Serve existing built asset
        static_folder = Path(app.static_folder)
        file_path = static_folder / filename
        
        if file_path.exists() and file_path.is_file():
            return send_from_directory(app.static_folder, filename)

        # Not an API path -> let React Router handle
        if not filename.startswith("api/"):
            return send_from_directory(app.static_folder, "index.html")

        # API 404
        return jsonify(error="API endpoint not found"), 404

    @app.errorhandler(404)
    def not_found(_):
        if request.path.startswith("/api/"):
            return jsonify(error="API endpoint not found"), 404
        return send_from_directory(app.static_folder, "index.html")