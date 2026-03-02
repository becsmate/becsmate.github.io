from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models import Wallet, Transaction

statistics_bp = Blueprint('statistics', __name__, url_prefix='/api/statistics')


def _check_wallet_access(wallet_id, user_id):
    wallet = db.session.get(Wallet, wallet_id)
    return wallet if wallet and wallet.owner_id == user_id else None


@statistics_bp.route('/<int:wallet_id>/summary', methods=['GET'])
@jwt_required()
def summary(wallet_id):
    user_id = int(get_jwt_identity())
    if not _check_wallet_access(wallet_id, user_id):
        return jsonify({'error': 'Wallet not found'}), 404

    total = db.session.query(func.sum(Transaction.amount)).filter_by(wallet_id=wallet_id).scalar() or 0
    income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.wallet_id == wallet_id, Transaction.amount > 0
    ).scalar() or 0
    expenses = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.wallet_id == wallet_id, Transaction.amount < 0
    ).scalar() or 0
    count = Transaction.query.filter_by(wallet_id=wallet_id).count()

    return jsonify({
        'total': float(total),
        'income': float(income),
        'expenses': float(expenses),
        'transaction_count': count,
    })


@statistics_bp.route('/<int:wallet_id>/monthly', methods=['GET'])
@jwt_required()
def monthly(wallet_id):
    user_id = int(get_jwt_identity())
    if not _check_wallet_access(wallet_id, user_id):
        return jsonify({'error': 'Wallet not found'}), 404

    rows = db.session.query(
        func.date_trunc('month', Transaction.date).label('month'),
        func.sum(Transaction.amount).label('total'),
    ).filter_by(wallet_id=wallet_id).group_by('month').order_by('month').all()

    return jsonify({'monthly': [
        {'month': row.month.strftime('%Y-%m'), 'total': float(row.total)}
        for row in rows
    ]})


@statistics_bp.route('/<int:wallet_id>/categories', methods=['GET'])
@jwt_required()
def categories(wallet_id):
    user_id = int(get_jwt_identity())
    if not _check_wallet_access(wallet_id, user_id):
        return jsonify({'error': 'Wallet not found'}), 404

    rows = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total'),
    ).filter_by(wallet_id=wallet_id).group_by(Transaction.category).all()

    return jsonify({'categories': [
        {'category': row.category, 'total': float(row.total)}
        for row in rows
    ]})