import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { pipeline } from 'stream/promises';
import compression from 'compression';
import logger from './src/utils/logger.js';
import rateLimit from 'express-rate-limit';
import { scheduleBackups, createBackup } from './src/utils/backup.js';

// Load environment variables
dotenv.config();

// Security token generator and validator
class SecurityTokenManager {
  constructor() {
    this.validTokens = new Map();
    // Clean up expired tokens every minute
    setInterval(() => this.cleanupExpiredTokens(), 60000);
  }

  // Generate a new token for a game win
  generateToken(clientIp) {
    const token = this.createRandomToken();
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    this.validTokens.set(token, {
      clientIp,
      expiryTime
    });

    return token;
  }

  // Validate a token
  validateToken(token, clientIp) {
    if (!this.validTokens.has(token)) {
      console.log(`Token not found: ${token}`);
      return false;
    }

    const tokenData = this.validTokens.get(token);

    // Check if token is expired
    if (Date.now() > tokenData.expiryTime) {
      console.log(`Token expired: ${token}`);
      this.validTokens.delete(token);
      return false;
    }

    // Enhanced IP validation for both IPv4 and IPv6
    const storedIp = tokenData.clientIp;
    const currentIp = clientIp;

    console.log(`Validating token: stored IP = ${storedIp}, current IP = ${currentIp}`);

    // If IPs are exactly the same, allow it
    if (storedIp === currentIp) {
      console.log('✅ Exact IP match - token valid');
      this.validTokens.delete(token);
      return true;
    }

    // Handle localhost variations
    const localhostIps = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
    if (localhostIps.includes(storedIp) && localhostIps.includes(currentIp)) {
      console.log('✅ Localhost IP match - token valid');
      this.validTokens.delete(token);
      return true;
    }

    // For IPv4 addresses, check network match (first two octets)
    if (storedIp.includes('.') && currentIp.includes('.')) {
      const storedParts = storedIp.split('.');
      const currentParts = currentIp.split('.');

      if (storedParts.length >= 2 && currentParts.length >= 2) {
        const networkMatch = storedParts[0] === currentParts[0] && storedParts[1] === currentParts[1];
        if (networkMatch) {
          console.log('✅ IPv4 network match - token valid');
          this.validTokens.delete(token);
          return true;
        }
      }
    }

    // For IPv6 addresses, check network match (first 4 segments)
    if (storedIp.includes(':') && currentIp.includes(':')) {
      const storedParts = storedIp.split(':');
      const currentParts = currentIp.split(':');

      if (storedParts.length >= 4 && currentParts.length >= 4) {
        const networkMatch = storedParts[0] === currentParts[0] &&
                            storedParts[1] === currentParts[1] &&
                            storedParts[2] === currentParts[2] &&
                            storedParts[3] === currentParts[3];
        if (networkMatch) {
          console.log('✅ IPv6 network match - token valid');
          this.validTokens.delete(token);
          return true;
        }
      }
    }

    // For development/testing: if either IP is localhost-like, be more lenient
    const isStoredLocal = localhostIps.some(ip => storedIp.includes(ip)) || storedIp.startsWith('192.168.') || storedIp.startsWith('10.') || storedIp.startsWith('172.');
    const isCurrentLocal = localhostIps.some(ip => currentIp.includes(ip)) || currentIp.startsWith('192.168.') || currentIp.startsWith('10.') || currentIp.startsWith('172.');

    if (isStoredLocal && isCurrentLocal) {
      console.log('✅ Both IPs are local/private - token valid');
      this.validTokens.delete(token);
      return true;
    }

    // Special handling for Cloudflare tunnel scenarios
    // If one IP is localhost and the other is a real IP (Cloudflare tunnel scenario)
    if ((isStoredLocal && !isCurrentLocal) || (!isStoredLocal && isCurrentLocal)) {
      console.log('✅ Cloudflare tunnel scenario detected - allowing mixed local/external IPs');
      this.validTokens.delete(token);
      return true;
    }

    // Last resort: if we're in a development/testing environment, be very lenient
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Development mode - allowing token validation');
      this.validTokens.delete(token);
      return true;
    }

