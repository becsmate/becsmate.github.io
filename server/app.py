import os
from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
from config import Config
from extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__, static_folder='../client/build/static')
    app.config.from_object(Config)

    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from routes.auth import auth_bp
    from routes.wallets import wallets_bp
    from routes.transactions import transactions_bp
    from routes.ocr import ocr_bp
    from routes.statistics import statistics_bp
    from routes.profile_picture import profile_bp
    from routes.spa import spa_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(wallets_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(ocr_bp)
    app.register_blueprint(statistics_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(spa_bp)

    with app.app_context():
        db.create_all()
        # Add columns introduced after initial deploy (safe to run repeatedly)
        _run_migrations(app)

    return app


def _run_migrations(app):
    """Apply any schema changes that db.create_all() won't handle (existing tables)."""
    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255)",
    ]
    with app.app_context():
        with db.engine.connect() as conn:
            for stmt in migrations:
                conn.execute(text(stmt))
            conn.commit()

app = create_app()