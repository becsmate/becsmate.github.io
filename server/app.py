import os
from flask import Flask
from flask_cors import CORS
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

    return app

app = create_app()