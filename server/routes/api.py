"""API routes blueprint."""
from flask import Blueprint, jsonify, request
import os
import uuid
import easyocr
from ..ocr.ocr_service import OCRSpaceService
from ..ocr.grok_parser import GroqAIParser
from werkzeug.utils import secure_filename
from flask import current_app as app

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

grok_parser = GroqAIParser()

reader = easyocr.Reader(['hu'])

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
    """Process uploaded image file using EasyOCR"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Save uploaded file temporarily
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process with EasyOCR
            result = reader.readtext(filepath, detail=0, paragraph=True)
            ocr_text = "\n".join(result)
            
            # Clean up temporary file
            try:
                os.remove(filepath)
            except:
                pass
            
            if not ocr_text.strip():
                return jsonify({'success': False, 'error': 'OCR failed to extract text'}), 400
            
            # Parse the extracted text
            parsed_data = grok_parser.parse_receipt_with_ai(ocr_text)
            
            return jsonify({
                'success': True,
                'ocr_text': ocr_text,
                'parsed_data': parsed_data
            })
        
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500