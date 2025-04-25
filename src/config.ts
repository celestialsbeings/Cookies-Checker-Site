// Configuration for the Cookie Catcher application
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

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

    // Server configuration
    PORT: process.env.PORT || 3000,

    // Cookie management
    COOKIE_FILE_EXTENSION: '.txt',

    // Endpoints
    ENDPOINTS: {
        CLAIM_COOKIE: '/api/claim-cookie',
        CHECK_COOKIES: '/api/check-cookies',
        GAME_WIN: '/api/game-win'
    }
};

// Ensure required directories exist
export const ensureDirectories = () => {
    const dirs = [config.BASE_DIR, config.COOKIES_DIR, config.BACKUP_DIR];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
            console.log('Created directory:', dir);
        }
    }
};
