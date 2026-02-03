#!/bin/bash

echo "========================================"
echo " Real-time Collaboration Platform"
echo " Quick Start Script"
echo "========================================"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo ""
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and set your MongoDB URI and JWT_SECRET"
    echo ""
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
    echo ""
fi

echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Make sure MongoDB is running"
echo "   - Local: Run 'mongod' in a terminal"
echo "   - Atlas: Already running in cloud"
echo ""
echo "2. Start Backend (in one terminal):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start Frontend (in another terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "The app will open at http://localhost:3000"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo "========================================"
