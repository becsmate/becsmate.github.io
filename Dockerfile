# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Flask server
FROM python:3.11-slim AS backend

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ .

# React build sits at /client/build so static_folder='../client/build' resolves correctly
COPY --from=frontend-build /app/client/build /client/build

ENV FLASK_APP=app
ENV FLASK_ENV=production
ENV PORT=5000

# Create instance directory for any file-based storage
RUN mkdir -p /app/instance

# Create non-root user for security (required by some platforms like Heroku)
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Use PORT env variable with fallback for Heroku compatibility
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 2 --threads 4 --timeout 60 app:app