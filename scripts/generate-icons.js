import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the icons directory
const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

// Ensure the icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  console.log('Created icons directory:', ICONS_DIR);
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate a simple cookie icon
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, size, size);
  
  // Cookie base
  ctx.fillStyle = '#C4A484';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Cookie chips
  ctx.fillStyle = '#3F2305';
  const chipCount = Math.floor(size / 20);
  for (let i = 0; i < chipCount; i++) {
    const x = size / 2 + (Math.random() - 0.5) * size * 0.6;
    const y = size / 2 + (Math.random() - 0.5) * size * 0.6;
    const chipSize = size * 0.05 + Math.random() * size * 0.05;
    
    ctx.beginPath();
    ctx.arc(x, y, chipSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  
  return canvas.toBuffer('image/png');
}

// Generate icons for all sizes
function generateIcons() {
  console.log('Generating app icons...');
  
  sizes.forEach(size => {
    const iconBuffer = generateIcon(size);
    const filePath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    fs.writeFileSync(filePath, iconBuffer);
    console.log(`Generated icon: ${filePath}`);
  });
  
  console.log('Icon generation complete!');
}

// Run the icon generation
generateIcons();
