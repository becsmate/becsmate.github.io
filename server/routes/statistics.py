from extensions import db
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import Transaction, User, Wallet
from sqlalchemy import case, func

statistics_bp = Blueprint("statistics", __name__, url_prefix="/api/statistics")


def _check_wallet_access(wallet_id, user_id):
    wallet = db.session.get(Wallet, wallet_id)
    return wallet if wallet and wallet.owner_id == user_id else None


@statistics_bp.route("/<string:wallet_id>/summary", methods=["GET"])
@jwt_required()
def summary(wallet_id):
    user_id = get_jwt_identity()
    if not _check_wallet_access(wallet_id, user_id):
        return jsonify({"error": "Wallet not found"}), 404

    transaction_query = db.session.query(func.sum(Transaction.amount))
    total = transaction_query.filter_by(wallet_id=wallet_id).scalar() or 0
    income = (
        transaction_query.filter(
            Transaction.wallet_id == wallet_id, Transaction.amount > 0
        ).scalar()
        or 0
    )
    expenses = (
        transaction_query.filter(
            Transaction.wallet_id == wallet_id, Transaction.amount < 0
        ).scalar()
        or 0
    )
    count = Transaction.query.filter_by(wallet_id=wallet_id).count()

    return jsonify(
        {
            "total": float(total),
            "income": float(income),
            "expenses": float(expenses),
            "transaction_count": count,
        }
    )


@statistics_bp.route("/<string:wallet_id>/monthly", methods=["GET"])
@jwt_required()
def monthly(wallet_id):
    user_id = get_jwt_identity()
    if not _check_wallet_access(wallet_id, user_id):
        return jsonify({"error": "Wallet not found"}), 404

    rows = (
        db.session.query(
            func.date_trunc("month", Transaction.date).label("month"),
            func.sum(Transaction.amount).label("total"),
            func.sum(case((Transaction.amount > 0, Transaction.amount), else_=0)).label(
                "income"
            ),
            func.sum(case((Transaction.amount < 0, Transaction.amount), else_=0)).label(
                "expenses"
            ),
        )
        .filter_by(wallet_id=wallet_id)
        .group_by("month")
        .order_by("month")
        .all()
    )

    return jsonify(
        {
            "monthly": [
                {
                    "month": row.month.strftime("%Y-%m"),
                    "total": float(row.total),
                    "income": float(row.income or 0),
                    "expenses": float(row.expenses or 0),
                }
                for row in rows
            ]
        }
    )


@statistics_bp.route("/<string:wallet_id>/categories", methods=["GET"])
@jwt_required()
def categories(wallet_id):
    user_id = get_jwt_identity()
    if not _check_wallet_access(wallet_id, user_id):
        return jsonify({"error": "Wallet not found"}), 404

    rows = (
        db.session.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total"),
        )
        .filter_by(wallet_id=wallet_id)
        .group_by(Transaction.category)
        .all()
    )

    return jsonify(
        {
            "categories": [
                {"category": row.category, "total": float(row.total)} for row in rows
            ]
        }
    )


@statistics_bp.route("/summary", methods=["GET"])
@jwt_required()
def user_summary():
    user_id = get_jwt_identity()
    transaction_query = db.session.query(func.sum(Transaction.amount))
    total = transaction_query.filter_by(created_by=user_id).scalar() or 0
    income = (
        transaction_query.filter(
            Transaction.created_by == user_id, Transaction.amount > 0
        ).scalar()
        or 0
    )
    expenses = (
        transaction_query.filter(
            Transaction.created_by == user_id, Transaction.amount < 0
        ).scalar()
        or 0
    )
    count = Transaction.query.filter_by(created_by=user_id).count()

    return jsonify(
        {
            "total": float(total),
            "income": float(income),
            "expenses": float(expenses),
            "transaction_count": count,
        }
    )


@statistics_bp.route("/monthly", methods=["GET"])
@jwt_required()
def user_monthly():
    user_id = get_jwt_identity()

    rows = (
        db.session.query(
            func.date_trunc("month", Transaction.date).label("month"),
            func.sum(Transaction.amount).label("total"),
            func.sum(case((Transaction.amount > 0, Transaction.amount), else_=0)).label(
                "income"
            ),
            func.sum(case((Transaction.amount < 0, Transaction.amount), else_=0)).label(
                "expenses"
            ),
        )
        .filter_by(created_by=user_id)
        .group_by("month")
        .order_by("month")
        .all()
    )

    return jsonify(
        {
            "monthly": [
                {
                    "month": row.month.strftime("%Y-%m"),
                    "total": float(row.total),
                    "income": float(row.income or 0),
                    "expenses": float(row.expenses or 0),
                }
                for row in rows
            ]
        }
    )
