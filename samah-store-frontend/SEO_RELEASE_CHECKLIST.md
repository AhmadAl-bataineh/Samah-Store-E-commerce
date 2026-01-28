# SEO Release Checklist

## Pre-Deployment Verification

### 1. Meta Tags Integrity
```bash
# In browser console (dev mode):
window.__seoCheck()

# Expected output:
# [SEO] ✅ Integrity check passed
```

### 2. Canonical URL Verification
```bash
# Check canonical is absolute and correct:
curl -s https://samah-store.tech/ | grep 'rel="canonical"'
# Expected: <link rel="canonical" href="https://samah-store.tech/">

curl -s https://samah-store.tech/products | grep 'rel="canonical"'
# Expected: <link rel="canonical" href="https://samah-store.tech/products">
```

### 3. Robots.txt Verification
```bash
curl https://samah-store.tech/robots.txt
```
**Verify disallowed routes match actual private routes:**
- ✅ `/admin/*` - Admin dashboard
- ✅ `/employee/*` - Employee dashboard
- ✅ `/cart` - Shopping cart
- ✅ `/checkout` - Checkout flow
- ✅ `/orders/*` - Order history
- ✅ `/login` - Login page
- ✅ `/register` - Registration page
- ✅ `/403` - Forbidden page

### 4. Sitemap Verification
```bash
curl https://samah-store.tech/sitemap.xml
```
**Validate with:** https://www.xml-sitemaps.com/validate-xml-sitemap.html

---

## Google Search Console Setup

### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Choose "URL prefix" method
4. Enter: `https://samah-store.tech`

### Step 2: Verify Ownership
**Recommended method: HTML tag**
1. Copy the meta tag provided
2. Add to `index.html` in `<head>`:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```
3. Deploy and verify

### Step 3: Submit Sitemap
1. Go to "Sitemaps" in left sidebar
2. Enter: `sitemap.xml`
3. Click "Submit"

### Step 4: Request Indexing
1. Go to "URL Inspection"
2. Enter homepage URL
3. Click "Request Indexing"
4. Repeat for key pages: `/products`, `/about`, `/contact`

---

## Product Sitemap (Future Enhancement)

### Current Limitation
The static `sitemap.xml` only includes fixed routes. Product pages (`/products/{slug}`) are not included because:
- Product slugs are dynamic (stored in database)
- Frontend SPA cannot generate sitemap at build time

### Recommended Solutions

#### Option A: Backend-Generated Sitemap (Recommended)
Add endpoint to Spring Boot backend:

```java
// GET /api/public/sitemap-products.xml
@GetMapping(value = "/sitemap-products.xml", produces = "application/xml")
public String getProductSitemap() {
    List<Product> products = productRepository.findByActiveTrue();
    // Generate XML with product URLs
}
```

Then update `robots.txt`:
```
Sitemap: https://samah-store.tech/sitemap.xml
Sitemap: https://samah-store.tech/api/public/sitemap-products.xml
```

#### Option B: Build-Time Generation
Create a build script that:
1. Fetches products from API
2. Generates `sitemap-products.xml`
3. Copies to `public/` before build

```javascript
// scripts/generate-sitemap.js
const axios = require('axios');
const fs = require('fs');

async function generateProductSitemap() {
  const { data } = await axios.get('https://api.samah-store.tech/api/products?size=1000');
  const products = data.content;
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products.map(p => `  <url>
    <loc>https://samah-store.tech/products/${p.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
  
  fs.writeFileSync('public/sitemap-products.xml', xml);
}

generateProductSitemap();
```

Add to `package.json`:
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-sitemap.js",
    "build": "vite build"
  }
}
```

#### Option C: Google Merchant Center (For E-commerce)
Use Google Merchant Center product feed instead of sitemap for product discovery.

---

## Monitoring

### Weekly Checks
- [ ] Check Search Console for crawl errors
- [ ] Review "Coverage" report for indexed pages
- [ ] Check "Core Web Vitals" report

### Monthly Checks
- [ ] Review search performance (impressions, clicks, CTR)
- [ ] Check for manual actions or security issues
- [ ] Update sitemap if new static pages added

---

## Structured Data Testing

Test your pages at:
- https://search.google.com/test/rich-results
- https://validator.schema.org/

**Pages to test:**
- Homepage (Organization + WebSite schema)
- Product detail page (Product + BreadcrumbList schema)

---

## Social Share Preview Testing

Test at:
- https://www.opengraph.xyz/
- https://cards-dev.twitter.com/validator
- https://developers.facebook.com/tools/debug/

**Verify:**
- ✅ Image displays correctly
- ✅ Title is correct
- ✅ Description is correct
- ✅ URL is canonical
