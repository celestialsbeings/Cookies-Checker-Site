import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { config, ensureDirectories } from '../config';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const COOKIES_DIR = config.COOKIES_DIR;

// Ensure directories exist
ensureDirectories();

export const getAvailableCookies = async () => {
  try {
    const files = await readdir(COOKIES_DIR);
    return files.filter(file => file.endsWith('.txt'));
  } catch (error) {
    console.error('Error reading cookies directory:', error);
    return [];
  }
};

export const claimCookie = async (filename: string) => {
  try {
    const filePath = path.join(COOKIES_DIR, filename);

    // Read the cookie file
    const content = await readFile(filePath, 'utf-8');

    // Delete the file after reading
    await unlink(filePath);

    return content;
  } catch (error) {
    console.error('Error claiming cookie:', error);
    throw error;
  }
};
