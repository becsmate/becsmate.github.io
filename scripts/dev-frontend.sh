#!/bin/bash
# Simple development startup - starts frontend only

echo "⚛️  Starting React frontend with hot reload..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT/client"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in client directory"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

echo "✅ Starting React development server..."
echo "   Frontend: http://localhost:3000"
echo "   External: http://$(hostname -I | awk '{print $1}'):3000"
echo "   (API calls will proxy to http://localhost:5000)"
echo ""
echo "Press Ctrl+C to stop"

# Set environment variables for external access
export HOST=0.0.0.0
export PORT=3000
export DANGEROUSLY_DISABLE_HOST_CHECK=true
export WDS_SOCKET_HOST=0.0.0.0
export WDS_SOCKET_PORT=3000
export FAST_REFRESH=true

# Start React development server
npm start