import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import OCRJob, Transaction

ocr_bp = Blueprint('ocr', __name__, url_prefix='/api/ocr')

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf'}


def _allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@ocr_bp.route('/process', methods=['POST'])
@jwt_required()
def process_receipt():
    user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename or not _allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png, pdf'}), 400

    upload_folder = current_app.config['UPLOAD_FOLDER']
    filename = f"{user_id}_{int(datetime.utcnow().timestamp())}_{file.filename}"
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    job = OCRJob(user_id=user_id, image_path=filename, status='processing')
    db.session.add(job)
    db.session.commit()

    try:
        from ocr.smart_receipt_service import SmartReceiptService
        result = SmartReceiptService().process(filepath)
        job.status = 'completed'
        job.raw_text = result.get('ocr_text')
        job.extracted_data = result.get('parsed_data')
        job.completed_at = datetime.utcnow()
    except Exception as e:
        job.status = 'failed'
        job.completed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'error': 'OCR processing failed', 'detail': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

    db.session.commit()
    return jsonify({'job': job.to_dict()}), 201


@ocr_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    user_id = get_jwt_identity()
    jobs = OCRJob.query.filter_by(user_id=user_id).order_by(OCRJob.created_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]})


@ocr_bp.route('/jobs/<string:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    user_id = get_jwt_identity()
    job = db.session.get(OCRJob, job_id)
    if not job or job.user_id != user_id:
        return jsonify({'error': 'Job not found'}), 404
    return jsonify({'job': job.to_dict()})


@ocr_bp.route('/jobs/<string:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    user_id = get_jwt_identity()
    job = db.session.get(OCRJob, job_id)
    if not job or job.user_id != user_id:
        return jsonify({'error': 'Job not found'}), 404
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted'})


@ocr_bp.route('/confirm', methods=['POST'])
@jwt_required()
def confirm_receipt():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    wallet_id = data.get('wallet_id')
    amount = data.get('amount')
    category = data.get('category', '').strip()
    date_str = data.get('date')

    if not wallet_id or amount is None or not category or not date_str:
        return jsonify({'error': 'wallet_id, amount, category and date are required'}), 400

    transaction = Transaction(
        wallet_id=wallet_id,
        amount=float(amount),
        currency=data.get('currency', 'HUF'),
        category=category,
        date=datetime.fromisoformat(date_str),
        description=data.get('description'),
        merchant_name=data.get('merchant_name'),
        original_image_url=data.get('original_image_url'),
        ocr_raw_text=data.get('ocr_raw_text'),
        created_by=user_id,
    )
    db.session.add(transaction)

    if job_id := data.get('job_id'):
        job = db.session.get(OCRJob, job_id)
        if job and job.user_id == user_id:
            job.status = 'completed'
            job.completed_at = datetime.utcnow()

    db.session.commit()
    return jsonify({'transaction': transaction.to_dict()}), 201