# 🌐 Cookie Catcher Deployment Guide
## For Apache (port 8080) + Cloudflare Setup

This guide provides specific instructions for deploying Cookie Catcher on a Linux server with Apache already running on port 8080 and Cloudflare forwarding that port to port 80.

## 📋 Prerequisites

- Linux server with Apache already running on port 8080
- Cloudflare account with your domain already set up
- Node.js 18.x or later installed

## 🚀 Quick Deployment

The easiest way to deploy is using the provided script:

```bash
chmod +x deploy-with-apache.sh
./deploy-with-apache.sh
```

This script will:
1. Install dependencies
2. Build the application
3. Configure PM2 to run the application on port 3000
4. Configure Apache to proxy requests from port 8080 to port 3000

## 🔧 Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1️⃣ Install Dependencies and Build

```bash
# Install Node.js dependencies
npm install

# Build the application
npm run build

# Create necessary directories
mkdir -p valid-cookies cookie-backups temp-uploads
chmod 755 valid-cookies cookie-backups temp-uploads
```

### 2️⃣ Start the Application with PM2

```bash
# Install PM2 if not already installed
npm install -g pm2

# Start the application
pm2 start unified-server.js --name cookie-catcher

# Configure PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs
pm2 save
```

### 3️⃣ Configure Apache

```bash
# Copy the Apache configuration file
sudo cp cookie-catcher-apache.conf /etc/apache2/sites-available/cookie-catcher.conf

# Enable required modules
sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite

# Enable the site
sudo a2ensite cookie-catcher.conf

# Test the configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

## ⚠️ Troubleshooting

### Application Not Starting

If you see an error like "Error: listen EADDRINUSE: address already in use 0.0.0.0:3000":

1. Check if another process is using port 3000:
   ```bash
   sudo lsof -i :3000
   ```

2. If needed, change the port in the unified-server.js file to a different port (e.g., 3001) and update the Apache configuration accordingly.

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
# Pull the latest changes
git pull

# Install dependencies and build
npm install
npm run build

# Restart the application
pm2 restart cookie-catcher
```

## 📝 Important Notes

1. The application is configured to run on port 3000 to avoid conflict with Apache on port 8080.
2. Apache is configured to proxy requests from port 8080 to port 3000.
3. Cloudflare is already set up to forward port 8080 to port 80 of your website.

This setup allows you to keep your existing Apache and Cloudflare configuration while adding the Cookie Catcher application to your server.
