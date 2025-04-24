#!/bin/bash
# Cookie Catcher Deployment Script for Linux

# Exit on error
set -e

# Configuration
APP_NAME="cookie-catcher"
APP_DIR=$(pwd)
NODE_VERSION="18"
PM2_PROCESS_NAME="cookie-catcher"

# Print banner
echo "=================================================="
echo "  Cookie Catcher v2.0 Deployment Script"
echo "=================================================="
echo "Starting deployment at $(date)"
echo "Application directory: $APP_DIR"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo"
  exit 1
fi

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Installing Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
  apt-get install -y nodejs
else
  NODE_CURRENT_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
  if [ "$NODE_CURRENT_VERSION" -lt "$NODE_VERSION" ]; then
    echo "Node.js version $NODE_CURRENT_VERSION is too old. Installing Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
    apt-get install -y nodejs
  else
    echo "Node.js version $(node -v) is sufficient."
  fi
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
else
  echo "PM2 is already installed."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p valid-cookies cookie-backups temp-uploads

# Set proper permissions
echo "Setting permissions..."
chown -R $(whoami):$(whoami) $APP_DIR
chmod 755 valid-cookies cookie-backups temp-uploads

# Stop existing PM2 process if running
if pm2 list | grep -q "$PM2_PROCESS_NAME"; then
  echo "Stopping existing PM2 process..."
  pm2 stop $PM2_PROCESS_NAME
  pm2 delete $PM2_PROCESS_NAME
fi

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 start unified-server.js --name $PM2_PROCESS_NAME

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Configure PM2 to start on system boot
echo "Configuring PM2 to start on system boot..."
pm2 startup

# Create backup script
echo "Creating backup script..."
cat > backup.sh << 'EOL'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/cookie-catcher"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup cookies
tar -czf $BACKUP_DIR/cookies_$TIMESTAMP.tar.gz valid-cookies

# Backup application code
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz --exclude="node_modules" --exclude="dist" .

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "cookies_*.tar.gz" -type f -mtime +7 -delete
find $BACKUP_DIR -name "app_*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/cookies_$TIMESTAMP.tar.gz and $BACKUP_DIR/app_$TIMESTAMP.tar.gz"
EOL

chmod +x backup.sh

# Set up cron job for daily backups
echo "Setting up cron job for daily backups..."
(crontab -l 2>/dev/null || echo "") | grep -v "/var/www/cookie-catcher/backup.sh" | { cat; echo "0 2 * * * $APP_DIR/backup.sh"; } | crontab -

# Print completion message
echo "=================================================="
echo "  Deployment completed successfully!"
echo "=================================================="
echo "Application is now running at http://localhost:8080"
echo ""
echo "To check status: pm2 status $PM2_PROCESS_NAME"
echo "To view logs: pm2 logs $PM2_PROCESS_NAME"
echo "To restart: pm2 restart $PM2_PROCESS_NAME"
echo ""
echo "Next steps:"
echo "1. Configure Nginx as a reverse proxy (recommended)"
echo "2. Set up SSL with Let's Encrypt"
echo "3. Configure your domain to point to this server"
echo "4. Update your AdSense configuration if needed"
echo "=================================================="
