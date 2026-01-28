/**
 * Build-time script to generate sitemap-products.xml
 * Fetches all active products from the public API and generates XML sitemap
 *
 * Features:
 * - Paginates through all products
 * - Retries on failure (2 attempts)
 * - Timeout protection (5s per request)
 * - Graceful failure (doesn't break build if API is down)
 *
 * Run: node scripts/generate-product-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  apiBaseUrl: process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || 'https://samah-store.tech',
  siteUrl: 'https://samah-store.tech',
  outputPath: path.join(process.cwd(), 'public', 'sitemap-products.xml'),
  pageSize: 100,
  maxRetries: 2,
  retryDelayMs: 500,
  timeoutMs: 5000,
};

console.log('\n🗺️  Product Sitemap Generator');
console.log(`📂 Output: ${CONFIG.outputPath}\n`);

/**
 * Generate minimal fallback sitemap
 */
function generateFallbackSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Fallback sitemap - API unavailable during build -->
  <!-- Generated: ${new Date().toISOString()} -->
  <url>
    <loc>${CONFIG.siteUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`;
}

/**
 * Generate sitemap XML from products
 */
function generateSitemapXml(products) {
  const today = new Date().toISOString().split('T')[0];

  const urlEntries = products
    .filter(p => p.slug && p.active !== false)
    .map(product => {
      const lastmod = product.updatedAt
        ? new Date(product.updatedAt).toISOString().split('T')[0]
        : today;
      return `  <url>
    <loc>${CONFIG.siteUrl}/products/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Products: ${urlEntries.length} -->
${urlEntries.join('\n')}
</urlset>
`;
}

/**
 * Write sitemap to file
 */
function writeSitemap(xml) {
  const dir = path.dirname(CONFIG.outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.outputPath, xml, 'utf8');
  console.log(`✅ Written: ${CONFIG.outputPath} (${(xml.length / 1024).toFixed(2)} KB)\n`);
}

/**
 * HTTP GET with timeout
 */
function httpGet(url, timeout) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

/**
 * Fetch products with retry
 */
async function fetchProducts() {
  const products = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < 10) {
    const url = `${CONFIG.apiBaseUrl}/api/products?page=${page}&size=${CONFIG.pageSize}`;

    let attempts = 0;
    let data = null;

    while (attempts < CONFIG.maxRetries && !data) {
      attempts++;
      try {
        console.log(`  📡 Page ${page + 1} (attempt ${attempts})...`);
        data = await httpGet(url, CONFIG.timeoutMs);
      } catch (err) {
        console.warn(`  ⚠️  ${err.message}`);
        if (attempts < CONFIG.maxRetries) {
          await new Promise(r => setTimeout(r, CONFIG.retryDelayMs));
        }
      }
    }

    if (!data) throw new Error('Failed to fetch after retries');

    if (data.content && Array.isArray(data.content)) {
      products.push(...data.content);
      totalPages = data.totalPages || 1;
      console.log(`  ✓ Got ${data.content.length} products`);
    }
    page++;
  }

  return products;
}

/**
 * Main
 */
async function main() {
  let xml;

  try {
    const products = await fetchProducts();
    if (products.length > 0) {
      xml = generateSitemapXml(products);
      console.log(`\n✅ Generated sitemap with ${products.length} products`);
    } else {
      console.warn('\n⚠️  No products found, using fallback');
      xml = generateFallbackSitemap();
    }
  } catch (error) {
    console.error(`\n❌ API Error: ${error.message}`);
    console.log('📝 Using fallback sitemap');
    xml = generateFallbackSitemap();
  }

  writeSitemap(xml);
}

// Run with global timeout (30 seconds max)
const globalTimeout = setTimeout(() => {
  console.error('\n⏱️  Global timeout reached, writing fallback');
  writeSitemap(generateFallbackSitemap());
  process.exit(0);
}, 30000);

main()
  .then(() => { clearTimeout(globalTimeout); process.exit(0); })
  .catch(() => { clearTimeout(globalTimeout); process.exit(0); });
