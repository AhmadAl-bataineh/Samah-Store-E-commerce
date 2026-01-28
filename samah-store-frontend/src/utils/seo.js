/**
 * SEO Utilities for Samah Store
 * Manages document head, meta tags, structured data
 */

const SITE_NAME = 'سماح ستور - Samah Store';
const SITE_URL = 'https://samah-store.tech';
const DEFAULT_IMAGE = '/assets/heroImage.jpg';
const DEFAULT_DESCRIPTION = 'سماح ستور - متجر أزياء نسائية عصرية وأنيقة. تسوقي أحدث الموديلات بأفضل الأسعار مع توصيل سريع في الأردن.';

/**
 * Normalize URL: ensure absolute, consistent trailing slash (no trailing slash except root)
 */
const normalizeUrl = (url) => {
  // Make absolute
  let normalized = url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  // Remove trailing slash except for root
  if (normalized !== SITE_URL && normalized !== `${SITE_URL}/`) {
    normalized = normalized.replace(/\/+$/, '');
  } else {
    // Root should have trailing slash for consistency
    normalized = `${SITE_URL}/`;
  }

  return normalized;
};

/**
 * Update document title and meta tags
 * SAFE: Never creates duplicates - always updates existing tags
 */
export const updatePageMeta = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = window.location.pathname,
  type = 'website',
  noindex = false,
}) => {
  // Title
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  document.title = fullTitle;

  // Normalize URLs
  const canonicalUrl = normalizeUrl(url);
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;

  // Helper to set/create meta tag (SAFE: uses querySelector to find existing first)
  const setMeta = (name, content, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Basic meta
  setMeta('description', description);

  // Robots
  setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

  // Canonical (SAFE: uses querySelector to find existing first)
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);

  // Open Graph
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', description, true);
  setMeta('og:image', imageUrl, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:type', type, true);
  setMeta('og:site_name', SITE_NAME, true);
  setMeta('og:locale', 'ar_JO', true);

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', description);
  setMeta('twitter:image', imageUrl);

  // DEV: Run integrity check after update
  if (import.meta.env?.DEV) {
    // Defer to next tick to ensure DOM is updated
    setTimeout(() => runIntegrityCheck(), 0);
  }
};

/**
 * Add JSON-LD structured data to page
 */
export const setStructuredData = (data, id = 'structured-data') => {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

/**
 * Remove structured data by id
 */
export const removeStructuredData = (id = 'structured-data') => {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
};

/**
 * Organization Schema (for site-wide use)
 */
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'سماح ستور',
  alternateName: 'Samah Store',
  url: SITE_URL,
  logo: `${SITE_URL}/assets/heroImage.jpg`,
  description: DEFAULT_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'JO',
    addressLocality: 'عمان',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Arabic', 'English'],
  },
});

/**
 * WebSite Schema with SearchAction
 */
export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Breadcrumb Schema
 */
export const getBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
  })),
});

/**
 * Product Schema
 */
export const getProductSchema = (product, selectedVariant = null) => {
  const variant = selectedVariant || (product.variants && product.variants[0]);
  const price = variant?.price || product.minVariantPrice;
  const inStock = variant ? variant.stockQuantity > 0 : true;
  const image = product.images?.[0]?.url || DEFAULT_IMAGE;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - منتج من سماح ستور`,
    image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'سماح ستور',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'JOD',
      price: price ? Number(price).toFixed(2) : '0.00',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'سماح ستور',
      },
    },
  };
};

/**
 * DEV-ONLY: Integrity check for meta tags - warns on duplicates
 * @param {boolean} verbose - If true, always log results; if false, only log on errors
 * Call from browser console: window.__seoCheck()
 */
const runIntegrityCheck = (verbose = false) => {
  if (typeof document === 'undefined') return null;

  const results = {
    duplicates: [],
    counts: {},
    status: 'OK',
  };

  // Tags to check (name-based)
  const nameTags = ['description', 'robots', 'title', 'keywords', 'author',
                    'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:url'];

  // Tags to check (property-based for OG)
  const propertyTags = ['og:title', 'og:description', 'og:image', 'og:url',
                        'og:type', 'og:site_name', 'og:locale'];

  // Check name-based meta tags
  nameTags.forEach(name => {
    const tags = document.querySelectorAll(`meta[name="${name}"]`);
    results.counts[name] = tags.length;
    if (tags.length > 1) {
      results.duplicates.push({ type: 'name', tag: name, count: tags.length });
      results.status = 'DUPLICATES_FOUND';
    }
  });

  // Check property-based meta tags (OG)
  propertyTags.forEach(prop => {
    const tags = document.querySelectorAll(`meta[property="${prop}"]`);
    results.counts[prop] = tags.length;
    if (tags.length > 1) {
      results.duplicates.push({ type: 'property', tag: prop, count: tags.length });
      results.status = 'DUPLICATES_FOUND';
    }
  });

  // Check canonical link
  const canonicals = document.querySelectorAll('link[rel="canonical"]');
  results.counts['canonical'] = canonicals.length;
  if (canonicals.length > 1) {
    results.duplicates.push({ type: 'link', tag: 'canonical', count: canonicals.length });
    results.status = 'DUPLICATES_FOUND';
  }

  // Check canonical URL is absolute
  const canonicalHref = document.querySelector('link[rel="canonical"]')?.href;
  if (canonicalHref && !canonicalHref.startsWith('http')) {
    results.warnings = results.warnings || [];
    results.warnings.push(`Canonical URL is not absolute: ${canonicalHref}`);
  }

  // Log results (only if verbose or duplicates found)
  if (import.meta.env?.DEV && (verbose || results.status !== 'OK')) {
    if (results.status === 'OK') {
      console.log('%c[SEO] ✅ Integrity check passed', 'color: green; font-weight: bold');
    } else {
      console.warn('%c[SEO] ⚠️ Duplicate meta tags detected!', 'color: red; font-weight: bold');
      console.table(results.duplicates);
    }
    if (verbose) {
      console.log('[SEO] Tag counts:', results.counts);
      console.log('[SEO] Title:', document.title);
      console.log('[SEO] Canonical:', canonicalHref);
    }
    if (results.warnings?.length) {
      results.warnings.forEach(w => console.warn('[SEO] Warning:', w));
    }
  }

  return results;
};

// Alias for backward compatibility and explicit naming
export const auditMetaTags = (verbose = true) => runIntegrityCheck(verbose);

// Expose to window for easy console access in dev
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.__auditMetaTags = () => runIntegrityCheck(true);
  window.__seoCheck = () => runIntegrityCheck(true);
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE, DEFAULT_DESCRIPTION };
