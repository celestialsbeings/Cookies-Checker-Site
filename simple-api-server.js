import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
      return false;
    }

    const tokenData = this.validTokens.get(token);

    // Check if token is expired
    if (Date.now() > tokenData.expiryTime) {
      this.validTokens.delete(token);
      return false;
    }

    // Check if token belongs to this client
    if (tokenData.clientIp !== clientIp) {
      return false;
    }

    // Token is valid, remove it so it can't be used again
    this.validTokens.delete(token);
    return true;
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

// Create Express app
const app = express();

// Create security token manager
const securityTokenManager = new SecurityTokenManager();

// Create rate limiter - allow 1 request per 10 seconds per IP
const cookieRateLimiter = new RateLimiter(10000, 1);

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON middleware
app.use(express.json());

// Define the port
const PORT = process.env.API_PORT || 3001;

// Define the cookies directory
const COOKIES_DIR = path.join(process.cwd(), 'valid-cookies');

// Ensure the cookies directory exists
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
  console.log('Created cookies directory:', COOKIES_DIR);
}

// API endpoint to generate a token when the game is won
app.post('/api/game-win', (req, res) => {
  // Get client IP
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
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

  // Get client IP for rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
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

// Serve static files from the valid-cookies directory
app.use('/cookies', express.static(COOKIES_DIR));

// Start the server
app.listen(PORT, () => {
  console.log(`Simple API server running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}/api`);
  console.log(`Cookie directory: ${COOKIES_DIR}`);
});
