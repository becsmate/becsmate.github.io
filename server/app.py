from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for development

# API Routes
@app.route('/api/data')
def get_data():
    return jsonify({"message": "Hello from Flask API!"})

@app.route('/api/users')
def get_users():
    return jsonify({"users": ["User1", "User2", "User3"]})

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Configure static folder for React build
    app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'client', 'build')
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
