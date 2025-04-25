import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import logger from './logger.js';

/**
 * Creates a backup of all cookie files
 * @param {string} cookiesDir - Directory containing cookie files
 * @param {string} backupDir - Directory to store backups
 * @returns {Promise<string>} - Path to the backup file
 */
export const createBackup = async (cookiesDir, backupDir) => {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info(`Created backup directory: ${backupDir}`);
    }

    // Get all cookie files
    const cookieFiles = fs.readdirSync(cookiesDir)
      .filter(file => file.endsWith('.txt'))
      .map(file => path.join(cookiesDir, file));

    if (cookieFiles.length === 0) {
      logger.info('No cookie files to backup');
      return null;
    }

    // Create a zip file
    const zip = new AdmZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `cookies-backup-${timestamp}.zip`;
    const backupPath = path.join(backupDir, backupFilename);

    // Add each cookie file to the zip
    for (const file of cookieFiles) {
      zip.addLocalFile(file);
    }

    // Write the zip file
    zip.writeZip(backupPath);
    
    logger.info(`Created backup: ${backupPath} with ${cookieFiles.length} files`);
    return backupPath;
  } catch (error) {
    logger.error('Error creating backup:', error);
    return null;
  }
};

/**
 * Cleans up old backups, keeping only the specified number of most recent backups
 * @param {string} backupDir - Directory containing backups
 * @param {number} keepCount - Number of backups to keep
 * @returns {Promise<number>} - Number of deleted backups
 */
export const cleanupOldBackups = async (backupDir, keepCount = 5) => {
  try {
    if (!fs.existsSync(backupDir)) {
      return 0;
    }

    // Get all backup files
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('cookies-backup-') && file.endsWith('.zip'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by time, newest first

    // Keep only the specified number of backups
    const filesToDelete = backupFiles.slice(keepCount);
    
    // Delete old backups
    let deletedCount = 0;
    for (const file of filesToDelete) {
      try {
        fs.unlinkSync(file.path);
        deletedCount++;
      } catch (error) {
        logger.error(`Error deleting backup file ${file.name}:`, error);
      }
    }

    if (deletedCount > 0) {
      logger.info(`Deleted ${deletedCount} old backup files`);
    }
    
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning up old backups:', error);
    return 0;
  }
};

/**
 * Schedules automatic backups
 * @param {string} cookiesDir - Directory containing cookie files
 * @param {string} backupDir - Directory to store backups
 * @param {number} intervalHours - Backup interval in hours
 */
export const scheduleBackups = (cookiesDir, backupDir, intervalHours = 24) => {
  logger.info(`Scheduling automatic backups every ${intervalHours} hours`);
  
  // Run initial backup
  createBackup(cookiesDir, backupDir)
    .then(() => cleanupOldBackups(backupDir))
    .catch(error => logger.error('Error in initial backup:', error));
  
  // Schedule regular backups
  setInterval(() => {
    createBackup(cookiesDir, backupDir)
      .then(() => cleanupOldBackups(backupDir))
      .catch(error => logger.error('Error in scheduled backup:', error));
  }, intervalHours * 60 * 60 * 1000);
};

export default {
  createBackup,
  cleanupOldBackups,
  scheduleBackups
};
