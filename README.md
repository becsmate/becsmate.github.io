# becsmate.me - Personal Website

A modern personal website built with Flask, React TypeScript, and Material-UI, fully containerized with Docker for easy development and deployment.

## 🚀 Tech Stack

- **Backend**: Python 3.11, Flask 3.0
- **Frontend**: React 18, TypeScript, Material-UI 5
- **Containerization**: Docker & Docker Compose
- **Deployment**: Heroku (Container Stack)
- **Domain**: becsmate.me (Namecheap)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Flask Backend  │
│   (Port 3000)   │◄──►│   (Port 5000)   │
│   TypeScript    │    │     Python      │
│   Material-UI   │    │   REST API      │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
            ┌─────────────┐
            │   Docker    │
            │  Container  │
            └─────────────┘
```

## 🛠️ Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start

1. **Clone and setup**:
   ```bash
   git clone https://github.com/becsmate/becsmate.github.io.git
   cd becsmate.github.io
   ./scripts/setup.sh
   ```

2. **Start development environment**:
   ```bash
   # Full stack with Docker (recommended)
   npm run dev
   
   # Frontend only with hot reload
   npm run dev:frontend
   
   # Local development (no Docker)
   npm run local:dev
   ```

3. **Access your app**:
   - Full app: http://localhost:5000
   - Frontend dev: http://localhost:3000
   - API endpoints: http://localhost:5000/api/*

### Available Scripts

- `npm run dev` - Full stack Docker development
- `npm run dev:frontend` - Frontend-only Docker development
- `npm run prod` - Production-like Docker environment
- `npm run local:dev` - Local development without Docker
- `npm run build` - Build frontend for production
- `npm run clean` - Clean build artifacts

## 🐳 Docker

### Development
```bash
# Build and start all services
docker-compose up --build

# Start with frontend hot reload
docker-compose --profile dev up

# Production-like environment
docker-compose --profile prod up
```

### Production Build
```bash
# Build production image
docker build -t becsmate-site .

# Run production container
docker run -p 5000:5000 -e PORT=5000 becsmate-site
```

## 🌐 Deployment

### Heroku (Current)

The site uses Heroku's container stack with automatic deployments.

1. **Set up Heroku app**:
   ```bash
   heroku create becsmate-site
   heroku stack:set container
   heroku config:set FLASK_ENV=production
   heroku config:set CORS_ORIGINS=https://becsmate.me
   ```

2. **Deploy**:
   ```bash
   git push heroku main
   ```

3. **Custom domain** (already configured):
   ```bash
   heroku domains:add becsmate.me
   heroku domains:add www.becsmate.me
   ```

### Environment Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `FLASK_ENV` | `development` | `production` | Flask environment |
| `PORT` | `5000` | Set by Heroku | Server port |
| `CORS_ORIGINS` | `http://localhost:3000` | `https://becsmate.me` | Allowed CORS origins |

## 📁 Project Structure

```
becsmate.github.io/
├── client/                 # React TypeScript frontend
│   ├── public/            # Static assets
│   ├── src/               # React components and logic
│   └── package.json       # Frontend dependencies
├── server/                # Flask backend
│   ├── app.py            # Main Flask application
│   └── __init__.py       # Python package init
├── scripts/              # Development scripts
│   └── setup.sh          # Development setup script
├── deploy/               # Deployment configurations
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Multi-stage Docker build
├── heroku.yml          # Heroku container configuration
├── requirements.txt    # Python dependencies
├── package.json       # Root package.json for Heroku
└── README.md         # This file
```

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `GET /api/about` - Site information and tech stack
- `GET /` - Serves React app (catch-all)

## 🎨 Features

- ✅ Responsive Material-UI design
- ✅ Dark/Light theme toggle
- ✅ Docker containerization
- ✅ Hot reload in development
- ✅ Production-optimized builds
- ✅ Heroku deployment ready
- ✅ Custom domain support
- ✅ CORS configuration
- ✅ TypeScript support
- ✅ Modern React patterns

## 🔄 Development Workflow

1. Make changes to code
2. Changes auto-reload in Docker development mode
3. Test locally at http://localhost:5000
4. Commit and push to trigger Heroku deployment
5. Site automatically deploys to https://becsmate.me

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   docker-compose down
   # or
   lsof -ti:5000 | xargs kill -9
   ```

2. **Docker build issues**:
   ```bash
   docker system prune -a
   docker-compose build --no-cache
   ```

3. **Frontend not loading**:
   - Check if `client/build` directory exists
   - Run `npm run build` to build frontend
   - Verify API endpoints are working at `/api/health`

## 📝 License

This is a personal website. Feel free to use as inspiration for your own site!

## 🤝 Contact

- Website: [becsmate.me](https://becsmate.me)
- GitHub: [@becsmate](https://github.com/becsmate)
- Email: hello@becsmate.me