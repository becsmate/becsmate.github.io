#!/bin/bash
# Show network information for development servers

echo "🌐 Development Server Network Information"
echo "========================================"
echo ""

# Get IP addresses
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "Unable to detect")
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "Unable to detect")

echo "📍 Network Addresses:"
echo "   Localhost:    127.0.0.1"
echo "   Local IP:     $LOCAL_IP"
echo "   Public IP:    $PUBLIC_IP"
echo ""

echo "🚀 Development URLs:"
echo "   Frontend (Local):     http://localhost:3000"
echo "   Frontend (Network):   http://$LOCAL_IP:3000"
echo "   Backend (Local):      http://localhost:5000"
echo "   Backend (Network):    http://$LOCAL_IP:5000"
echo ""

echo "🔧 API Endpoints:"
echo "   Health Check:         http://$LOCAL_IP:5000/api/health"
echo "   About Info:           http://$LOCAL_IP:5000/api/about"
echo ""

echo "📱 Mobile/External Access:"
echo "   Use the 'Network' URLs above from other devices"
echo "   Make sure your firewall allows ports 3000 and 5000"
echo ""

# Check if ports are in use
echo "🔍 Port Status:"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "   Port 3000: ✅ In use (Frontend)"
else
    echo "   Port 3000: ❌ Available"
fi

if lsof -i :5000 >/dev/null 2>&1; then
    echo "   Port 5000: ✅ In use (Backend)"
else
    echo "   Port 5000: ❌ Available"
fi

echo ""