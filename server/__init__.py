from flask import Flask, app
from flask_cors import CORS
import os

from .config import Config
from .extensions import db, migrate, jwt

def create_app(config_class=Config):
    app = Flask(__name__, static_folder="../client/build", static_url_path="")
    
    app.config.from_object(config_class)

    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get("CORS_ORIGINS", ["http://localhost:3000"])
        }
    })
    
    from . import models
    
    from .routes.api import api_bp
    from .routes.auth import auth_bp
    from .routes.profile_picture import profile_bp
    
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    
    from .routes.spa import register_spa_routes
    register_spa_routes(app)
    
    uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if uri.startswith("sqlite:"):
        with app.app_context():
            db.create_all()
    
    return app