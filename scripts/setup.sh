#!/bin/bash

# Development setup script
echo "🚀 Setting up becsmate.me development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build and start the development environment
echo "🐳 Building Docker containers..."
docker-compose build

echo "✅ Setup complete! You can now run:"
echo "  - npm run dev (full stack with Docker)"
echo "  - npm run dev:frontend (frontend only with Docker)"
echo "  - npm run local:dev (local development without Docker)"
echo ""
echo "🌐 Your app will be available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5000"
echo "  - Full app: http://localhost:5000 (production mode)"