    console.log(`❌ IP mismatch: Token was created with ${storedIp} but claimed with ${currentIp}`);
    return false;
  }

  // Create a random token
  createRandomToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Clean up expired tokens
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of this.validTokens.entries()) {
      if (now > data.expiryTime) {
        this.validTokens.delete(token);
      }
    }
  }
}

// Simple rate limiter implementation
class RateLimiter {
  constructor(windowMs = 10000, maxRequests = 1) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.clients = new Map();
  }

  // Check if a client has exceeded the rate limit
  isRateLimited(clientId) {
    const now = Date.now();

    // Clean up old entries
    this.cleanup(now);

    // Get or create client record
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, {
        count: 0,
        resetTime: now + this.windowMs
      });
    }

    const client = this.clients.get(clientId);

    // Reset if window has passed
    if (now > client.resetTime) {
      client.count = 0;
      client.resetTime = now + this.windowMs;
    }

    // Check if rate limited
    if (client.count >= this.maxRequests) {
      return true;
    }

    // Increment count and return not limited
    client.count++;
    return false;
  }

  // Clean up old entries
  cleanup(now) {
    for (const [clientId, client] of this.clients.entries()) {
      if (now > client.resetTime) {
        this.clients.delete(clientId);
      }
    }
  }
}

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get the real client IP from Cloudflare headers
const getClientIp = (req) => {
  // If coming through Cloudflare, the client IP is the last one in the X-Forwarded-For header
  if (req.headers['x-forwarded-for']) {
    // Get the first IP address (original client) from the X-Forwarded-For header
    // Cloudflare adds IPs in the format: "client, proxy1, proxy2"
    const forwardedIps = req.headers['x-forwarded-for'].split(',').map(ip => ip.trim());
    return forwardedIps[0]; // Return the original client IP
  }

  // Fallback to remote address if no X-Forwarded-For header
  return req.socket.remoteAddress;
};

// Create Express app
const app = express();

// Create security token manager
const securityTokenManager = new SecurityTokenManager();

// Create rate limiter - allow 1 request per 10 seconds per IP
const cookieRateLimiter = new RateLimiter(10000, 1);

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add cache control headers to prevent caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Add Content-Security-Policy header to allow connections to the same origin
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:3000 http://192.168.109.171:3000; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com https://www.google-analytics.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data:; frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com;");

  next();
});

// JSON middleware
app.use(express.json());

// File upload middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(process.cwd(), 'temp-uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Define the port - use 3000 to avoid conflict with Apache on 8080
const PORT = 3000;

// Define the cookies directory
const COOKIES_DIR = path.join(process.cwd(), 'valid-cookies');

// Define the backup directory
const BACKUP_DIR = path.join(process.cwd(), 'cookie-backups');

// Ensure the cookies directory exists
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
  logger.info(`Created cookies directory: ${COOKIES_DIR}`);
}

// Ensure the backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  logger.info(`Created backup directory: ${BACKUP_DIR}`);
}

// ===== API ENDPOINTS =====

// API endpoint to generate a token when the game is won
app.post('/api/game-win', (req, res) => {
  // Get client IP using our helper function
  const clientIp = getClientIp(req);
  console.log('Game win from client IP:', clientIp);

  // Check if the request includes game score or other verification
  // In a real app, you'd verify the game was actually won
  const { score } = req.body || {};

  if (!score || score < 100) {
    return res.status(400).json({
      error: 'Invalid game data',
      message: 'You need to win the game with a valid score to claim a cookie.'
    });
  }

  // Generate a token for this client
  const token = securityTokenManager.generateToken(clientIp);
  console.log('Generated token for client:', clientIp);

  // Return the token
  return res.json({
    success: true,
    token,
    message: 'Congratulations on winning! Use this token to claim your cookie.'
  });
});

