/**
 * Favicon Generator - Auto-crop and center for circular appearance
 *
 * Features:
 * - Auto-crops transparent/white padding
 * - Centers icon content properly
 * - Generates all required sizes
 * - No redesign, only proper cropping and scaling
 */

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_PNG = path.join(__dirname, '..', 'src', 'assets', 'favicon.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

console.log('\n🎨 Favicon Generator (Auto-crop + Center)');
console.log('═'.repeat(50));
console.log('📐 Cropping padding and centering content');
console.log('');

async function generateFavicons() {
  try {
    // Verify PNG source exists
    if (!fs.existsSync(SOURCE_PNG)) {
      throw new Error(`Source PNG not found: ${SOURCE_PNG}`);
    }

    // Ensure directories exist
    [OUTPUT_DIR, PUBLIC_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Get source metadata
    const metadata = await sharp(SOURCE_PNG).metadata();
    console.log(`📂 Source: ${SOURCE_PNG}`);
    console.log(`📐 Original: ${metadata.width}x${metadata.height}`);

    // Step 1: Auto-trim transparent/near-white padding
    console.log('\n✂️  Auto-cropping padding...');
    const trimmedBuffer = await sharp(SOURCE_PNG)
      .trim({
        threshold: 20, // More aggressive trim
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    const trimmedMeta = await sharp(trimmedBuffer).metadata();
    console.log(`   Trimmed: ${trimmedMeta.width}x${trimmedMeta.height}`);

    /**
     * Generate properly centered and scaled icon
     */
    const generateIcon = async (size, outputPath, options = {}) => {
      const { sharpen = false, padding = 0.02 } = options;

      // Calculate content size with minimal padding
      const contentSize = Math.floor(size * (1 - padding * 2));
      const offset = Math.floor((size - contentSize) / 2);

      // Resize trimmed content to fit
      let resizedContent = await sharp(trimmedBuffer)
        .resize(contentSize, contentSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          kernel: sharp.kernel.lanczos3,
        })
        .toBuffer();

      // Apply sharpening for small sizes
      if (sharpen) {
        resizedContent = await sharp(resizedContent)
          .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.5 })
          .toBuffer();
      }

      // Create final canvas and place centered content
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([{
          input: resizedContent,
          left: offset,
          top: offset,
        }])
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

      return outputPath;
    };

    // ==========================================
    // Generate PNG favicons
    // ==========================================
    console.log('\n🔧 Generating favicon sizes...');

    // 16x16 - Sharpening for clarity at small size
    const favicon16 = path.join(OUTPUT_DIR, 'favicon-16x16.png');
    await generateIcon(16, favicon16, { sharpen: true, padding: 0.03 });
    console.log('   ✅ favicon-16x16.png');

    // 32x32 - Primary favicon size
    const favicon32 = path.join(OUTPUT_DIR, 'favicon-32x32.png');
    await generateIcon(32, favicon32, { sharpen: true, padding: 0.03 });
    console.log('   ✅ favicon-32x32.png');

    // 48x48 - No sharpening needed
    const favicon48 = path.join(OUTPUT_DIR, 'favicon-48x48.png');
    await generateIcon(48, favicon48, { sharpen: false, padding: 0.03 });
    console.log('   ✅ favicon-48x48.png');

    // ==========================================
    // Generate Apple Touch Icon (180x180)
    // ==========================================
    console.log('\n🍎 Generating Apple Touch Icon...');
    const appleTouchPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
    await generateIcon(180, appleTouchPath, { sharpen: false, padding: 0.05 });
    console.log('   ✅ apple-touch-icon.png (180x180)');

    // ==========================================
    // Generate ICO file (multi-resolution)
    // ==========================================
    console.log('\n🖼️  Generating ICO file...');
    const icoPath = path.join(OUTPUT_DIR, 'favicon.ico');

    const icoPngs = await Promise.all(
      [favicon16, favicon32, favicon48].map(async (filePath) => {
        return fs.readFileSync(filePath);
      })
    );

    const icoBuffer = await pngToIco(icoPngs);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('   ✅ favicon.ico (16x16, 32x32, 48x48 combined)');

    // ==========================================
    // Generate PWA icons
    // ==========================================
    console.log('\n📱 Generating PWA icons...');

    const icon192 = path.join(OUTPUT_DIR, 'icon-192x192.png');
    await generateIcon(192, icon192, { sharpen: false, padding: 0.05 });
    console.log('   ✅ icon-192x192.png');

    const icon512 = path.join(OUTPUT_DIR, 'icon-512x512.png');
    await generateIcon(512, icon512, { sharpen: false, padding: 0.05 });
    console.log('   ✅ icon-512x512.png');

    // ==========================================
    // Copy to public directory
    // ==========================================
    console.log('\n📦 Copying to public directory...');

    fs.copyFileSync(icoPath, path.join(PUBLIC_DIR, 'favicon.ico'));
    console.log('   ✅ public/favicon.ico');

    fs.copyFileSync(favicon32, path.join(PUBLIC_DIR, 'favicon.png'));
    console.log('   ✅ public/favicon.png');

    fs.copyFileSync(appleTouchPath, path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
    console.log('   ✅ public/apple-touch-icon.png');

    fs.copyFileSync(icon192, path.join(PUBLIC_DIR, 'icon-192x192.png'));
    console.log('   ✅ public/icon-192x192.png');

    fs.copyFileSync(icon512, path.join(PUBLIC_DIR, 'icon-512x512.png'));
    console.log('   ✅ public/icon-512x512.png');

    // ==========================================
    // Summary
    // ==========================================
    console.log('\n' + '═'.repeat(50));
    console.log('✨ Favicon generation complete!');
    console.log('');
    console.log('📁 Generated files:');

    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach(file => {
      const stats = fs.statSync(path.join(OUTPUT_DIR, file));
      console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

    console.log('');
    console.log('🎯 Generation complete:');
    console.log('   - Auto-cropped padding for better fill');
    console.log('   - Centered content in all sizes');
    console.log('   - favicon.ico (16x16, 32x32, 48x48)');
    console.log('   - apple-touch-icon.png (180x180)');
    console.log('   - icon-192x192.png, icon-512x512.png');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateFavicons();
