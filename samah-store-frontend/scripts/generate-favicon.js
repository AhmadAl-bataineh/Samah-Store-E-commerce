/**
 * Favicon Generator Script
 * Generates PNG favicon files from SVG using sharp
 *
 * Run: node scripts/generate-favicon.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Read the SVG file
const svgPath = path.join(publicDir, 'favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generateFavicons() {
  console.log('🎨 Generating luxury favicon set...\n');

  try {
    // Generate PNG icons at different sizes
    const sizes = [
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'icon-192x192.png', size: 192 },
      { name: 'icon-512x512.png', size: 512 },
    ];

    for (const { name, size } of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`  ✅ ${name} (${size}x${size})`);
    }

    // Generate ICO file (just use 32x32 PNG as base)
    const ico32 = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();

    // For favicon.ico, we'll create a simple PNG and rename it
    // (Modern browsers accept PNG as favicon.ico)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log(`  ✅ favicon.ico (32x32 PNG)`);

    console.log('\n✨ All favicons generated successfully!');
    console.log('\nFiles created in public/:');
    console.log('  - favicon.svg (source)');
    console.log('  - favicon.ico');
    console.log('  - favicon-32x32.png');
    console.log('  - apple-touch-icon.png');
    console.log('  - icon-192x192.png');
    console.log('  - icon-512x512.png');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
