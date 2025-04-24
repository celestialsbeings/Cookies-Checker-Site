# Linux Deployment Guide

This guide explains how to deploy the Cookie Checker application on a Linux server.

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Linux server (Ubuntu, Debian, CentOS, etc.)

## Simple Deployment

For a simple deployment that just serves cookies from a folder, follow these steps:

1. Clone the repository on your Linux server:
   ```
   git clone <repository-url>
   cd project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the simple deployment script:
   ```
   chmod +x simple-deploy.sh
   ./simple-deploy.sh
   ```

This will:
- Create the necessary directories
- Set proper permissions
- Generate some test cookies
- Install PM2 (if not already installed)
- Start the simple API server with PM2
- Configure PM2 to start on system boot

## Accessing the API

The API will be available at:
- `http://your-server-ip:3001/api/claim-cookie` - To claim a cookie
- `http://your-server-ip:3001/api/check-cookies` - To check available cookies

## Managing the Application

After deployment, you can manage the application using PM2:

- Check status: `pm2 status`
- View logs: `pm2 logs cookie-api-server`
- Restart the API server: `pm2 restart cookie-api-server`
- Stop the API server: `pm2 stop cookie-api-server`

## Generating More Cookies

If you need to generate more cookies, run:
```
node generate-cookies.js 10
```

Replace `10` with the number of cookies you want to generate.

## Troubleshooting

### Permission Issues

If you encounter permission issues:

```bash
# Set proper ownership
sudo chown -R $(whoami) valid-cookies

# Set proper permissions
chmod 755 valid-cookies
```

### Port Already in Use

If port 3001 is already in use:

1. Edit the `simple-api-server.js` file and change the `PORT` value
2. Restart the server: `pm2 restart cookie-api-server`

## Security Considerations

This is a simple deployment for testing purposes. For production use, consider:

1. Adding authentication to the API
2. Using HTTPS instead of HTTP
3. Setting up a reverse proxy (like Nginx) in front of the API server
4. Implementing rate limiting to prevent abuse
