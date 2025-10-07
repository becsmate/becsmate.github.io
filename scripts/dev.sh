#!/bin/bash
# Development startup script

echo "🚀 Starting development environment..."

# Kill any existing processes on these ports
echo "📋 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo "🐍 Starting Flask backend with hot reload..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

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

# Start Flask with hot reload
flask --app server.app run --host=0.0.0.0 --port=5000 --debug --reload &
FLASK_PID=$!

# Wait a moment for Flask to start
sleep 2

# Start frontend in background
echo "⚛️  Starting React frontend with hot reload..."
if [ -d "client" ]; then
    cd client
    if [ -f "package.json" ]; then
        npm start &
        REACT_PID=$!
    else
        echo "❌ No package.json found in client directory"
        exit 1
    fi
else
    echo "❌ Client directory not found"
    exit 1
fi

echo "✅ Development servers started!"
echo "   Frontend: http://localhost:3000"
echo "   External: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Backend:  http://localhost:5000"
echo "   External: http://$(hostname -I | awk '{print $1}'):5000"
echo "   API docs: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Trap Ctrl+C and kill background processes
trap 'echo "🛑 Stopping servers..."; kill $FLASK_PID $REACT_PID 2>/dev/null; exit' SIGINT

# Wait for background processes
wait $FLASK_PID $REACT_PID