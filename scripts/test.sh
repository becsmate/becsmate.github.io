#!/bin/bash

echo "🧪 Testing becsmate.me Docker setup..."

# Build the image
echo "📦 Building Docker image..."
docker build -t becsmate-site-test . || {
    echo "❌ Docker build failed"
    exit 1
}

# Run the container
echo "🚀 Starting container..."
CONTAINER_ID=$(docker run -d -p 5001:5000 becsmate-site-test)

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Test API endpoints
echo "🔍 Testing API endpoints..."

# Test health endpoint
HEALTH=$(curl -s http://localhost:5001/api/health)
if [[ $HEALTH == *"healthy"* ]]; then
    echo "✅ Health endpoint works: $HEALTH"
else
    echo "❌ Health endpoint failed: $HEALTH"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID && docker rm $CONTAINER_ID
    exit 1
fi

# Test about endpoint
ABOUT=$(curl -s http://localhost:5001/api/about)
if [[ $ABOUT == *"becsmate.me"* ]]; then
    echo "✅ About endpoint works"
else
    echo "❌ About endpoint failed: $ABOUT"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID && docker rm $CONTAINER_ID
    exit 1
fi

# Test React app serving
ROOT=$(curl -s http://localhost:5001/ | head -1)
if [[ $ROOT == *"<!doctype html>"* ]]; then
    echo "✅ React app is being served"
else
    echo "❌ React app serving failed"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID && docker rm $CONTAINER_ID
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up..."
docker stop $CONTAINER_ID && docker rm $CONTAINER_ID
docker rmi becsmate-site-test

echo "🎉 All tests passed! Your dockerized setup is working perfectly."
echo ""
echo "🚀 Next steps:"
echo "  1. Run 'npm run dev' for development with Docker Compose"
echo "  2. Deploy to Heroku with 'git push heroku main'"
echo "  3. Visit https://becsmate.me to see your live site"