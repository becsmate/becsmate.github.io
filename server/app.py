from flask import Flask, send_from_directory
import os

# Get the absolute path to the client build directory
base_dir = os.path.dirname(os.path.abspath(__file__))
client_build_path = os.path.join(base_dir, '../client/build')

app = Flask(__name__, static_folder=client_build_path, static_url_path='')

# Serve React App
@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Your API routes
@app.route('/api/data')
def api_data():
    return {'message': 'Hello from Flask API!'}

if __name__ == '__main__':
    app.run()
