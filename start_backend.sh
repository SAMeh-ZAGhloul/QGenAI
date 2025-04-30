#!/bin/bash

# Set error handling
set -e

echo "Starting QGenAI backend server..."

# Check for required dependencies
check_dependency() {
  if ! command -v $1 &> /dev/null; then
    echo "Error: $1 is required but not installed."
    exit 1
  fi
}

check_dependency python3
check_dependency uv

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
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo "Backend server stopped."
