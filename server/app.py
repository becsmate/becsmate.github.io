from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)

# Enable CORS for API endpoints; tighten origins in production
CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})
from flask import Flask

app = Flask(__name__)

# Your API routes
@app.route('/api/data')
def api_data():
    return {'message': 'Hello from Flask API!'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
