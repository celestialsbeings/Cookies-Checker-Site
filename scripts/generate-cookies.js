#!/usr/bin/env node

/**
 * Script to generate sample cookie files for testing
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

// Ensure the cookies directory exists
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
  console.log('Created cookies directory:', COOKIES_DIR);
}

// Generate a random cookie ID
function generateCookieId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Cookie types
const cookieTypes = [
  'CHOCOLATE_CHIP',
  'OATMEAL_RAISIN',
  'SUGAR',
  'PEANUT_BUTTER',
  'DOUBLE_CHOCOLATE',
  'MACADAMIA_NUT'
];

// Generate a random cookie type
function getRandomCookieType() {
  return cookieTypes[Math.floor(Math.random() * cookieTypes.length)];
}

// Generate a random future date
function getRandomFutureDate() {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setFullYear(now.getFullYear() + 1 + Math.floor(Math.random() * 2));
  return futureDate.toISOString().split('T')[0];
}

// Generate a random value
function getRandomValue() {
  return (Math.floor(Math.random() * 10) + 1).toFixed(2);
}

// Generate a cookie file
function generateCookieFile(index) {
  const cookieId = generateCookieId();
  const cookieType = getRandomCookieType();
  const expiryDate = getRandomFutureDate();
  const value = getRandomValue();
  
  const content = `COOKIE_CODE: ${cookieId}
COOKIE_TYPE: ${cookieType}
EXPIRY: ${expiryDate}
VALUE: $${value}`;
  
  const filename = `cookie_${index}.txt`;
  const filePath = path.join(COOKIES_DIR, filename);
  
  fs.writeFileSync(filePath, content);
  console.log(`Generated cookie file: ${filename}`);
}

// Main function
function main() {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 10;
  
  console.log(`Generating ${count} cookie files...`);
  
  for (let i = 1; i <= count; i++) {
    generateCookieFile(i);
  }
  
  console.log('Done!');
}

// Run the main function
main();
