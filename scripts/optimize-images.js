import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';

// Convert exec to promise-based
const execAsync = promisify(exec);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the public directory
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SRC_DIR = path.join(process.cwd(), 'src');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

// Function to check if a file is an image
function isImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// Function to optimize an image
async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    if (ext === '.svg') {
      // Optimize SVG
      await execAsync(`npx svgo "${filePath}" -o "${filePath}"`);
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      // Optimize PNG/JPG
      await execAsync(`npx sharp "${filePath}" -o "${filePath}" --quality 80`);
    }
    
    console.log(`Optimized: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find all images in a directory
function findImages(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (item !== 'node_modules' && item !== 'dist') {
        results = results.concat(findImages(itemPath));
      }
    } else if (isImage(itemPath)) {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Main function
async function main() {
  console.log('Finding images to optimize...');
  
  // Find all images in public and src directories
  const publicImages = findImages(PUBLIC_DIR);
  const srcImages = findImages(SRC_DIR);
  const allImages = [...publicImages, ...srcImages];
  
  console.log(`Found ${allImages.length} images to optimize`);
  
  // Optimize all images
  let optimizedCount = 0;
  
  for (const image of allImages) {
    const success = await optimizeImage(image);
    if (success) {
      optimizedCount++;
    }
  }
  
  console.log(`Optimization complete! Optimized ${optimizedCount} out of ${allImages.length} images`);
}

// Run the main function
main().catch(console.error);
