"""API routes blueprint."""
from flask import Blueprint, jsonify
import os

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