from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Wallet

wallets_bp = Blueprint('wallets', __name__, url_prefix='/api/wallets')


def _get_wallet_or_404(wallet_id, user_id):
    wallet = db.session.get(Wallet, wallet_id)
    if not wallet or wallet.owner_id != user_id:
        return None
    return wallet


@wallets_bp.route('', methods=['GET'])
@jwt_required()
def get_wallets():
    user_id = int(get_jwt_identity())
    wallets = Wallet.query.filter_by(owner_id=user_id).all()
    return jsonify({'wallets': [w.to_dict() for w in wallets]})


@wallets_bp.route('', methods=['POST'])
@jwt_required()
def create_wallet():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name', '').strip()
    wallet_type = data.get('type', 'personal')

    if not name:
        return jsonify({'error': 'Wallet name is required'}), 400
    if wallet_type not in ('personal', 'group'):
        return jsonify({'error': 'Type must be personal or group'}), 400

    wallet = Wallet(name=name, type=wallet_type, owner_id=user_id)
    db.session.add(wallet)
    db.session.commit()
    return jsonify({'wallet': wallet.to_dict()}), 201


@wallets_bp.route('/<int:wallet_id>', methods=['GET'])
@jwt_required()
def get_wallet(wallet_id):
    user_id = int(get_jwt_identity())
    wallet = _get_wallet_or_404(wallet_id, user_id)
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    return jsonify({'wallet': wallet.to_dict()})


@wallets_bp.route('/<int:wallet_id>', methods=['PATCH'])
@jwt_required()
def update_wallet(wallet_id):
    user_id = int(get_jwt_identity())
    wallet = _get_wallet_or_404(wallet_id, user_id)
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404

    data = request.get_json() or {}
    if 'name' in data:
        name = data['name'].strip()
        if not name:
            return jsonify({'error': 'Wallet name cannot be empty'}), 400
        wallet.name = name
    if 'type' in data:
        if data['type'] not in ('personal', 'group'):
            return jsonify({'error': 'Type must be personal or group'}), 400
        wallet.type = data['type']

    db.session.commit()
    return jsonify({'wallet': wallet.to_dict()})


@wallets_bp.route('/<int:wallet_id>', methods=['DELETE'])
@jwt_required()
def delete_wallet(wallet_id):
    user_id = int(get_jwt_identity())
    wallet = _get_wallet_or_404(wallet_id, user_id)
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404

    db.session.delete(wallet)
    db.session.commit()
    return jsonify({'message': 'Wallet deleted'}), 200