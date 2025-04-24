#!/bin/bash

# Simple Deployment Script for Cookie Checker
# This script helps deploy the application on a Linux server

# Exit on any error
set -e

echo "=== Cookie Checker Simple Deployment ==="
echo "Starting deployment process..."

# Create required directories
echo "Creating required directories..."
mkdir -p valid-cookies

# Set proper permissions
echo "Setting permissions..."
chmod 755 valid-cookies

# Generate some test cookies
echo "Generating test cookies..."
node generate-cookies.js 10

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Installing PM2 globally..."
  npm install -g pm2
fi

# Start the simple API server with PM2
echo "Starting simple API server with PM2..."
pm2 start simple-api-server.js --name "cookie-api-server"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
echo "Setting up PM2 to start on system boot..."
pm2 startup

echo "=== Deployment Complete ==="
echo "Simple API Server is now running!"
echo "You can manage it using PM2 commands:"
echo "  - pm2 status: Check status"
echo "  - pm2 logs: View logs"
echo "  - pm2 restart cookie-api-server: Restart the API server"
echo "  - pm2 stop cookie-api-server: Stop the API server"
