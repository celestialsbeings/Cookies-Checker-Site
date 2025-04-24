# 🌐 Apache + Cloudflare Deployment Guide

This guide provides specific instructions for deploying Cookie Catcher on a Linux server with Apache already running on port 8080 and Cloudflare forwarding that port to port 80.

## 📋 Prerequisites

- Linux server with Apache already running on port 8080
- Cloudflare account with your domain already set up
- Node.js 18.x or later installed

## 🚀 Deployment Steps

### 1️⃣ Clone the Repository

```bash
# Clone the repository to your desired location
git clone <repository-url> /var/www/cookie-catcher
cd /var/www/cookie-catcher
```

### 2️⃣ Install Dependencies and Build

```bash
# Install Node.js dependencies
npm install

# Build the application
npm run build

# Create necessary directories
mkdir -p valid-cookies cookie-backups temp-uploads
chmod 755 valid-cookies cookie-backups temp-uploads
```

### 3️⃣ Configure the Application Port

The application needs to run on a different port than Apache. We'll use port 3000.

```bash
# Create or edit the .env file
cat > .env << 'EOL'
# Server Configuration
PORT=3000

# Frontend Configuration
VITE_GOOGLE_AD_CLIENT=ca-pub-2167928215183601
VITE_GOOGLE_AD_SLOT=1562827284
EOL
```

### 4️⃣ Configure Apache to Proxy Requests

Since Apache is already running on port 8080, we need to configure it to proxy requests to our Node.js application running on port 3000.

```bash
# Create the Apache configuration file
sudo nano /etc/apache2/sites-available/cookie-catcher.conf
```

Add the following configuration:

```apache
<VirtualHost *:8080>
    # Replace with your domain name if needed
    # ServerName yourdomain.com
    # ServerAlias www.yourdomain.com
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Proxy to Node.js application running on port 3000
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support (if needed)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:3000/$1 [P,L]
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/cookie-catcher-error.log
    CustomLog ${APACHE_LOG_DIR}/cookie-catcher-access.log combined
</VirtualHost>
```

Enable the required Apache modules and the site:

```bash
# Enable required modules
sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite

# Enable the site
sudo a2ensite cookie-catcher.conf

# Test the configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

### 5️⃣ Start the Application with PM2

```bash
# Install PM2 if not already installed
sudo npm install -g pm2

# Start the application
pm2 start unified-server.js --name cookie-catcher

# Configure PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs
pm2 save
```

### 6️⃣ Verify the Deployment

1. Check if the application is running:
   ```bash
   pm2 status cookie-catcher
   ```

2. Check the application logs:
   ```bash
   pm2 logs cookie-catcher
   ```

3. Visit your domain in a browser to verify the application is working correctly.

## ⚠️ Troubleshooting

### Application Not Starting

If you see an error like "Error: listen EADDRINUSE: address already in use 0.0.0.0:3000":

1. Check if another process is using port 3000:
   ```bash
   sudo lsof -i :3000
   ```

2. If needed, change the port in the .env file to a different port (e.g., 3001) and update the Apache configuration accordingly.

### Apache Proxy Not Working

1. Check Apache error logs:
   ```bash
   sudo tail -f /var/log/apache2/error.log
   sudo tail -f /var/log/apache2/cookie-catcher-error.log
   ```

2. Verify that all required modules are enabled:
   ```bash
   sudo apache2ctl -M | grep proxy
   ```

3. Make sure the application is running:
   ```bash
   curl http://localhost:3000
   ```

## 🔄 Updating the Application

```bash
cd /var/www/cookie-catcher
git pull
npm install
npm run build
pm2 restart cookie-catcher
```
