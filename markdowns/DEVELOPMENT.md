# Development Setup with Hot Reload

This document explains how to set up fast reload for both frontend and backend development.

## 🚀 Quick Start

### Option 1: Automated Script (Recommended)
```bash
# Start both frontend and backend with hot reload
npm run dev
# or
./scripts/dev.sh
```

### Option 2: Manual Setup
```bash
# Terminal 1: Backend with hot reload
npm run dev:backend
# or
flask --app server.app run --host=0.0.0.0 --port=5000 --debug --reload

# Terminal 2: Frontend with hot reload  
npm run dev:frontend
# or
cd client && npm start
```

### Option 3: Docker Development
```bash
# Full stack with Docker hot reload
npm run dev:docker
# or
docker-compose -f docker-compose.dev.yml up
```

## 🏗️ Development Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React Dev     │    │   Flask Dev     │
│   localhost:3000│◄──►│   localhost:5000│
│   Hot Reload    │    │   Hot Reload    │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Webpack Dev   │    │   SQLite DB     │
│   Server        │    │   instance/     │
└─────────────────┘    └─────────────────┘
```

## ⚡ Hot Reload Features

### Frontend (React)
- **File watching**: `src/` directory
- **Fast Refresh**: React Fast Refresh enabled
- **Auto proxy**: API calls to `http://localhost:5000`
- **Live reloading**: Browser auto-refreshes on changes
- **Error overlay**: In-browser error display

### Backend (Flask)
- **File watching**: `server/` directory
- **Auto restart**: Server restarts on Python file changes
- **Debug mode**: Full Flask debugger with interactive console
- **CORS enabled**: For frontend development
- **DB auto-init**: Database created automatically

## 📁 Watched Directories

### Frontend
```
client/src/
├── components/ ✓ Hot reload
├── pages/      ✓ Hot reload  
├── hooks/      ✓ Hot reload
├── api/        ✓ Hot reload
├── contexts/   ✓ Hot reload
└── utils/      ✓ Hot reload
```

### Backend  
```
server/
├── routes/     ✓ Auto restart
├── models.py   ✓ Auto restart
├── config.py   ✓ Auto restart
├── extensions.py ✓ Auto restart
└── __init__.py ✓ Auto restart
```

## 🔧 Configuration

### Environment Variables
```bash
# Backend
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///instance/dev.db
JWT_SECRET_KEY=dev-secret-key
CORS_ORIGINS=http://localhost:3000

# Frontend  
CHOKIDAR_USEPOLLING=true    # For Docker
FAST_REFRESH=true           # React Fast Refresh
```

### React Proxy Setup
The frontend automatically proxies API calls to the backend:
```json
// client/package.json
{
  "proxy": "http://localhost:5000"
}
```

This means:
- `fetch('/api/health')` → `http://localhost:5000/api/health`
- `axios.get('/api/about')` → `http://localhost:5000/api/about`

## 🐛 VS Code Debugging

Launch both frontend and backend debugging:
```bash
# Press F5 or use Command Palette
> Debug: Start Debugging > Full Stack Debug
```

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only  
npm run dev:backend      # Backend only
npm run dev:docker       # Docker development
npm run dev:init         # Initialize database

# Setup
npm run local:setup      # Install all dependencies
npm run local:install    # Install frontend deps only

# Production
npm run build           # Build for production
npm run clean           # Clean build artifacts
```

## 🔄 Development Workflow

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **Make changes:**
   - Frontend: Edit files in `client/src/` → Browser updates instantly
   - Backend: Edit files in `server/` → Server restarts automatically

3. **API Testing:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000/api/health`

4. **Database:**
   - SQLite: `instance/dev.db` (auto-created)
   - View with: DB Browser for SQLite

## 🐳 Docker Development

The Docker setup includes:
- **Volume mounting** for hot reload
- **File watching** with polling for cross-platform support
- **Automatic installation** of dependencies
- **Environment isolation**

```bash
# Start with Docker
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill processes on development ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

### Frontend Not Hot Reloading
1. Check if `FAST_REFRESH=true` is set
2. Restart the frontend server
3. Clear browser cache

### Backend Not Restarting
1. Check if `FLASK_DEBUG=1` is set
2. Verify file permissions
3. Check for syntax errors in Python files

### API Calls Failing
1. Verify backend is running on port 5000
2. Check CORS configuration
3. Confirm proxy setting in `client/package.json`

## 🎯 Performance Tips

1. **Exclude large directories** from file watching
2. **Use .gitignore** to avoid watching build artifacts  
3. **Enable polling** in Docker for better cross-platform support
4. **Use incremental builds** when possible

## 🔗 Useful URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Backend Info**: http://localhost:5000/api/about
- **Database**: `instance/dev.db` (SQLite)

Happy coding! 🎉