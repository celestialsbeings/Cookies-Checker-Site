import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config, ensureDirectories } from '../config';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const PORT = config.API_PORT;

// Helper function to ensure directory exists
const ensureDirectory = () => {
  try {
    if (!fs.existsSync(config.BASE_DIR)) {
      console.log('Creating base directory:', config.BASE_DIR);
      fs.mkdirSync(config.BASE_DIR, { recursive: true, mode: 0o755 });
    }

    if (!fs.existsSync(config.COOKIES_DIR)) {
      console.log('Creating cookies directory:', config.COOKIES_DIR);
      fs.mkdirSync(config.COOKIES_DIR, { recursive: true, mode: 0o755 });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error ensuring directory:', error);
    throw error;
  }
};

// Create initial directories
try {
  ensureDirectories();
} catch (error) {
  console.error('Error during initialization:', error);
}

// Helper function to handle cookie claims
const handleCookieClaim = async (req: Request, res: Response) => {
  try {
    console.log('Handling cookie claim request');
    console.log('Cookies directory:', config.COOKIES_DIR);

    ensureDirectory();

    const files = fs.readdirSync(config.COOKIES_DIR);
    console.log('Available cookies:', files.length);

    if (files.length === 0) {
      return res.json({
        success: false,
        error: 'No cookies available',
        message: 'We apologize, but we\'ve run out of cookies for now. Please try again later!'
      });
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    const cookiePath = path.join(config.COOKIES_DIR, randomFile);
    console.log('Selected cookie path:', cookiePath);

    try {
      const cookieContent = fs.readFileSync(cookiePath, 'utf-8');
      fs.unlinkSync(cookiePath); // Remove the used cookie
      console.log('Cookie claimed successfully');

      return res.json({
        success: true,
        message: 'Successfully claimed a cookie!',
        cookieId: cookieContent.trim()
      });
    } catch (readError) {
      console.error('Error reading cookie:', readError);
      return res.status(500).json({
        success: false,
        error: 'Error reading cookie',
        message: 'There was an error processing your request. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error claiming cookie:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'There was an error processing your request. Please try again.'
    });
  }
};

// Helper function to check cookie availability
const handleCookieCheck = async (req: Request, res: Response) => {
  try {
    console.log('Handling cookie check request');
    console.log('Cookies directory:', config.COOKIES_DIR);

    ensureDirectory();

    const files = fs.readdirSync(config.COOKIES_DIR);
    console.log('Available cookies:', files.length);

    return res.json({
      success: true,
      available: files.length > 0,
      count: files.length,
      message: files.length > 0
        ? `${files.length} cookies available!`
        : 'No cookies available at the moment.'
    });
  } catch (error) {
    console.error('Error checking cookies:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'There was an error checking cookie availability.'
    });
  }
};

// Support all endpoint patterns
app.get(config.ENDPOINTS.CLAIM_COOKIE, handleCookieClaim);
app.get(config.ENDPOINTS.COOKIES_CLAIM, handleCookieClaim);
app.get('/api/check-cookie', handleCookieCheck);  // Singular
app.get(config.ENDPOINTS.CHECK_COOKIES, handleCookieCheck); // Plural
app.get(config.ENDPOINTS.COOKIES_CHECK, handleCookieCheck); // Alternative path

// Add an OPTIONS handler for CORS preflight requests
app.options('*', cors());

app.listen(PORT, () => {
  console.log('=== Server Configuration ===');
  console.log(`API Server running on port ${PORT}`);
  console.log('Current working directory:', process.cwd());
  console.log('Cookies directory:', config.COOKIES_DIR);
  console.log('Directory exists:', fs.existsSync(config.COOKIES_DIR));
  console.log('\n=== API Endpoints ===');
  console.log(`- GET ${config.ENDPOINTS.CLAIM_COOKIE}`);
  console.log(`- GET ${config.ENDPOINTS.COOKIES_CLAIM}`);
  console.log('- GET /api/check-cookie');
  console.log(`- GET ${config.ENDPOINTS.CHECK_COOKIES}`);
  console.log(`- GET ${config.ENDPOINTS.COOKIES_CHECK}`);
});
