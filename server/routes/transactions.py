from datetime import datetime

from extensions import db
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import Transaction, Wallet

transactions_bp = Blueprint("transactions", __name__)


def _get_wallet_or_abort(wallet_id, user_id):
    wallet = db.session.get(Wallet, wallet_id)
    if not wallet or wallet.owner_id != user_id:
        return None
    return wallet


@transactions_bp.route("/api/wallets/<string:wallet_id>/transactions", methods=["GET"])
@jwt_required()
def get_transactions(wallet_id):
    user_id = get_jwt_identity()
    if not _get_wallet_or_abort(wallet_id, user_id):
        return jsonify({"error": "Wallet not found"}), 404

    query = Transaction.query.filter_by(wallet_id=wallet_id)

    if category := request.args.get("category"):
        query = query.filter(Transaction.category == category)
    if date_from := request.args.get("date_from"):
        query = query.filter(Transaction.date >= datetime.fromisoformat(date_from))
    if date_to := request.args.get("date_to"):
        query = query.filter(Transaction.date <= datetime.fromisoformat(date_to))
    if min_amount := request.args.get("min_amount"):
        query = query.filter(Transaction.amount >= float(min_amount))
    if max_amount := request.args.get("max_amount"):
        query = query.filter(Transaction.amount <= float(max_amount))

    sort_by = request.args.get("sort_by", "date")
    order = request.args.get("order", "desc")
    sort_col = getattr(Transaction, sort_by, Transaction.date)
    query = query.order_by(sort_col.desc() if order == "desc" else sort_col.asc())

    transactions = query.all()
    return jsonify({"transactions": [t.to_dict() for t in transactions]})


@transactions_bp.route("/api/wallets/<string:wallet_id>/transactions", methods=["POST"])
@jwt_required()
def create_transaction(wallet_id):
    user_id = get_jwt_identity()
    if not _get_wallet_or_abort(wallet_id, user_id):
        return jsonify({"error": "Wallet not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    amount = data.get("amount")
    category = data.get("category", "").strip()
    date_str = data.get("date")

    if amount is None or not category or not date_str:
        return jsonify({"error": "Amount, category and date are required"}), 400

    transaction = Transaction(
        wallet_id=wallet_id,
        amount=float(amount),
        currency=data.get("currency", "HUF"),
        category=category,
        date=datetime.fromisoformat(date_str),
        description=data.get("description"),
        merchant_name=data.get("merchant_name"),
        original_image_url=data.get("original_image_url"),
        ocr_raw_text=data.get("ocr_raw_text"),
        created_by=user_id,
    )
    db.session.add(transaction)
    db.session.commit()
    return jsonify({"transaction": transaction.to_dict()}), 201


@transactions_bp.route(
    "/api/wallets/<string:wallet_id>/transactions/<string:transaction_id>",
    methods=["PATCH"],
)
@jwt_required()
def update_transaction(wallet_id, transaction_id):
    user_id = get_jwt_identity()
    if not _get_wallet_or_abort(wallet_id, user_id):
        return jsonify({"error": "Wallet not found"}), 404

    transaction = db.session.get(Transaction, transaction_id)
    if not transaction or transaction.wallet_id != wallet_id:
        return jsonify({"error": "Transaction not found"}), 404
    if transaction.created_by != user_id:
        return jsonify({"error": "Not authorised"}), 403

    data = request.get_json() or {}
    for field in ("amount", "currency", "category", "description", "merchant_name"):
        if field in data:
            setattr(
                transaction,
                field,
                float(data[field]) if field == "amount" else data[field],
            )
    if "date" in data:
        transaction.date = datetime.fromisoformat(data["date"])

    db.session.commit()
    return jsonify({"transaction": transaction.to_dict()})


@transactions_bp.route(
    "/api/wallets/<string:wallet_id>/transactions/<string:transaction_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_transaction(wallet_id, transaction_id):
    user_id = get_jwt_identity()
    if not _get_wallet_or_abort(wallet_id, user_id):
        return jsonify({"error": "Wallet not found"}), 404

    transaction = db.session.get(Transaction, transaction_id)
    if not transaction or transaction.wallet_id != wallet_id:
        return jsonify({"error": "Transaction not found"}), 404
    if transaction.created_by != user_id:
        return jsonify({"error": "Not authorised"}), 403

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({"message": "Transaction deleted"})
