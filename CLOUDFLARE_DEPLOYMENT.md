# Cloudflare Deployment Guide for Cookie Catcher

This guide provides specific instructions for deploying Cookie Catcher on a Linux server with Apache and Cloudflare, using port 8080.

## Prerequisites

- A Linux server (Ubuntu 20.04 LTS or later recommended)
- Apache web server installed
- Cloudflare account with your domain already set up
- Port 8080 forwarded through Cloudflare
- Node.js 18.x or later installed

## Deployment Steps

### 1. Server Preparation

```bash
# Update your system
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y git build-essential

# Install Node.js 18.x if not already installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Application Deployment

```bash
# Clone the repository
git clone <repository-url> /var/www/cookie-catcher
cd /var/www/cookie-catcher

# Install dependencies
npm install

# Build the application
npm run build

# Create necessary directories
mkdir -p valid-cookies cookie-backups temp-uploads
chmod 755 valid-cookies cookie-backups temp-uploads

# Start the application with PM2
pm2 start unified-server.js --name cookie-catcher

# Configure PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs
pm2 save
```

### 3. Apache Configuration

```bash
# Enable required Apache modules
sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite

# Create Apache configuration file
sudo nano /etc/apache2/sites-available/cookie-catcher.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Proxy to Node.js application running on port 8080
    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
    
    # WebSocket support (if needed)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:8080/$1 [P,L]
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/cookie-catcher-error.log
    CustomLog ${APACHE_LOG_DIR}/cookie-catcher-access.log combined
</VirtualHost>
```

```bash
# Enable the site and restart Apache
sudo a2ensite cookie-catcher.conf
sudo apache2ctl configtest
sudo systemctl restart apache2
```

### 4. Cloudflare Configuration

1. **DNS Settings**:
   - Ensure you have an A record pointing to your server's IP address
   - Make sure the "Proxied" option is enabled (orange cloud icon)

2. **SSL/TLS Settings**:
   - Set the encryption mode to "Full" or "Full (strict)" if you have SSL on your server
   - Enable "Always Use HTTPS" in the Edge Certificates section

3. **Page Rules** (optional):
   - Create a page rule for caching static assets if needed
   - Example: `yourdomain.com/static/*` with the setting "Cache Level: Cache Everything"

4. **Network Settings**:
   - Ensure HTTP/3 is enabled for better performance
   - Enable Brotli compression

### 5. Verify Deployment

1. Check if the application is running:
   ```bash
   pm2 status cookie-catcher
   ```

2. Check the application logs:
   ```bash
   pm2 logs cookie-catcher
   ```

3. Visit your domain in a browser to verify the application is working correctly.

## Troubleshooting

### Application Not Starting

Check the logs for errors:
```bash
pm2 logs cookie-catcher
```

Common issues:
- Port 8080 already in use: Change the port in the .env file and update your Apache configuration
- Missing dependencies: Run `npm install`
- Permission issues: Check ownership and permissions of the application directory

### Apache Configuration Issues

Check Apache error logs:
```bash
sudo tail -f /var/log/apache2/error.log
```

Test your Apache configuration:
```bash
sudo apache2ctl configtest
```

### Cloudflare Connection Issues

- Verify that your server's IP address is correctly set in Cloudflare DNS
- Check that the Cloudflare proxy is enabled (orange cloud icon)
- Ensure port 8080 is properly forwarded through Cloudflare
- Check your server's firewall settings to ensure it allows incoming connections

## Maintenance

### Updating the Application

```bash
cd /var/www/cookie-catcher
git pull
npm install
npm run build
pm2 restart cookie-catcher
```

### Backing Up

Create a backup script:
```bash
nano backup.sh
```

Add the following content:
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/cookie-catcher"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup cookies
tar -czf $BACKUP_DIR/cookies_$TIMESTAMP.tar.gz valid-cookies

# Backup application code
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz --exclude="node_modules" --exclude="dist" .

echo "Backup completed: $BACKUP_DIR/cookies_$TIMESTAMP.tar.gz and $BACKUP_DIR/app_$TIMESTAMP.tar.gz"
```

Make it executable and set up a cron job:
```bash
chmod +x backup.sh
crontab -e
```

Add the following line for daily backups at 2 AM:
```
0 2 * * * /var/www/cookie-catcher/backup.sh
```
