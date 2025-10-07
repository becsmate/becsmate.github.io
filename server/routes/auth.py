from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    name = data.get("name")
    if not email or not password:
        return jsonify(error="Email and password required"), 400
    if User.query.filter_by(email=email).first():
        return jsonify(error="Email already registered"), 409
    user = User(email=email, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    tokens = _tokens_for(user.id)
    return jsonify(user={"id": user.id, "email": user.email, "name": user.name}, **tokens), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password or ""):
        return jsonify(error="Invalid credentials"), 401
    tokens = _tokens_for(user.id)
    return jsonify(user={"id": user.id, "email": user.email, "name": user.name}, **tokens)

@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    uid = get_jwt_identity()
    return jsonify(access_token=create_access_token(identity=uid))

@auth_bp.get("/me")
@jwt_required()
def me():
    uid = get_jwt_identity()
    user = User.query.get(uid)
    return jsonify(user={"id": user.id, "email": user.email, "name": user.name})

def _tokens_for(identity: str):
    return {
        "access_token": create_access_token(identity=identity),
        "refresh_token": create_refresh_token(identity=identity),
    }