# Use an official Python runtime as a parent image
FROM ubuntu:latest

# Set the working directory
WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . .

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Install Node.js dependencies for the React app
RUN cd backend/websocket/src && npm install

# Expose the ports for FastAPI and React
EXPOSE 9400
EXPOSE 3000

# Start both applications
CMD ["bash", "-c", "cd backend/websocket/src && npm start & cd ../.. && python3 fastapi_websocket.py"]