// API endpoint to claim a cookie (now requires a valid token)
app.get('/api/claim-cookie', (req, res) => {
  console.log('Claim cookie request received');

  // Get client IP for rate limiting using our helper function
  const clientIp = getClientIp(req);
  console.log('Client IP:', clientIp);

  // Get token from query parameter
  const { token } = req.query;

  // Check if token is provided
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You need to win the game first to claim a cookie.'
    });
  }

  // Validate token
  if (!securityTokenManager.validateToken(token, clientIp)) {
    console.log('Invalid token:', token);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token. Please win the game again to claim a cookie.'
    });
  }

  console.log('Valid token used:', token);

  // Check if rate limited
  if (cookieRateLimiter.isRateLimited(clientIp)) {
    console.log('Rate limited:', clientIp);
    return res.status(429).json({
      error: 'Already claimed',
      message: 'You already claimed a cookie. Please wait a moment before claiming another one.'
    });
  }

  try {
    // Get list of available cookie files
    const files = fs.readdirSync(COOKIES_DIR)
      .filter(file => file.endsWith('.txt'));

    console.log(`Found ${files.length} cookie files`);

    // Check if we have any cookies left
    if (files.length === 0) {
      return res.status(404).json({
        error: 'No cookies available',
        message: "We've run out of cookies for now. Please try again later!"
      });
    }

    // Get a random cookie file
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(COOKIES_DIR, randomFile);
    console.log(`Selected cookie file: ${randomFile}`);

    try {
      // Read the cookie file content
      const content = fs.readFileSync(filePath, 'utf-8');

      // Delete the file after reading (optional - comment this out if you want to keep the files)
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted cookie file: ${randomFile}`);
      } catch (deleteError) {
        console.error(`Error deleting cookie file: ${randomFile}`, deleteError);
        // Continue even if delete fails
      }

      // Return the cookie content
      return res.json({
        filename: randomFile,
        content: content,
        remainingCookies: files.length - 1
      });
    } catch (fileError) {
      console.error(`Error processing cookie file: ${randomFile}`, fileError);
      return res.status(500).json({
        error: 'File processing error',
        message: 'Error processing the cookie file. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// API endpoint to check available cookies
app.get('/api/check-cookies', (req, res) => {
  try {
    // Get list of available cookie files
    const files = fs.readdirSync(COOKIES_DIR)
      .filter(file => file.endsWith('.txt'));

    return res.json({
      available: files.length > 0,
      count: files.length
    });
  } catch (error) {
    console.error('Error checking cookies:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred while checking available cookies.'
    });
  }
});

// ===== ADMIN API ENDPOINTS =====

// Create admin login rate limiter
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
  handler: (req, res, options) => {
    logger.warn(`Rate limit exceeded for admin login: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

// Admin authentication endpoint
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  try {
    const { username, password } = req.body;

    // In a real app, you would validate against a database
    // and use proper password hashing
    if (username === 'celestialbeing' && password === 'az11002021') {
      // Generate a simple token (in a real app, this would be a JWT)
      const token = `admin-token-${Date.now()}`;

      logger.info(`Admin login successful: ${req.ip}`);
      return res.json({
        success: true,
        token,
        message: 'Login successful'
      });
    } else {
      logger.warn(`Failed admin login attempt: ${req.ip}, username: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    logger.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login'
    });
  }
});

// API endpoint to get system status
app.get('/api/admin/status', (req, res) => {
  try {
    // Get cookie count
    const cookieFiles = fs.readdirSync(COOKIES_DIR)
      .filter(file => file.endsWith('.txt'));

    // Get system info
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    };

    // Add CORS headers specifically for this endpoint
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.json({
      status: 'ok',
      cookieCount: cookieFiles.length,
      lowCookies: cookieFiles.length < 10,
      system: systemInfo
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred while getting system status.'
    });
  }
});

// API endpoint to upload a ZIP file of cookies
app.post('/api/admin/upload-cookies-zip', upload.single('cookieZip'), async (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if it's a ZIP file
    if (!req.file.originalname.endsWith('.zip')) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: 'Uploaded file is not a ZIP file'
      });
    }

    // Extract the ZIP file
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();

    // Filter for .txt files
    const txtEntries = zipEntries.filter(entry => entry.entryName.endsWith('.txt'));

    if (txtEntries.length === 0) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: 'ZIP file does not contain any .txt files'
      });
    }

    // Extract each .txt file to the cookies directory
    let extractedCount = 0;
    for (const entry of txtEntries) {
      try {
        // Generate a unique filename
        const filename = `cookie_${Date.now()}_${Math.floor(Math.random() * 10000)}.txt`;
        const filePath = path.join(COOKIES_DIR, filename);

        // Extract the file
        zip.extractEntryTo(entry, COOKIES_DIR, false, true, false, filename);
        extractedCount++;
      } catch (extractError) {
        console.error(`Error extracting file ${entry.entryName}:`, extractError);
      }
    }

    // Delete the uploaded ZIP file
    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      message: `Successfully extracted ${extractedCount} cookie files`,
      count: extractedCount
    });
  } catch (error) {
    console.error('Error processing ZIP file:', error);

    // Try to delete the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Error processing ZIP file'
    });
  }
});

// API endpoint to upload a single cookie file
app.post('/api/admin/upload-cookie-file', upload.single('cookieFile'), async (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if it's a TXT file
    if (!req.file.originalname.endsWith('.txt')) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: 'Uploaded file is not a TXT file'
      });
    }

    // Generate a unique filename
    const filename = `cookie_${Date.now()}_${Math.floor(Math.random() * 10000)}.txt`;
    const destPath = path.join(COOKIES_DIR, filename);

    // Copy the file to the cookies directory
    await pipeline(
      fs.createReadStream(req.file.path),
      fs.createWriteStream(destPath)
    );

    // Delete the uploaded file
    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      message: 'Successfully uploaded cookie file',
      filename
    });
  } catch (error) {
    console.error('Error processing cookie file:', error);

    // Try to delete the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Error processing cookie file'
    });
  }
});

// API endpoint to clear all cookies
app.post('/api/admin/clear-cookies', (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    // Get all cookie files
    const cookieFiles = fs.readdirSync(COOKIES_DIR)
      .filter(file => file.endsWith('.txt'));

    // Delete each file
    let deletedCount = 0;
    for (const file of cookieFiles) {
      try {
        fs.unlinkSync(path.join(COOKIES_DIR, file));
        deletedCount++;
      } catch (error) {
        logger.error(`Error deleting cookie file: ${file}`, error);
      }
    }

    return res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} cookie files.`
    });
  } catch (error) {
    logger.error('Error clearing cookies:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred while clearing cookies.'
    });
  }
});

// API endpoint to manually trigger a backup
app.post('/api/admin/backup', async (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    logger.info('Manual backup triggered');
    const backupPath = await createBackup(COOKIES_DIR, BACKUP_DIR);

    if (backupPath) {
      return res.json({
        success: true,
        message: 'Backup created successfully',
        backupPath: path.basename(backupPath)
      });
    } else {
      return res.json({
        success: false,
        message: 'No cookies to backup or backup failed'
      });
    }
  } catch (error) {
    logger.error('Error creating backup:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while creating backup'
    });
  }
});

// ===== STATIC FILES =====

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle admin routes for the SPA
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Unified server running on port ${PORT}`);
  logger.info(`Access the application at http://localhost:${PORT}`);
  logger.info(`Access the application at http://192.168.109.171:${PORT}`);
  logger.info(`Access the API at http://localhost:${PORT}/api`);
  logger.info(`Access the admin panel at http://localhost:${PORT}/admin`);
  logger.info(`Cookie directory: ${COOKIES_DIR}`);

  // Schedule automatic backups every 24 hours
  scheduleBackups(COOKIES_DIR, BACKUP_DIR, 24);
});
