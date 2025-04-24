import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { config, ensureDirectories } from './config';

export function cookieApiPlugin(): Plugin {
  return {
    name: 'cookie-api',
    configureServer(server) {
      server.middlewares.use('/api/claim-cookie', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          console.log('Claim cookie request received');

          // Ensure directories exist
          ensureDirectories();

          // Get the valid-cookies directory path
          const cookiesDir = config.COOKIES_DIR;
          console.log('Cookies directory:', cookiesDir);

          // Check if directory exists
          if (!fs.existsSync(cookiesDir)) {
            // Create the directory if it doesn't exist
            try {
              fs.mkdirSync(cookiesDir, { recursive: true });
              console.log('Created cookies directory:', cookiesDir);
            } catch (mkdirError) {
              console.error('Error creating cookies directory:', mkdirError);
            }

            // Still return 404 since we don't have any cookies yet
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'No cookies available',
              message: "We're sorry, but we're currently out of cookies. Please check back later!"
            }));
            return;
          }

          // Get list of available cookie files
          const allFiles = fs.readdirSync(cookiesDir);
          const files = allFiles.filter(file => file.endsWith('.txt'));
          console.log('Available cookie files:', files);

          // Check if we have any cookies left
          if (files.length === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({
              error: 'No cookies available',
              message: "We apologize, but we've run out of cookies for now. Please try again later!"
            }));
            return;
          }

          // Get a random cookie file
          const randomFile = files[Math.floor(Math.random() * files.length)];
          const filePath = path.join(cookiesDir, randomFile);
          console.log('Selected cookie file:', randomFile);
          console.log('Full path:', filePath);

          try {
            // Read the cookie file content
            const content = fs.readFileSync(filePath, 'utf-8');
            console.log('Cookie file content:', content);

            // Validate the cookie file content
            if (!content || content.trim() === '') {
              throw new Error('Cookie file is empty');
            }

            // Make sure the content has the expected format
            const lines = content.split('\n');
            if (lines.length < 3) {
              throw new Error('Cookie file has invalid format');
            }

            // Delete the file after reading
            try {
              fs.unlinkSync(filePath);
              console.log('Cookie file deleted successfully');
            } catch (deleteError) {
              console.error('Error deleting cookie file:', deleteError);
              // Continue even if delete fails
            }

            // Check if the directory is empty after deleting
            const allRemainingFiles = fs.readdirSync(cookiesDir);
            const remainingFiles = allRemainingFiles.filter(file => file.endsWith('.txt'));
            if (remainingFiles.length === 0) {
              console.log('Warning: Last cookie file has been claimed!');
            }

            // Return the cookie content
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              filename: randomFile,
              content: content,
              remainingCookies: remainingFiles.length
            }));

          } catch (error) {
            console.error('Error processing cookie file:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);

            // If there's an error with this file, remove it and try again
            try {
              fs.unlinkSync(filePath);
              console.log('Corrupted cookie file deleted');
            } catch (e) {
              console.error('Could not delete corrupted cookie file:', e);
            }

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'Failed to process cookie file',
              message: 'There was an error processing your cookie. Please try again.',
              details: error.message
            }));
          }

        } catch (error) {
          console.error('Error in cookie API:', error);
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);

          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Server error',
            message: 'An unexpected error occurred. Please try again later.',
            details: error.message
          }));
        }
      });
    }
  };
}
