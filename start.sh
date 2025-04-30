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
check_dependency pip3
check_dependency npm

# Start backend server
echo "Starting backend server..."
cd backend
pip3 install -r requirements.txt
python3 main.py &
BACKEND_PID=$!

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 3

# Start frontend dev server
echo "Starting frontend server..."
cd ../frontend
npm install
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

# Keep script running
wait