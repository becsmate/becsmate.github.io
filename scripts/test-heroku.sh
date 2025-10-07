#!/bin/bash

echo "🔍 Testing Heroku-like build locally..."

# Clean up any existing containers
docker stop becsmate-heroku-test 2>/dev/null || true
docker rm becsmate-heroku-test 2>/dev/null || true

# Build the image like Heroku would
echo "📦 Building Docker image..."
docker build -t becsmate-heroku-test . || {
    echo "❌ Docker build failed"
    exit 1
}

# Run with PORT environment variable like Heroku
echo "🏃 Starting container with PORT=5000..."
docker run -d -p 5000:5000 -e PORT=5000 --name becsmate-heroku-test becsmate-heroku-test

# Wait for startup
echo "⏳ Waiting for container to start..."
sleep 8

# Test the endpoints
echo "🧪 Testing endpoints..."

# Test health endpoint
echo "Testing /api/health..."
HEALTH_RESPONSE=$(curl -f -s http://localhost:5000/api/health 2>/dev/null)
if [[ $? -eq 0 && $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed: $HEALTH_RESPONSE"
else
    echo "❌ Health check failed"
    docker logs becsmate-heroku-test
    exit 1
fi

# Test about endpoint
echo "Testing /api/about..."
ABOUT_RESPONSE=$(curl -f -s http://localhost:5000/api/about 2>/dev/null)
if [[ $? -eq 0 && $ABOUT_RESPONSE == *"becsmate.me"* ]]; then
    echo "✅ About endpoint passed"
else
    echo "❌ About endpoint failed"
    docker logs becsmate-heroku-test
    exit 1
fi

# Test frontend root
echo "Testing / (React app)..."
ROOT_RESPONSE=$(curl -f -s http://localhost:5000/ 2>/dev/null | head -1)
if [[ $? -eq 0 && $ROOT_RESPONSE == *"<!doctype html>"* ]]; then
    echo "✅ Frontend root passed"
else
    echo "❌ Frontend root failed"
    docker logs becsmate-heroku-test
    exit 1
fi

# Test client-side routing
echo "Testing /about (client-side routing)..."
ABOUT_PAGE_RESPONSE=$(curl -f -s http://localhost:5000/about 2>/dev/null | head -1)
if [[ $? -eq 0 && $ABOUT_PAGE_RESPONSE == *"<!doctype html>"* ]]; then
    echo "✅ Client-side routing passed"
else
    echo "❌ Client-side routing failed"
    docker logs becsmate-heroku-test
    exit 1
fi

# Clean up
echo "🧹 Cleaning up..."
docker stop becsmate-heroku-test
docker rm becsmate-heroku-test
docker rmi becsmate-heroku-test

echo ""
echo "🎉 All tests passed! Your app is ready for Heroku deployment."
echo ""
echo "🚀 To deploy to Heroku, run:"
echo "   ./scripts/deploy.sh"