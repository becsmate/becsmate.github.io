from datetime import datetime

from extensions import db
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import User, Wallet, WalletInvitation

wallets_bp = Blueprint("wallets", __name__, url_prefix="/api/wallets")


def _get_wallet_or_404(wallet_id, user_id, require_owner=False):
    wallet = db.session.get(Wallet, wallet_id)
    if not wallet:
        return None

    if wallet.owner_id == user_id:
        return wallet

    if require_owner:
        return None

    # Check if user is a member
    if wallet.members.filter_by(id=user_id).first():
        return wallet

    return None


def _serialize_wallet_for_list(wallet, is_owner):
    data = wallet.to_dict()
    data["is_owner"] = is_owner
    data["balance"] = round(sum(float(t.amount) for t in wallet.transactions), 2)
    data["member_count"] = (wallet.members.count() + 1) if wallet.type == "group" else 0
    return data


@wallets_bp.route("", methods=["GET"])
@jwt_required()
def get_wallets():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    owned_wallets = user.wallets
    shared_wallets = user.shared_wallets

    results = []
    for w in owned_wallets:
        results.append(_serialize_wallet_for_list(w, True))

    for w in shared_wallets:
        results.append(_serialize_wallet_for_list(w, False))

    return jsonify({"wallets": results})


@wallets_bp.route("", methods=["POST"])
@jwt_required()
def create_wallet():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name", "").strip()
    wallet_type = data.get("type", "personal")

    if not name:
        return jsonify({"error": "Wallet name is required"}), 400
    if wallet_type not in ("personal", "group"):
        return jsonify({"error": "Type must be personal or group"}), 400

    wallet = Wallet(name=name, type=wallet_type, owner_id=user_id)
    db.session.add(wallet)
    db.session.commit()
    return jsonify({"wallet": wallet.to_dict()}), 201


@wallets_bp.route("/<string:wallet_id>", methods=["GET"])
@jwt_required()
def get_wallet(wallet_id):
    user_id = get_jwt_identity()
    wallet = _get_wallet_or_404(wallet_id, user_id)
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404
    return jsonify({"wallet": wallet.to_dict()})


@wallets_bp.route("/<string:wallet_id>", methods=["PATCH"])
@jwt_required()
def update_wallet(wallet_id):
    user_id = get_jwt_identity()
    wallet = _get_wallet_or_404(wallet_id, user_id, require_owner=True)
    if not wallet:
        return jsonify({"error": "Wallet not found or permission denied"}), 404

    data = request.get_json() or {}
    if "name" in data:
        name = data["name"].strip()
        if not name:
            return jsonify({"error": "Wallet name cannot be empty"}), 400
        wallet.name = name
    if "type" in data:
        if data["type"] not in ("personal", "group"):
            return jsonify({"error": "Type must be personal or group"}), 400
        wallet.type = data["type"]

    db.session.commit()
    return jsonify({"wallet": wallet.to_dict()})


@wallets_bp.route("/<string:wallet_id>", methods=["DELETE"])
@jwt_required()
def delete_wallet(wallet_id):
    user_id = get_jwt_identity()
    wallet = _get_wallet_or_404(wallet_id, user_id, require_owner=True)
    if not wallet:
        return jsonify({"error": "Wallet not found or permission denied"}), 404

    # Clear invitations explicitly to avoid intermittent FK issues on wallet deletion.
    for invitation in wallet.invitations.all():
        db.session.delete(invitation)

    db.session.delete(wallet)
    db.session.commit()
    return jsonify({"message": "Wallet deleted"}), 200


@wallets_bp.route("/<string:wallet_id>/members", methods=["GET"])
@jwt_required()
def get_wallet_members(wallet_id):
    user_id = get_jwt_identity()
    wallet = _get_wallet_or_404(wallet_id, user_id)
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    owner = db.session.get(User, wallet.owner_id)
    members = wallet.members.all()

    result = []
    if owner:
        owner_dict = owner.to_dict()
        owner_dict["role"] = "owner"
        result.append(owner_dict)

    for m in members:
        m_dict = m.to_dict()
        m_dict["role"] = "member"
        result.append(m_dict)

    return jsonify({"members": result})


