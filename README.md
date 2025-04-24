# 🍪 Cookie Catcher v2.0

<div align="center">

  ![Cookie Catcher Logo](https://img.shields.io/badge/🍪-Cookie%20Catcher-C084FC?style=for-the-badge)

  [![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

  *A modern web application for cookie management and distribution with an interactive game interface and comprehensive admin panel.*
</div>

<p align="center">
  <img src="https://img.shields.io/badge/🎮-Interactive%20Game-00FFFF?style=flat-square" alt="Interactive Game">
  <img src="https://img.shields.io/badge/🔒-Secure%20Token%20System-C084FC?style=flat-square" alt="Secure Token System">
  <img src="https://img.shields.io/badge/🌙-Dark%20Theme-0A0A0A?style=flat-square" alt="Dark Theme">
  <img src="https://img.shields.io/badge/📱-Mobile%20Optimized-00FFFF?style=flat-square" alt="Mobile Optimized">
</p>

---

## ✨ Features

- 🎮 **Interactive Cookie Catcher Game** - Fun way for users to earn and claim cookies
- 🔒 **Secure Token-Based System** - Prevents unauthorized cookie claiming
- 🌙 **Modern Dark UI** - Sleek interface with animations and responsive design
- 🛠️ **Comprehensive Admin Panel** - Complete cookie management dashboard
- 💰 **Google AdSense Integration** - Built-in monetization capabilities
- 📱 **Mobile Optimized** - Perfect experience on both desktop and mobile devices
- ⚡ **High Performance** - Optimized for speed and efficiency

## 🚀 Getting Started

### 📋 Requirements

- 📦 Node.js 18.x or higher
- 📦 npm 8.x or higher
- 🖥️ Linux server (for production deployment)
- 🔐 Domain with HTTPS for AdSense integration (production)

### 💻 Local Development Setup (Windows)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cookie-catcher
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create necessary directories:**
   ```bash
   mkdir -p valid-cookies cookie-backups temp-uploads
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Or run the unified server directly:
   ```bash
   node unified-server.js
   ```

5. **Access the application:**

   🌐 [http://localhost:8080](http://localhost:8080)

## Production Deployment on Linux

### Prerequisites

- A Linux server (Ubuntu 20.04 LTS or later recommended)
- Node.js 18.x or later installed
- A domain name with HTTPS configured (for AdSense)
- Root or sudo access

### Step 1: Server Preparation

1. Update your system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install Node.js if not already installed:
   ```bash
   # Add NodeSource repository
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

   # Install Node.js
   sudo apt install -y nodejs

   # Verify installation
   node -v
   npm -v
   ```

3. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```

4. Install required system dependencies:
   ```bash
   sudo apt install -y git build-essential
   ```

### Step 2: Application Deployment

1. Clone the repository:
   ```bash
   git clone <repository-url> /var/www/cookie-catcher
   cd /var/www/cookie-catcher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Create necessary directories and set permissions:
   ```bash
   mkdir -p valid-cookies cookie-backups temp-uploads
   chmod 755 valid-cookies cookie-backups temp-uploads
   ```

5. Create a .env file (optional for custom configuration):
   ```bash
   touch .env
   nano .env
   ```

   Add any custom configuration:
   ```
   PORT=8080
   VITE_GOOGLE_AD_CLIENT=your-adsense-client-id
   VITE_GOOGLE_AD_SLOT=your-adsense-slot-id
   ```

6. Start the application with PM2:
   ```bash
   pm2 start unified-server.js --name cookie-catcher
   ```

7. Configure PM2 to start on system boot:
   ```bash
   pm2 startup
   # Run the command that PM2 outputs
   pm2 save
   ```

### Step 3: Apache Configuration with Cloudflare

Since you're using Cloudflare as your proxy with Apache and port 8080 is already forwarded, you need to configure Apache to proxy requests to your Node.js application.

1. Ensure Apache is installed and the required modules are enabled:
   ```bash
   sudo apt install -y apache2
   sudo a2enmod proxy proxy_http proxy_wstunnel headers
   ```

2. Create an Apache configuration file:
   ```bash
   sudo nano /etc/apache2/sites-available/cookie-catcher.conf
   ```

3. Add the following configuration (replace yourdomain.com with your actual domain):
   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       ServerAlias www.yourdomain.com

       # Cloudflare handles SSL, so we don't need to redirect to HTTPS here

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

4. Enable the site and restart Apache:
   ```bash
   sudo a2ensite cookie-catcher.conf
   sudo apache2ctl configtest
   sudo systemctl restart apache2
   ```

5. Cloudflare Configuration:
   - Ensure your domain is properly set up in Cloudflare
   - In the DNS settings, make sure you have an A record pointing to your server's IP address
   - In the SSL/TLS section, set the encryption mode to "Full" or "Full (strict)" if you have SSL on your server
   - In the Page Rules section, you can create rules for caching if needed

### Step 4: Firewall Configuration

1. Configure UFW (Uncomplicated Firewall):
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

### Step 5: Monitoring and Maintenance

1. Monitor the application logs:
   ```bash
   pm2 logs cookie-catcher
   ```

2. Set up log rotation:
   ```bash
   sudo pm2 install pm2-logrotate
   ```

3. Configure automatic updates:
   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## Directory Structure

- `valid-cookies/`: Directory where cookie files are stored
- `cookie-backups/`: Directory for cookie backups
- `temp-uploads/`: Temporary directory for file uploads
- `src/`: Source code
  - `components/`: React components
    - `Admin/`: Admin panel components
    - `CookieCatcher/`: Game components
  - `services/`: Backend services
  - `pages/`: React pages
  - `routes/`: React Router routes

## Admin Panel

The admin panel is accessible at `/admin` and provides the following features:

- Dashboard with system overview
- Cookie management (upload, delete)
- System status monitoring
- Settings configuration

Default admin credentials:
- Username: `admin`
- Password: `admin123`

**Important:** Change these credentials in production by modifying the `unified-server.js` file.

## Managing the Application

After deployment, you can manage the application using PM2:

- Check status: `pm2 status`
- View logs: `pm2 logs cookie-catcher`
- Restart application: `pm2 restart cookie-catcher`
- Stop application: `pm2 stop cookie-catcher`
- Update application:
  ```bash
  cd /var/www/cookie-catcher
  git pull
  npm install
  npm run build
  pm2 restart cookie-catcher
  ```

## Troubleshooting

### Permission Issues

If you encounter permission issues:

```bash
# Set proper ownership
sudo chown -R $(whoami):$(whoami) /var/www/cookie-catcher
sudo chown -R $(whoami):$(whoami) valid-cookies cookie-backups temp-uploads

# Set proper permissions
chmod 755 valid-cookies cookie-backups temp-uploads
```

### Port Already in Use

If port 8080 is already in use:

1. Edit the `.env` file and change the `PORT` value
2. Restart the application: `pm2 restart cookie-catcher`
3. Update your Nginx configuration to point to the new port

### Application Not Starting

Check the logs for errors:
```bash
pm2 logs cookie-catcher
```

Common issues:
- Missing dependencies: Run `npm install`
- Build errors: Run `npm run build` and check for errors
- Permission issues: See the permission troubleshooting section

### Nginx Configuration Issues

Test your Nginx configuration:
```bash
sudo nginx -t
```

If there are errors, fix them and restart Nginx:
```bash
sudo systemctl restart nginx
```

## Backup and Restore

### Backup

1. Create a backup script:
   ```bash
   nano backup.sh
   ```

2. Add the following content:
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

3. Make it executable:
   ```bash
   chmod +x backup.sh
   ```

4. Set up a cron job for automatic backups:
   ```bash
   crontab -e
   ```

   Add the following line for daily backups at 2 AM:
   ```
   0 2 * * * /var/www/cookie-catcher/backup.sh
   ```

### Restore

1. Restore cookies:
   ```bash
   tar -xzf /var/backups/cookie-catcher/cookies_TIMESTAMP.tar.gz -C /var/www/cookie-catcher
   ```

2. Restore application:
   ```bash
   tar -xzf /var/backups/cookie-catcher/app_TIMESTAMP.tar.gz -C /var/www/cookie-catcher
   cd /var/www/cookie-catcher
   npm install
   npm run build
   pm2 restart cookie-catcher
   ```

## License

[MIT License](LICENSE)
