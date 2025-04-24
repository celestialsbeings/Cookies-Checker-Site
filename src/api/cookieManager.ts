import { promises as fs } from 'fs';
import path from 'path';
import { config, ensureDirectories } from '../config';

const COOKIES_DIR = config.COOKIES_DIR;

interface CookieFile {
  name: string;
  content: string;
}

export const claimRandomCookie = async (): Promise<CookieFile | null> => {
  try {
    // Ensure directories exist
    ensureDirectories();
    // Create directory if it doesn't exist
    await fs.mkdir(COOKIES_DIR, { recursive: true });

    // Get list of cookie files
    const files = await fs.readdir(COOKIES_DIR);
    const cookieFiles = files.filter(file => file.endsWith('.txt'));

    if (cookieFiles.length === 0) {
      return null;
    }

    // Select random cookie file
    const randomFile = cookieFiles[Math.floor(Math.random() * cookieFiles.length)];
    const filePath = path.join(COOKIES_DIR, randomFile);

    // Read content
    const content = await fs.readFile(filePath, 'utf-8');

    // Delete the file
    await fs.unlink(filePath);

    return {
      name: randomFile,
      content
    };
  } catch (error) {
    console.error('Error claiming cookie:', error);
    return null;
  }
};
