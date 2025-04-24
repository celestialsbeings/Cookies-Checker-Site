// Configuration for both API server and Telegram bot
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
    // Base paths
    BASE_DIR: process.env.BASE_DIR || process.cwd(),
    get COOKIES_DIR() {
        return path.join(this.BASE_DIR, 'valid-cookies');
    },
    get BACKUP_DIR() {
        return path.join(this.BASE_DIR, 'cookie-backups');
    },


    // API Server configuration
    API_PORT: process.env.API_PORT || 3001,
    API_HOST: process.env.API_HOST || 'localhost',
    get API_URL() {
        return `http://${this.API_HOST}:${this.API_PORT}`;
    },

    // Telegram Bot configuration
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',

    // Cookie management
    COOKIE_FILE_EXTENSION: '.txt',

    // Endpoints
    ENDPOINTS: {
        CLAIM_COOKIE: '/api/claim-cookie',
        CHECK_COOKIES: '/api/check-cookies',
        COOKIES_CLAIM: '/api/cookies/claim',
        COOKIES_CHECK: '/api/cookies/check'
    }
};


// Import fs at the top level
import fs from 'fs';

export const ensureDirectories = () => {
    const dirs = [config.BASE_DIR, config.COOKIES_DIR, config.BACKUP_DIR];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
            console.log('Created directory:', dir);
        }
    }
};

// Validate required environment variables
const validateConfig = () => {
    const required = ['TELEGRAM_BOT_TOKEN'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// Export both the config object and the validation function
export { validateConfig };
