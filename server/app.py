from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os
from pathlib import Path

def create_app():
    app = Flask(__name__, static_folder='../client/build', static_url_path='')
    
    # Configure CORS
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, origins=cors_origins)
    
    # API Routes only - no frontend routing
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Flask backend is running!',
            'version': '1.0.0'
        })
    
    @app.route('/api/about')
    def about():
        return jsonify({
            'name': 'becsmate.me',
            'description': 'Personal website of Becs',
            'tech_stack': ['Python', 'Flask', 'React', 'TypeScript', 'Material-UI', 'Docker']
        })
    
    # Serve static files only (CSS, JS, images, etc.)
    @app.route('/<path:filename>')
    def serve_static(filename):
        static_folder = Path(app.static_folder)
        file_path = static_folder / filename
        if file_path.exists() and file_path.is_file():
            return send_from_directory(app.static_folder, filename)
        # If file doesn't exist, let React handle routing
        return send_from_directory(app.static_folder, 'index.html')
    
    # Serve React app for root
    @app.route('/')
    def serve_react_root():
        return send_from_directory(app.static_folder, 'index.html')
    
    # Error handler only for API routes
    @app.errorhandler(404)
    def not_found(error):
        from flask import request
        # For API routes, return JSON error
        if request.path.startswith('/api/'):
            return jsonify({'error': 'API endpoint not found'}), 404
        # For everything else, let React handle it
        return send_from_directory(app.static_folder, 'index.html')
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
