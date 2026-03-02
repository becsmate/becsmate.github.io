import os
from flask import Blueprint, send_from_directory, jsonify, current_app

spa_bp = Blueprint('spa', __name__)

BUILD_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'client', 'build')


@spa_bp.route('/', defaults={'path': ''})
@spa_bp.route('/<path:path>')
def serve_spa(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    if path and os.path.exists(os.path.join(BUILD_DIR, path)):
        return send_from_directory(BUILD_DIR, path)
    return send_from_directory(BUILD_DIR, 'index.html')


@spa_bp.app_errorhandler(404)
def not_found(e):
    if current_app.debug:
        return jsonify({'error': 'Not found'}), 404
    return send_from_directory(BUILD_DIR, 'index.html')