#!/bin/bash

# Employee Task Tracker - Setup Script (Linux/Mac)
# This script will set up both frontend and backend

echo "======================================"
echo "Employee Task Tracker - Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js is installed: $NODE_VERSION"
else
    echo "✗ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Setup Backend
echo ""
echo "Setting up Backend..."
echo "----------------------"

cd backend || exit

echo "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Backend dependencies installed"
else
    echo "✗ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Initializing database..."
npm run init-db

if [ $? -eq 0 ]; then
    echo "✓ Database initialized with sample data"
else
    echo "✗ Failed to initialize database"
    exit 1
fi

cd ..

# Setup Frontend
echo ""
echo "Setting up Frontend..."
echo "----------------------"

cd frontend || exit

echo "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Frontend dependencies installed"
else
    echo "✗ Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Success Message
echo ""
echo "======================================"
echo "✓ Setup Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. Start the Backend Server:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. In a NEW terminal, start the Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open your browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "Happy Coding! 🚀"
