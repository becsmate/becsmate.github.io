#!/bin/bash

echo "🚀 Deploying to Heroku..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please run 'git init' first."
    exit 1
fi

# Check if heroku remote exists
if ! git remote get-url heroku > /dev/null 2>&1; then
    echo "❌ Heroku remote not found. Please run:"
    echo "   heroku git:remote -a your-heroku-app-name"
    exit 1
fi

# Get the heroku app name
HEROKU_APP=$(heroku apps:info --json | jq -r '.app.name' 2>/dev/null || echo "unknown")

echo "📱 Heroku app: $HEROKU_APP"

# Make sure we're using container stack
echo "🐳 Setting container stack..."
heroku stack:set container

# Set environment variables for production
echo "⚙️ Setting environment variables..."
heroku config:set FLASK_ENV=production
heroku config:set CORS_ORIGINS=https://becsmate.me,https://www.becsmate.me

# Build and test locally first
echo "🧪 Testing build locally..."
docker build -t becsmate-test . || {
    echo "❌ Local build failed"
    exit 1
}

# Test the container
echo "🔍 Testing container..."
CONTAINER_ID=$(docker run -d -p 5001:5000 -e PORT=5000 becsmate-test)
sleep 5

# Test health endpoint
if curl -f -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Local test passed"
else
    echo "❌ Local test failed"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID && docker rm $CONTAINER_ID
    exit 1
fi

# Cleanup test container
docker stop $CONTAINER_ID && docker rm $CONTAINER_ID
docker rmi becsmate-test

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy containerized app with routing - $(date)"
git push heroku main

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be available at:"
echo "   https://$HEROKU_APP.herokuapp.com"
echo ""
echo "📊 Check logs with:"
echo "   heroku logs --tail"
echo ""
echo "🔧 If there are issues, check:"
echo "   heroku ps:scale web=1"