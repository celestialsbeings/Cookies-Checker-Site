#!/bin/bash
# Cookie Catcher Deployment Script

# Exit on error
set -e

echo "=================================================="
echo "  Cookie Catcher Deployment Script"
echo "=================================================="

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p valid-cookies cookie-backups temp-uploads
chmod 755 valid-cookies cookie-backups temp-uploads

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "cookie-catcher"; then
    echo "Stopping existing PM2 process..."
    pm2 stop cookie-catcher
    pm2 delete cookie-catcher
fi

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 start unified-server.js --name cookie-catcher

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

echo "=================================================="
echo "  Deployment completed successfully!"
echo "=================================================="
echo "Application is now running on port 3000"
echo ""
echo "To check status: pm2 status cookie-catcher"
echo "To view logs: pm2 logs cookie-catcher"
echo "To restart: pm2 restart cookie-catcher"
echo "=================================================="
