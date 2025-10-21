# routes/profile_images.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from ..azure.storage import AzureStorageService
from ..models import User
from ..extensions import db

profile_bp = Blueprint('profile', __name__)
storage_service = AzureStorageService()

# Allowed extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/api/users/profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_image():
    try:
        uid = get_jwt_identity()
        user = User.query.get(uid)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if 'profile_image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        file = request.files['profile_image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Check file size
            file.seek(0, os.SEEK_END)
            file_length = file.tell()
            file.seek(0)
            
            if file_length > MAX_FILE_SIZE:
                return jsonify({
                    'success': False, 
                    'error': f'File too large. Maximum size is {MAX_FILE_SIZE // 1024 // 1024}MB'
                }), 400
            
            # Delete old profile image if exists
            if user.profile_image_blob:
                storage_service.delete_profile_image(user.profile_image_blob)
            
            # Upload new image - returns blob name
            blob_name = storage_service.upload_profile_image(file, uid)
            
            if blob_name:
                # Update user record with blob name
                user.profile_image_blob = blob_name
                db.session.commit()
                
                # Generate SAS URL for response
                image_url = storage_service.generate_sas_url(blob_name)
                
                return jsonify({
                    'success': True,
                    'profile_image_url': image_url,
                    'message': 'Profile image updated successfully'
                })
            else:
                return jsonify({'success': False, 'error': 'Failed to upload image'}), 500
        
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/api/users/profile-picture/url', methods=['GET'])
def get_profile_image_url():
    """Get a fresh SAS URL for user's profile image"""
    try:
        uid = get_jwt_identity()
        user = User.query.get(uid)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if not user.profile_image_blob:
            return jsonify({'success': False, 'error': 'No profile image'}), 404
        
        # Generate new SAS URL (refreshes expiration)
        image_url = storage_service.generate_sas_url(user.profile_image_blob)
        
        return jsonify({
            'success': True,
            'profile_image_url': image_url,
            'expires_in_hours': 24
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500