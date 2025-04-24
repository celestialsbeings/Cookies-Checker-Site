#!/bin/bash
# Cookie Catcher Backup Script

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/cookie-catcher"
APP_DIR=$(pwd)

# Create backup directory
mkdir -p $BACKUP_DIR

# Print start message
echo "Starting backup at $(date)"
echo "Application directory: $APP_DIR"
echo "Backup directory: $BACKUP_DIR"

# Backup cookies
echo "Backing up cookies..."
tar -czf $BACKUP_DIR/cookies_$TIMESTAMP.tar.gz valid-cookies
echo "Cookie backup created: $BACKUP_DIR/cookies_$TIMESTAMP.tar.gz"

# Backup application code
echo "Backing up application code..."
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz --exclude="node_modules" --exclude="dist" .
echo "Application backup created: $BACKUP_DIR/app_$TIMESTAMP.tar.gz"

# Cleanup old backups (keep last 7 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "cookies_*.tar.gz" -type f -mtime +7 -delete
find $BACKUP_DIR -name "app_*.tar.gz" -type f -mtime +7 -delete

# Print completion message
echo "Backup completed at $(date)"
echo "Files:"
echo "- $BACKUP_DIR/cookies_$TIMESTAMP.tar.gz"
echo "- $BACKUP_DIR/app_$TIMESTAMP.tar.gz"
