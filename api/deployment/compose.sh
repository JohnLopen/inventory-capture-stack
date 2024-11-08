#!/bin/bash

# Navigate to the app root directory
cd "$(dirname "$0")/.."

# Set variables
APP_NAME="upstimate-api"
DOCKER_IMAGE="upstimate-api-image"
DOCKER_CONTAINER="upstimate-api-container"
PORT=3001  # Updated to use custom port 3001
ENV_FILE="../.env"  # Path to your .env file

# Step 1: Build the TypeScript files
echo "Building TypeScript files..."
npm run build

# Step 2: Build the Docker image
echo "Building Docker image..."
docker build -t $DOCKER_IMAGE -f deployment/Dockerfile .

# Step 3: Stop and remove any existing container with the same name
if [ "$(docker ps -aq -f name=$DOCKER_CONTAINER)" ]; then
    echo "Stopping and removing existing container..."
    docker stop $DOCKER_CONTAINER
    docker rm $DOCKER_CONTAINER
fi

# Step 4: Run the Docker container with custom port 3001 and load environment variables from .env file
echo "Starting a new container on port $PORT..."
docker run -d --name $DOCKER_CONTAINER -p $PORT:3000 --env-file $ENV_FILE $DOCKER_IMAGE

echo "Deployment complete. App is running on port $PORT."
