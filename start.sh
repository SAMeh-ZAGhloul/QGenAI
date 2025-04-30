#!/bin/bash

# Set error handling
set -e

echo "Starting QGenAI application..."

# Check for required dependencies
check_dependency() {
  if ! command -v $1 &> /dev/null; then
    echo "Error: $1 is required but not installed."
    exit 1
  fi
}

check_dependency python3
check_dependency uv
check_dependency npm

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv backend/venv
fi

# Start backend server
echo "Starting backend server..."
cd backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies with uv
echo "Installing backend dependencies with uv..."
uv pip install -r requirements.txt

# Start the backend server
echo "Starting backend server..."
python3 main.py &
BACKEND_PID=$!

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 3

# Start frontend dev server
echo "Starting frontend server..."
cd ../frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Start the frontend server
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

# Handle script termination
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Application started successfully!"
echo "Backend running at http://localhost:8000"
echo "Frontend running at http://localhost:5173"
echo "Press Ctrl+C to stop all servers"

# Keep script running
wait