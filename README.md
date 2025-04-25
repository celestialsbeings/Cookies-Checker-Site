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

## 🚀 Deployment Options

<div align="center">
  <img src="https://img.shields.io/badge/🌐-Apache%20+%20Cloudflare-F38020?style=flat-square" alt="Apache + Cloudflare">
  <img src="https://img.shields.io/badge/🚇-Cloudflare%20Tunnel-F38020?style=flat-square" alt="Cloudflare Tunnel">
  <img src="https://img.shields.io/badge/🔄-Port%208080-00FFFF?style=flat-square" alt="Port 8080">
</div>

Cookie Catcher supports multiple deployment options:

- 🌐 **Apache with Cloudflare** - Traditional setup with Apache proxying to Node.js
- 🚇 **Cloudflare Tunnel** - Secure connection without exposing ports to the internet
- 🔒 **Port 8080 Forwarding** - Configured to work with Cloudflare's port 8080 forwarding

Detailed setup instructions for each method are provided in the deployment section.

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

## 🖥️ Production Deployment on Linux

### 📋 Prerequisites

- 🐧 A Linux server (Ubuntu 20.04 LTS or later recommended)
- 📦 Node.js 18.x or later installed
- 🌐 A domain name with HTTPS configured (for AdSense)
- 🔑 Root or sudo access

### 🔧 Step 1: Server Preparation

<details>
<summary>📋 Click to expand detailed instructions</summary>

1. **Update your system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js if not already installed:**
   ```bash
   # Add NodeSource repository
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

   # Install Node.js
   sudo apt install -y nodejs

   # Verify installation
   node -v
   npm -v
   ```

3. **Install PM2 for process management:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Install required system dependencies:**
   ```bash
   sudo apt install -y git build-essential
   ```
</details>

### 📦 Step 2: Application Deployment

<details>
<summary>📋 Click to expand detailed instructions</summary>

1. **Clone the repository:**
   ```bash
   git clone <repository-url> /var/www/cookie-catcher
   cd /var/www/cookie-catcher
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Create necessary directories and set permissions:**
   ```bash
   mkdir -p valid-cookies cookie-backups temp-uploads
   chmod 755 valid-cookies cookie-backups temp-uploads
   ```

5. **Create a .env file (optional for custom configuration):**
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

6. **Start the application with PM2:**
   ```bash
   pm2 start unified-server.js --name cookie-catcher
   ```

7. **Configure PM2 to start on system boot:**
   ```bash
   pm2 startup
   # Run the command that PM2 outputs
   pm2 save
   ```
</details>

### 🌐 Step 3: Apache Configuration with Cloudflare

<details>
<summary>📋 Click to expand detailed instructions</summary>

Since you're using Cloudflare as your proxy with Apache and port 8080 is already forwarded, you need to configure Apache to proxy requests to your Node.js application.

1. **Ensure Apache is installed and the required modules are enabled:**
   ```bash
   sudo apt install -y apache2
   sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite
   ```

2. **Create an Apache configuration file:**
   ```bash
   sudo nano /etc/apache2/sites-available/cookie-catcher.conf
   ```

3. **Add the following configuration** (replace yourdomain.com with your actual domain):
   ```apache
   <VirtualHost *:8080>
       ServerName yourdomain.com
       ServerAlias www.yourdomain.com

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

4. **Configure Apache to listen on port 8080:**
   ```bash
   sudo nano /etc/apache2/ports.conf
   ```

   Add the following line if it doesn't exist:
   ```apache
   Listen 8080
   ```

5. **Enable the site and restart Apache:**
   ```bash
   sudo a2ensite cookie-catcher.conf
   sudo apache2ctl configtest
   sudo systemctl restart apache2
   ```

6. **Cloudflare Configuration:**
   - ✅ Ensure your domain is properly set up in Cloudflare
   - ✅ In the DNS settings, make sure you have an A record pointing to your server's IP address
   - ✅ In the SSL/TLS section, set the encryption mode to "Full" or "Full (strict)" if you have SSL on your server
   - ✅ In the Page Rules section, you can create rules for caching if needed
</details>

### 🚇 Step 3.5: Cloudflare Tunnel Configuration (Alternative to Apache)

<details>
<summary>📋 Click to expand detailed instructions</summary>

