from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User

profile_bp = Blueprint('profile', __name__, url_prefix='/api/users')

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}


def _allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@profile_bp.route('/profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    conn_str = current_app.config.get('AZURE_STORAGE_CONNECTION_STRING')
    if not conn_str:
        return jsonify({'error': 'Profile picture storage not configured'}), 503

    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename or not _allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png'}), 400

    try:
        from azure.storage import AzureStorageService
        storage = AzureStorageService(conn_str)
        image_url = storage.upload_profile_image(file.stream, user_id)
    except Exception as e:
        return jsonify({'error': 'Upload failed', 'detail': str(e)}), 500

    user.profile_image_url = image_url
    db.session.commit()
    return jsonify({'image_url': image_url})


@profile_bp.route('/profile-picture/url', methods=['GET'])
@jwt_required()
def get_profile_picture_url():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user or not user.profile_image_url:
        return jsonify({'image_url': None})
    return jsonify({'image_url': user.profile_image_url})