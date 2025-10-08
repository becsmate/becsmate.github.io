"""Flask application factory."""
from fileinput import filename
from flask import Flask, app
from flask_cors import CORS
import os

from .config import Config
from .extensions import db, migrate, jwt

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__, static_folder="../client/build", static_url_path="")
    
    # Configuration
    app.config.from_object(config_class)

    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get("CORS_ORIGINS", ["http://localhost:3000"])
        }
    })
    
    # Import models to ensure they're registered with SQLAlchemy
    from . import models  # noqa: F401
    
    # Register blueprints
    from .routes.api import api_bp
    from .routes.auth import auth_bp
    
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
    
    # Register SPA/static handlers
    from .routes.spa import register_spa_routes
    register_spa_routes(app)
    
    # Ensure SQLite schema exists
    uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if uri.startswith("sqlite:"):
        with app.app_context():
            db.create_all()
    
    return app