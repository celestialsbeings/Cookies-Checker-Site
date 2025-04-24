import { ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import { config, ensureDirectories } from '../config';

const COOKIES_DIR = config.COOKIES_DIR;

// Ensure directories exist
ensureDirectories();

export const setupIpcHandlers = () => {
  ipcMain.handle('claim-cookie', async () => {
    try {
      const files = await fs.readdir(COOKIES_DIR);
      const cookieFiles = files.filter(file => file.endsWith('.txt'));

      if (cookieFiles.length === 0) {
        return { error: 'No cookies available' };
      }

      // Get random cookie file
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
      return { error: 'Failed to claim cookie' };
    }
  });
};
