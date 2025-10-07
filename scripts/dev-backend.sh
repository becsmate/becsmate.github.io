#!/bin/bash
# Simple development startup - starts backend only

echo "🐍 Starting Flask backend with hot reload..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Set environment variables
export FLASK_ENV=development
export FLASK_DEBUG=1
export DATABASE_URL=sqlite:///instance/dev.db
export JWT_SECRET_KEY=dev-secret-key
export CORS_ORIGINS=http://localhost:3000

# Initialize database if it doesn't exist
if [ ! -f instance/dev.db ]; then
    echo "📊 Initializing database..."
    python scripts/init_db.py
fi

echo "✅ Starting Flask development server..."
echo "   Backend:   http://localhost:5000"
echo "   External:  http://$(hostname -I | awk '{print $1}'):5000"
echo "   API Health: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop"

# Start Flask with hot reload on all interfaces
flask --app server.app run --host=0.0.0.0 --port=5000 --debug --reload