Cloudflare Tunnel provides a secure way to connect your web server to Cloudflare without exposing your public IP or opening ports on your firewall. This is an alternative to the Apache configuration above.

1. **Install Cloudflare Tunnel (cloudflared):**
   ```bash
   # Download the latest cloudflared package
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

   # Install the package
   sudo dpkg -i cloudflared.deb

   # Verify installation
   cloudflared version
   ```

2. **Authenticate with Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```

   This will open a browser window where you'll need to log in to your Cloudflare account and authorize the tunnel.

3. **Create a new tunnel:**
   ```bash
   cloudflared tunnel create cookie-catcher
   ```

   This will generate a tunnel ID and credentials file.

4. **Configure your tunnel:**
   ```bash
   sudo mkdir -p /etc/cloudflared
   sudo nano /etc/cloudflared/config.yml
   ```

   Add the following configuration (replace `your-tunnel-id` with your actual tunnel ID):
   ```yaml
   tunnel: your-tunnel-id
   credentials-file: /root/.cloudflared/your-tunnel-id.json

   ingress:
     - hostname: yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

5. **Route DNS to your tunnel:**
   ```bash
   cloudflared tunnel route dns cookie-catcher yourdomain.com
   ```

6. **Start the tunnel as a service:**
   ```bash
   sudo cloudflared service install
   sudo systemctl start cloudflared
   sudo systemctl enable cloudflared
   ```

7. **Verify the tunnel is running:**
   ```bash
   sudo systemctl status cloudflared
   ```

8. **Configure Cloudflare DNS and SSL:**
   - ✅ In the Cloudflare dashboard, ensure the DNS record for your domain points to your tunnel
   - ✅ In the SSL/TLS section, set the encryption mode to "Full" or "Full (strict)"
   - ✅ In the Rules section, you can create additional security rules if needed

This setup provides several advantages:
- 🔒 No need to open ports on your firewall
- 🛡️ Your server's IP address remains hidden
- 🚀 Automatic SSL/TLS encryption
- 🌐 DDoS protection through Cloudflare
</details>

### 🔒 Step 4: Firewall Configuration

<details>
<summary>📋 Click to expand detailed instructions</summary>

1. **Configure UFW (Uncomplicated Firewall):**
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw allow 8080/tcp  # Apache on port 8080
   sudo ufw enable
   ```

2. **Verify firewall status:**
   ```bash
   sudo ufw status verbose
   ```

3. **If using Cloudflare Tunnel instead of direct Apache access:**
   ```bash
   # You only need SSH access since Cloudflare Tunnel establishes an outbound connection
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp    # SSH only
   sudo ufw enable
   ```
</details>

### 📊 Step 5: Monitoring and Maintenance

<details>
<summary>📋 Click to expand detailed instructions</summary>

1. **Monitor the application logs:**
   ```bash
   pm2 logs cookie-catcher
   ```

2. **Set up log rotation:**
   ```bash
   sudo pm2 install pm2-logrotate
   ```

3. **Configure automatic updates:**
   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```
</details>

## 📁 Directory Structure

<details>
<summary>📋 Click to see the project structure</summary>

```
cookie-catcher/
├── 🍪 valid-cookies/     # Directory where cookie files are stored
├── 💾 cookie-backups/    # Directory for cookie backups
├── 📤 temp-uploads/      # Temporary directory for file uploads
├── 📂 src/               # Source code
│   ├── 🧩 components/    # React components
│   │   ├── 🛠️ Admin/     # Admin panel components
│   │   └── 🎮 CookieCatcher/ # Game components
│   ├── 🔌 services/      # Backend services
│   ├── 📄 pages/         # React pages
│   └── 🛣️ routes/        # React Router routes
└── 📜 unified-server.js  # Main server file
```
</details>

## 🛠️ Admin Panel

<div align="center">
  <img src="https://img.shields.io/badge/🔐-Admin%20Panel-C084FC?style=for-the-badge" alt="Admin Panel">
</div>

The admin panel is accessible at `/admin` and provides the following features:

- 📊 **Dashboard** with system overview
- 🍪 **Cookie Management** (upload, delete)
- 📈 **System Status** monitoring
- ⚙️ **Settings** configuration

<details>
<summary>🔑 Default admin credentials</summary>

