# Multi-stage build for production
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production

COPY client/ ./
RUN npm run build

# Python backend
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-build /app/client/build ./client/build

# Create user and set permissions
RUN useradd --create-home --shell /bin/bash app && \
    mkdir -p /app/instance && \
    chown -R app:app /app
USER app

# Expose port (Heroku will override with $PORT)
EXPOSE 5000

# Use PORT environment variable for Heroku compatibility
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 2 --threads 4 --timeout 60 server.app:app