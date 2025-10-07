"""Flask application factory."""
from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate, jwt


def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__, static_folder="../client/build", static_url_path="")
    
    # Configuration
    app.config.from_object(config_class)
    
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
    
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    return app