#!/usr/bin/env node

/**
 * Script to list and manage cookie files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the cookies directory
const COOKIES_DIR = path.join(process.cwd(), 'valid-cookies');
const BACKUP_DIR = path.join(process.cwd(), 'cookie-backups');

// Ensure the cookies directory exists
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
  console.log('Created cookies directory:', COOKIES_DIR);
}

// List all cookie files
function listCookies() {
  console.log('=== Available Cookies ===');
  
  try {
    const files = fs.readdirSync(COOKIES_DIR);
    const cookieFiles = files.filter(file => file.endsWith('.txt'));
    
    if (cookieFiles.length === 0) {
      console.log('No cookies available.');
      return;
    }
    
    console.log(`Found ${cookieFiles.length} cookies:`);
    
    cookieFiles.forEach((file, index) => {
      const filePath = path.join(COOKIES_DIR, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const firstLine = content.split('\n')[0];
      
      console.log(`${index + 1}. ${file}`);
      console.log(`   Size: ${stats.size} bytes`);
      console.log(`   Created: ${stats.birthtime.toLocaleString()}`);
      console.log(`   Content: ${firstLine}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing cookies:', error);
  }
}

// Create a backup of all cookies
function backupCookies() {
  console.log('=== Backing Up Cookies ===');
  
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('Created backup directory:', BACKUP_DIR);
    }
    
    const files = fs.readdirSync(COOKIES_DIR);
    const cookieFiles = files.filter(file => file.endsWith('.txt'));
    
    if (cookieFiles.length === 0) {
      console.log('No cookies to backup.');
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupPath);
    
    cookieFiles.forEach(file => {
      const sourcePath = path.join(COOKIES_DIR, file);
      const destPath = path.join(backupPath, file);
      fs.copyFileSync(sourcePath, destPath);
    });
    
    console.log(`Backed up ${cookieFiles.length} cookies to ${backupPath}`);
  } catch (error) {
    console.error('Error backing up cookies:', error);
  }
}

// Main function
function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      listCookies();
      break;
    case 'backup':
      backupCookies();
      break;
    default:
      listCookies();
      break;
  }
}

// Run the main function
main();
