#!/bin/bash

# Create and activate Python virtual environment if it doesn't exist
cd backend
if [ ! -d "venv" ]; then
    python -m venv venv
    ./venv/bin/pip install flask sqlalchemy
fi

# Start Flask backend with virtual environment
./venv/bin/python app.py &

# Start React frontend
cd ../frontend
npm run dev &

# Wait for both processes
wait
