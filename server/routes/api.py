"""API routes blueprint."""
from flask import Blueprint, jsonify, request
import os
import uuid
from ..ocr.smart_receipt_service import SmartReceiptService
from werkzeug.utils import secure_filename
from flask import current_app as app

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.get("/health")
def health_check():
    return jsonify(
        status="healthy",
        message="Flask backend is running!",
        version="1.0.0",
        port=os.getenv("PORT", "5000")
    )

@api_bp.get("/about")
def about():
    return jsonify(
        name="becsmate.me",
        description="Personal website of Becs",
        tech_stack=["Python", "Flask", "React", "TypeScript", "Material-UI", "Docker"]
    )

@api_bp.route('/process-file', methods=['POST'])
def process_file():
    """Process receipt with Azure's intelligent parsing"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Save uploaded file
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Use smart receipt service
        receipt_service = SmartReceiptService()
        
        result = receipt_service.process_receipt(filepath)

        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500