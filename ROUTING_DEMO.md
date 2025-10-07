# 🎯 Frontend Routing Demo

This demonstrates how **frontend routing** works with React Router while the Flask backend only handles API calls.

## 🛣️ Available Routes

### Frontend Routes (React Router)
- **`/`** → HomePage component
- **`/about`** → AboutPage component  
- **`/projects`** → ProjectsPage component
- **`/contact`** → ContactPage component

### Backend Routes (Flask API)
- **`/api/health`** → Health check endpoint
- **`/api/about`** → Site information endpoint

## 🔧 How It Works

### 1. **Backend Strategy** 
```python
# Flask only handles:
@app.route('/api/*')          # API endpoints
@app.route('/<path:filename>') # Static files (CSS, JS, images)

# Everything else → serves index.html for React routing
return send_from_directory(app.static_folder, 'index.html')
```

### 2. **Frontend Strategy**
```tsx
// React Router handles client-side routing
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/projects" element={<ProjectsPage />} />
  <Route path="/contact" element={<ContactPage />} />
</Routes>
```

## ✅ What This Achieves

1. **🚀 Single Page Application** - No page refreshes, instant navigation
2. **📱 Better UX** - Smooth transitions between pages
3. **🔗 Bookmarkable URLs** - Each route has its own URL
4. **⚡ Fast Loading** - Only initial bundle load, then client-side routing
5. **🎨 Consistent Layout** - Navigation and theme persist across routes

## 🧪 Test It Out

```bash
# Start development environment
docker-compose up

# Or run production build
docker build -t becsmate-site .
docker run -p 5000:5000 becsmate-site
```

**Try these URLs:**
- http://localhost:5000/ (Home)
- http://localhost:5000/about (About page)
- http://localhost:5000/projects (Projects page) 
- http://localhost:5000/contact (Contact page)
- http://localhost:5000/api/health (API endpoint)

**Notice:** All frontend routes serve the same HTML file, but React Router shows different components based on the URL! 🎉

## 📁 Project Structure

```
src/
├── components/
│   └── Navigation.tsx     # Navigation bar with routing
├── pages/
│   ├── HomePage.tsx       # / route
│   ├── AboutPage.tsx      # /about route
│   ├── ProjectsPage.tsx   # /projects route
│   └── ContactPage.tsx    # /contact route
└── App.tsx                # Main router setup
```

This is a perfect example of **separation of concerns**: Flask handles data/API, React handles UI and routing! 🎯