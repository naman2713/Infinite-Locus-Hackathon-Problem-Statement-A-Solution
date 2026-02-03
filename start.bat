@echo off
echo ========================================
echo  Real-time Collaboration Platform
echo  Quick Start Script
echo ========================================
echo.

:: Check if MongoDB is needed
echo Checking MongoDB connection...
echo.

:: Check if backend dependencies are installed
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

:: Check if frontend dependencies are installed
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

:: Check if .env files exist
if not exist "backend\.env" (
    echo Creating backend .env file...
    copy backend\.env.example backend\.env
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env and set your MongoDB URI and JWT_SECRET
    echo.
)

if not exist "frontend\.env" (
    echo Creating frontend .env file...
    copy frontend\.env.example frontend\.env
    echo.
)

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Make sure MongoDB is running
echo    - Local: Run 'mongod' in a terminal
echo    - Atlas: Already running in cloud
echo.
echo 2. Start Backend (in one terminal):
echo    cd backend
echo    npm run dev
echo.
echo 3. Start Frontend (in another terminal):
echo    cd frontend
echo    npm start
echo.
echo The app will open at http://localhost:3000
echo.
echo For detailed setup instructions, see SETUP.md
echo ========================================
pause
