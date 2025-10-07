"""Main application entry point for WSGI server."""
import os
from . import create_app

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
