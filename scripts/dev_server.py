#!/usr/bin/env python3
"""
Development server with hot reload for both Python and static files
"""
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from server import create_app
from server.extensions import db

def create_dev_app():
    """Create Flask app with development configuration"""
    app = create_app()
    
    # Override config for development
    app.config.update(
        DEBUG=True,
        FLASK_ENV='development',
        SQLALCHEMY_DATABASE_URI='sqlite:///instance/dev.db',
        JWT_SECRET_KEY='dev-secret-key-change-in-production',
        CORS_ORIGINS=['http://localhost:3000', 'http://127.0.0.1:3000']
    )
    
    # Initialize database if it doesn't exist
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database initialized")
        except Exception as e:
            print(f"❌ Database error: {e}")
    
    return app

if __name__ == '__main__':
    app = create_dev_app()
    
    port = int(os.getenv('PORT', 5000))
    
    print(f"""
🚀 Development server starting...
   Frontend proxy: http://localhost:3000
   Backend API:    http://localhost:{port}
   API Health:     http://localhost:{port}/api/health
   
📁 Watching for changes in:
   - server/ (Python files)
   - client/build/ (Static files)
    """)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True,
        use_reloader=True,
        use_debugger=True,
        extra_files=[
            # Watch additional files for changes
            'server/config.py',
            'server/models.py',
            'server/extensions.py',
        ]
    )