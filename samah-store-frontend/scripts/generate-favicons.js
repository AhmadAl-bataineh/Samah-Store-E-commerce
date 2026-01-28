/**
 * Favicon Generator Script
 * Generates production-ready favicons from source image
 *
 * IMPORTANT: Uses source image AS-IS without modifications
 * - No redesign, redrawing, or simplification
 * - No color, shape, or style changes
 * - Only resizes to required favicon dimensions
 */

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_IMAGE = path.join(__dirname, '..', 'src', 'assets', 'topsite.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'favicons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Favicon sizes to generate
const FAVICON_SIZES = [16, 32, 48];
const APPLE_TOUCH_SIZE = 180;

console.log('\n🎨 Favicon Generator');
console.log('═'.repeat(50));
console.log(`📂 Source: ${SOURCE_IMAGE}`);
console.log(`📁 Output: ${OUTPUT_DIR}`);
console.log('⚠️  Using source image AS-IS (no modifications)');
console.log('');

async function generateFavicons() {
  try {
    // Verify source exists
    if (!fs.existsSync(SOURCE_IMAGE)) {
      throw new Error(`Source image not found: ${SOURCE_IMAGE}`);
    }

    // Ensure output directories exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get source image metadata
    const metadata = await sharp(SOURCE_IMAGE).metadata();
    console.log(`📐 Source dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`📊 Source format: ${metadata.format}`);
    console.log('');

    // Determine if image is square, if not we'll center-crop
    const isSquare = metadata.width === metadata.height;
    const size = Math.min(metadata.width, metadata.height);

    // Base processing pipeline
    const getBaseImage = () => {
      let pipeline = sharp(SOURCE_IMAGE);

      // If not square, extract center square
      if (!isSquare) {
        const left = Math.floor((metadata.width - size) / 2);
        const top = Math.floor((metadata.height - size) / 2);
        pipeline = pipeline.extract({ left, top, width: size, height: size });
        console.log(`✂️  Cropping to center square: ${size}x${size}`);
      }

      return pipeline;
    };

    // Generate PNG favicons
    console.log('🔧 Generating PNG favicons...');
    const pngPaths = [];

    for (const faviconSize of FAVICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `favicon-${faviconSize}x${faviconSize}.png`);

      await getBaseImage()
        .resize(faviconSize, faviconSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
          kernel: sharp.kernel.lanczos3, // High-quality downscaling
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath);

      pngPaths.push(outputPath);
      console.log(`   ✅ favicon-${faviconSize}x${faviconSize}.png`);
    }

    // Generate Apple Touch Icon (180x180)
    console.log('\n🍎 Generating Apple Touch Icon...');
    const appleTouchPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');

    await getBaseImage()
      .resize(APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background for iOS
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        quality: 100,
        compressionLevel: 9,
      })
      .toFile(appleTouchPath);

    console.log(`   ✅ apple-touch-icon.png (${APPLE_TOUCH_SIZE}x${APPLE_TOUCH_SIZE})`);

    // Generate ICO file (multi-resolution)
    console.log('\n🖼️  Generating ICO file...');
    const icoPath = path.join(OUTPUT_DIR, 'favicon.ico');

    // Create temporary PNGs for ICO if not already the right sizes
    const icoPngs = await Promise.all(
      [16, 32, 48].map(async (size) => {
        const tempPath = path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`);
        return fs.readFileSync(tempPath);
      })
    );

    const icoBuffer = await pngToIco(icoPngs);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('   ✅ favicon.ico (16x16, 32x32, 48x48)');

    // Copy essential files to public directory for direct serving
    console.log('\n📦 Copying to public directory...');

    // Copy ICO to public root
    fs.copyFileSync(icoPath, path.join(PUBLIC_DIR, 'favicon.ico'));
    console.log('   ✅ public/favicon.ico');

    // Copy apple-touch-icon to public
    fs.copyFileSync(appleTouchPath, path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
    console.log('   ✅ public/apple-touch-icon.png');

    // Copy 32x32 as default favicon.png
    fs.copyFileSync(
      path.join(OUTPUT_DIR, 'favicon-32x32.png'),
      path.join(PUBLIC_DIR, 'favicon.png')
    );
    console.log('   ✅ public/favicon.png');

    // Generate manifest icons (for PWA)
    console.log('\n📱 Generating PWA icons...');
    const pwaIconSizes = [192, 512];

    for (const pwaSize of pwaIconSizes) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${pwaSize}x${pwaSize}.png`);

      await getBaseImage()
        .resize(pwaSize, pwaSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
          kernel: sharp.kernel.lanczos3,
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath);

      // Also copy to public
      fs.copyFileSync(outputPath, path.join(PUBLIC_DIR, `icon-${pwaSize}x${pwaSize}.png`));
      console.log(`   ✅ icon-${pwaSize}x${pwaSize}.png`);
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('✨ Favicon generation complete!');
    console.log('');
    console.log('📁 Generated files:');
    console.log('   src/assets/favicons/');
    fs.readdirSync(OUTPUT_DIR).forEach(file => {
      const stats = fs.statSync(path.join(OUTPUT_DIR, file));
      console.log(`      - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
    console.log('');
    console.log('   public/');
    ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'icon-192x192.png', 'icon-512x512.png'].forEach(file => {
      const filePath = path.join(PUBLIC_DIR, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`      - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      }
    });
    console.log('');
    console.log('📝 Next: Update index.html with favicon links (see below)');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateFavicons();