- 👤 Username: `admin`
- 🔒 Password: `admin123`

⚠️ **Important:** Change these credentials in production by modifying the `unified-server.js` file.
</details>

## 🔄 Managing the Application

After deployment, you can manage the application using PM2:

| Command | Description |
|---------|-------------|
| `pm2 status` | 📊 Check application status |
| `pm2 logs cookie-catcher` | 📜 View application logs |
| `pm2 restart cookie-catcher` | 🔄 Restart application |
| `pm2 stop cookie-catcher` | ⏹️ Stop application |

<details>
<summary>🔄 How to update the application</summary>

```bash
cd /var/www/cookie-catcher
git pull
npm install
npm run build
pm2 restart cookie-catcher
```
</details>

## ⚠️ Troubleshooting

<details>
<summary>🔧 Permission Issues</summary>

If you encounter permission issues:

```bash
# Set proper ownership
sudo chown -R $(whoami):$(whoami) /var/www/cookie-catcher
sudo chown -R $(whoami):$(whoami) valid-cookies cookie-backups temp-uploads

# Set proper permissions
chmod 755 valid-cookies cookie-backups temp-uploads
```
</details>

<details>
<summary>🔌 Port Already in Use</summary>

If port 8080 is already in use:

1. Edit the `.env` file and change the `PORT` value
2. Restart the application: `pm2 restart cookie-catcher`
3. Update your Apache configuration to point to the new port
</details>

<details>
<summary>🚫 Application Not Starting</summary>

Check the logs for errors:
```bash
pm2 logs cookie-catcher
```

Common issues:
- 📦 Missing dependencies: Run `npm install`
- 🏗️ Build errors: Run `npm run build` and check for errors
- 🔒 Permission issues: See the permission troubleshooting section
</details>

<details>
<summary>🌐 Apache Configuration Issues</summary>

Test your Apache configuration:
```bash
sudo apache2ctl configtest
```

If there are errors, fix them and restart Apache:
```bash
sudo systemctl restart apache2
```
</details>

<details>
<summary>🌐 Cloudflare Tunnel Issues</summary>

If you're having issues with Cloudflare Tunnel:

1. **Check tunnel status:**
   ```bash
   sudo systemctl status cloudflared
   ```

2. **View tunnel logs:**
   ```bash
   sudo journalctl -u cloudflared
   ```

3. **Verify tunnel configuration:**
   ```bash
   sudo cat /etc/cloudflared/config.yml
   ```

4. **List active tunnels:**
   ```bash
   cloudflared tunnel list
   ```

5. **Restart the tunnel service:**
   ```bash
   sudo systemctl restart cloudflared
   ```

6. **Check Cloudflare dashboard:**
   - Ensure the tunnel is active in your Cloudflare dashboard
   - Verify DNS records are correctly pointing to the tunnel
</details>

## 💾 Backup and Restore

<details>
<summary>📤 Backup</summary>

1. **Create a backup script:**
   ```bash
   nano backup.sh
   ```

2. **Add the following content:**
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

3. **Make it executable:**
   ```bash
   chmod +x backup.sh
   ```

4. **Set up a cron job for automatic backups:**
   ```bash
   crontab -e
   ```

   Add the following line for daily backups at 2 AM:
   ```
   0 2 * * * /var/www/cookie-catcher/backup.sh
   ```
</details>

<details>
<summary>📥 Restore</summary>

1. **Restore cookies:**
   ```bash
   tar -xzf /var/backups/cookie-catcher/cookies_TIMESTAMP.tar.gz -C /var/www/cookie-catcher
   ```

2. **Restore application:**
   ```bash
   tar -xzf /var/backups/cookie-catcher/app_TIMESTAMP.tar.gz -C /var/www/cookie-catcher
   cd /var/www/cookie-catcher
   npm install
   npm run build
   pm2 restart cookie-catcher
   ```
</details>

<div align="center">

## 📜 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

<div align="center">
  <p>
    <img src="https://img.shields.io/badge/Made%20with%20❤️%20by-Celestial%20Team-C084FC?style=flat-square" alt="Made with love">
  </p>

  <p>
    <a href="https://github.com/yourusername/cookie-catcher">
      <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github" alt="GitHub Repository">
    </a>
  </p>
</div>