@wallets_bp.route("/<string:wallet_id>/members", methods=["POST"])
@jwt_required()
def add_wallet_member(wallet_id):
    user_id = get_jwt_identity()
    wallet = _get_wallet_or_404(wallet_id, user_id, require_owner=True)
    if not wallet:
        return jsonify({"error": "Wallet not found or permission denied"}), 404

    if wallet.type != "group":
        return jsonify({"error": "Only group wallets can have members"}), 400

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user_to_add = User.query.filter_by(email=email).first()
    if not user_to_add:
        return jsonify({"error": "User not found"}), 404

    if user_to_add.id == wallet.owner_id:
        return jsonify({"error": "User is already the owner"}), 400

    if wallet.members.filter_by(id=user_to_add.id).first():
        return jsonify({"error": "User is already a member"}), 400

    invitation = wallet.invitations.filter_by(invited_user_id=user_to_add.id).first()

    if invitation and invitation.status == "pending":
        return jsonify({"error": "User already has a pending invitation"}), 400

    if invitation:
        invitation.status = "pending"
        invitation.invited_by_user_id = user_id
        invitation.responded_at = None
    else:
        invitation = WalletInvitation(
            wallet_id=wallet.id,
            invited_user_id=user_to_add.id,
            invited_by_user_id=user_id,
            status="pending",
        )
        db.session.add(invitation)

    db.session.commit()

    return (
        jsonify(
            {
                "message": "Invitation sent",
                "invitation": invitation.to_dict(),
                "user": user_to_add.to_dict(),
            }
        ),
        201,
    )


@wallets_bp.route("/invitations", methods=["GET"])
@jwt_required()
def list_my_invitations():
    user_id = get_jwt_identity()
    status = (request.args.get("status") or "pending").strip().lower()

    if status not in ("pending", "accepted", "declined", "all"):
        return jsonify({"error": "Invalid status filter"}), 400

    query = WalletInvitation.query.filter_by(invited_user_id=user_id)
    if status != "all":
        query = query.filter_by(status=status)

    invitations = query.order_by(WalletInvitation.created_at.desc()).all()

    result = []
    for invitation in invitations:
        invitation_dict = invitation.to_dict()

        wallet = db.session.get(Wallet, invitation.wallet_id)
        invited_by_user = db.session.get(User, invitation.invited_by_user_id)

        invitation_dict["wallet"] = (
            {
                "id": wallet.id,
                "name": wallet.name,
                "type": wallet.type,
            }
            if wallet
            else None
        )
        invitation_dict["invited_by"] = (
            {
                "id": invited_by_user.id,
                "name": invited_by_user.name,
                "email": invited_by_user.email,
            }
            if invited_by_user
            else None
        )

        result.append(invitation_dict)

    return jsonify({"invitations": result})


@wallets_bp.route("/invitations/<string:invitation_id>/accept", methods=["POST"])
@jwt_required()
def accept_invitation(invitation_id):
    user_id = get_jwt_identity()
    invitation = db.session.get(WalletInvitation, invitation_id)

    if not invitation or invitation.invited_user_id != user_id:
        return jsonify({"error": "Invitation not found"}), 404

    if invitation.status != "pending":
        return jsonify({"error": "Invitation is not pending"}), 400

    wallet = db.session.get(Wallet, invitation.wallet_id)
    user = db.session.get(User, user_id)
    if not wallet or not user:
        return jsonify({"error": "Wallet or user not found"}), 404

    if not wallet.members.filter_by(id=user_id).first():
        wallet.members.append(user)

    invitation.status = "accepted"
    invitation.responded_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Invitation accepted", "wallet": wallet.to_dict()})


@wallets_bp.route("/invitations/<string:invitation_id>/decline", methods=["POST"])
@jwt_required()
def decline_invitation(invitation_id):
    user_id = get_jwt_identity()
    invitation = db.session.get(WalletInvitation, invitation_id)

    if not invitation or invitation.invited_user_id != user_id:
        return jsonify({"error": "Invitation not found"}), 404

    if invitation.status != "pending":
        return jsonify({"error": "Invitation is not pending"}), 400

    invitation.status = "declined"
    invitation.responded_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Invitation declined"})


@wallets_bp.route("/<string:wallet_id>/members/<string:member_id>", methods=["DELETE"])
@jwt_required()
def remove_wallet_member(wallet_id, member_id):
    user_id = get_jwt_identity()
    wallet = db.session.get(Wallet, wallet_id)

    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    # Determine permissions
    is_owner = wallet.owner_id == user_id
    is_self_removal = user_id == member_id

    if not is_owner and not is_self_removal:
        return jsonify({"error": "Permission denied"}), 403

    # If self removal, ensure user is actually a member (or owner leaving? Owner usually delete wallet)
    if is_self_removal and is_owner:
        return jsonify({"error": "Owner cannot leave wallet, delete it instead"}), 400

    member_to_remove = wallet.members.filter_by(id=member_id).first()
    if not member_to_remove:
        return jsonify({"error": "Member not found in wallet"}), 404

    wallet.members.remove(member_to_remove)
    db.session.commit()

    return jsonify({"message": "Member removed"})
