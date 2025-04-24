# Cookie Catcher v2.0

A modern web application for cookie management and distribution with an interactive game interface and comprehensive admin panel.

## Features

- Interactive Cookie Catcher game for users to earn and claim cookies
- Secure token-based cookie claiming system
- Modern, responsive UI with dark theme and animations
- Comprehensive admin panel for cookie management
- Google AdSense integration for monetization
- Optimized for both desktop and mobile devices

## Requirements

- Node.js 18.x or higher
- npm 8.x or higher
- Linux server (for production deployment)
- Domain with HTTPS for AdSense integration (production)

## Local Development Setup (Windows)

1. Clone the repository:
   ```
   git clone <repository-url>
   cd cookie-catcher
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create necessary directories (if they don't exist):
   ```
   mkdir -p valid-cookies cookie-backups temp-uploads
   ```

4. Start the unified development server:
   ```
   npm run dev
   ```

   Or run the unified server directly:
   ```
   node unified-server.js
   ```

5. Access the application at http://localhost:8080

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

### Step 3: Nginx Configuration (Recommended)

1. Install Nginx:
   ```bash
   sudo apt install -y nginx
   ```

2. Create an Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/cookie-catcher
   ```

3. Add the following configuration (replace yourdomain.com with your actual domain):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       # Redirect HTTP to HTTPS
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name yourdomain.com www.yourdomain.com;

       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN";
       add_header X-Content-Type-Options "nosniff";
       add_header X-XSS-Protection "1; mode=block";

       # Proxy to Node.js application
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/cookie-catcher /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

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
