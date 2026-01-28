/**
 * SAMAH STORE - Homepage
 * Feminine fashion boutique landing page
 * Single-product focused with editorial style
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, RefreshCw, Shield } from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { productsApi } from '../services/productsApi';
import { getImageUrl } from '../utils/imageUtils';
import { heroApi } from '../services/heroApi';
import { useToast } from '../context/ToastContext';
import heroImageFallback from '../assets/heroImage.jpg';
import { updatePageMeta } from '../utils/seo';

// ══════════════════════════════════════════════════════════════════
// HERO SECTION (Dynamic from backend)
// ══════════════════════════════════════════════════════════════════

const HeroSection = ({ heroData, loading }) => {
  // Fallback to hardcoded values if API fails
  const fallback = {
    badgeText: 'مجموعة جديدة',
    titleLine1: 'أناقة عصرية',
    titleLine2: 'بلمسة مميزة',
    description: 'اكتشفي تشكيلتنا المختارة بعناية من الأزياء العصرية التي تعكس ذوقك الراقي',
    ctaText: 'تسوّقي الآن',
    ctaLink: '/products',
    heroImageUrl: null,
  };

  const hero = heroData || fallback;

  // --- Image resolution + diagnostics & self-healing ---
  // States to track resolved URL and whether fallback is active
  const [resolvedUrl, setResolvedUrl] = useState(null);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [warned, setWarned] = useState(false);

  useEffect(() => {
    // Reset on hero change
    setFallbackActive(false);
    setResolvedUrl(null);

    const raw = hero.heroImageUrl;
    if (!raw) {
      setResolvedUrl(heroImageFallback);
      return;
    }

    const candidate = getImageUrl(raw);
    // DEV: always show candidate; in production ensure uploads are prefixed by VITE_API_BASE_URL
    const isUploadsPath = raw.startsWith('/uploads') || raw.includes('/uploads/');
    const candidateLooksRelativeToBackend = candidate.startsWith('/uploads');

    // If backend-hosted uploads are referenced but API base is not set in production, fallback.
    if (isUploadsPath && candidateLooksRelativeToBackend && !import.meta.env.DEV) {
      if (!warned) {
        console.warn('[Hero] Missing VITE_API_BASE_URL — falling back to local hero image for:', candidate);
        setWarned(true);
      }
      setFallbackActive(true);
      setResolvedUrl(heroImageFallback);
      return;
    }

    // Otherwise use the resolved candidate URL (could be absolute or prefixed)
    setResolvedUrl(candidate);
    // Log for diagnostics in DEV only
    if (import.meta.env.DEV) {
      console.log('[Hero] heroImageUrl (raw):', raw, '-> resolved:', candidate, 'fallbackActive:', false);
    }
  }, [hero && hero.heroImageUrl]);

  if (loading) {
    return (
      <section className="relative bg-ivory-100 overflow-hidden">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 min-h-[400px] sm:min-h-[480px] lg:min-h-[600px] items-center py-6 sm:py-8 lg:py-0">
            <div className="order-2 lg:order-1">
              <div className="max-w-lg space-y-4 sm:space-y-6 animate-pulse">
                <div className="h-3 sm:h-4 bg-ivory-200 rounded w-1/4" />
                <div className="h-8 sm:h-12 bg-ivory-200 rounded w-3/4" />
                <div className="h-16 sm:h-20 bg-ivory-100 rounded" />
                <div className="h-10 sm:h-12 bg-ivory-200 rounded w-1/3" />
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] bg-ivory-200 rounded-xl sm:rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-ivory-100 overflow-hidden">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 min-h-[400px] sm:min-h-[480px] lg:min-h-[600px] items-center py-6 sm:py-8 lg:py-12">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="max-w-lg">
              {/* Badge */}
              <span className="inline-block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-berry-500 font-medium mb-4 sm:mb-6">
                {hero.badgeText}
              </span>

              {/* Headline */}
              <h1
                className="font-serif text-charcoal-800 mb-4 sm:mb-6"
                style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: 1.1 }}
              >
                {hero.titleLine1}
                <span className="block text-rose-400">{hero.titleLine2}</span>
              </h1>

              {/* Subheadline */}
              <p className="text-charcoal-500 text-sm sm:text-body-lg mb-6 sm:mb-10 max-w-md leading-relaxed">
                {hero.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link to={hero.ctaLink} className="btn-primary px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl w-full sm:w-auto text-center text-sm sm:text-base">
                  {hero.ctaText}
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>

          {/* Image - Unified aspect ratio approach */}
          <div className="relative order-1 lg:order-2">
            <div className="aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl shadow-soft">
              <img
                src={resolvedUrl || heroImageFallback}
                alt="Samah Fashion Collection"
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  // Avoid infinite loop — only switch to fallback once
                  if (fallbackActive) return;
                  setFallbackActive(true);
                  // warn once in console
                  if (!warned) {
                    console.warn('[Hero] image failed to load, switching to fallback for URL:', e.currentTarget.src);
                    setWarned(true);
                  }
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = heroImageFallback;
                }}
              />
              {/* Subtle editorial gradient overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-l from-black/8 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════════════════════════
// PRODUCT SPOTLIGHT
// ══════════════════════════════════════════════════════════════════

const ProductSpotlight = ({ product, loading }) => {

  if (loading) {
    return (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container-main">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="aspect-[4/3] sm:aspect-[4/5] lg:aspect-product bg-ivory-200 rounded-xl sm:rounded-2xl animate-pulse" />
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-3 sm:h-4 bg-ivory-200 rounded w-1/4" />
                  <div className="h-6 sm:h-8 bg-ivory-200 rounded w-3/4" />
                  <div className="h-16 sm:h-20 bg-ivory-100 rounded" />
                  <div className="h-8 sm:h-10 bg-ivory-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        </section>
    );
  }

  if (!product) return null;

  return (
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container-main">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-berry-500 font-medium mb-2 sm:mb-3 block">
            المنتج المميز
          </span>
            <h2 className="font-serif text-charcoal-800 text-xl sm:text-2xl lg:text-display-sm">اختيارنا لكِ</h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
              {/* Product Image */}
              <Link
                  to={`/products/${product.slug || product.id}`}
                  className="group relative aspect-[4/3] sm:aspect-[4/5] lg:aspect-product bg-ivory-100 rounded-xl sm:rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-400 focus-visible:ring-offset-2"
              >
                {product.primaryImageUrl ? (
                    <img
                        src={getImageUrl(product.primaryImageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 sm:group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-ivory-100">
                      <span className="font-serif text-4xl sm:text-5xl text-rose-300">S</span>
                    </div>
                )}
              </Link>

              {/* Product Details */}
              <div>
                {product.category && (
                    <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-charcoal-500 mb-2 sm:mb-3 block">
                  {product.category.name}
                </span>
                )}

                <h3 className="font-serif text-charcoal-800 text-lg sm:text-xl lg:text-heading mb-3 sm:mb-4">{product.name}</h3>

                <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 line-clamp-3 sm:line-clamp-none">
                  {product.description ||
                      'قطعة مميزة تجمع بين الأناقة والراحة، مصممة بعناية لتمنحك إطلالة استثنائية'}
                </p>

                {/* Price */}
                <div className="mb-6 sm:mb-8">
                  {product.minVariantPrice != null ? (
                      <span className="font-serif text-xl sm:text-2xl text-charcoal-800 tabular-nums">
                        {Number(product.minVariantPrice).toFixed(2)} د.أ
                      </span>
                  ) : (
                      <span className="font-serif text-xl sm:text-2xl text-charcoal-800">السعر غير متوفر</span>
                  )}
                </div>

                <Link
                  to={`/products/${product.slug || product.id}`}
                  className="btn-primary px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base w-full sm:w-auto text-center inline-flex items-center justify-center gap-2"
                >
                  عرض التفاصيل
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

// ══════════════════════════════════════════════════════════════════
// NEW ARRIVALS
// ══════════════════════════════════════════════════════════════════

const NewArrivals = ({ products, loading }) => {
  return (
      <section className="py-8 sm:py-12 lg:py-16 bg-ivory-100">
        <div className="container-main">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-12">
            <div>
            <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-berry-500 font-medium mb-1 sm:mb-2 block">
              جديد
            </span>
              <h2 className="font-serif text-charcoal-800 text-xl sm:text-2xl lg:text-display-sm">وصل حديثاً</h2>
            </div>
            <Link to="/products?sort=createdAt,desc" className="btn-ghost group text-sm">
              <span>عرض الكل</span>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-ivory-200 rounded-xl sm:rounded-2xl mb-2 sm:mb-3" />
                      <div className="h-2.5 sm:h-3 bg-ivory-200 rounded w-3/4 mb-1.5 sm:mb-2" />
                      <div className="h-2.5 sm:h-3 bg-ivory-100 rounded w-1/2" />
                    </div>
                ))}
              </div>
          ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {(products || []).slice(0, 8).map((product, index) => (
                    <div
                        key={product.id}
                        className="opacity-0 animate-fade-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                ))}
              </div>
          )}
        </div>
      </section>
  );
};

// ══════════════════════════════════════════════════════════════════
// BRAND PROMISE
// ══════════════════════════════════════════════════════════════════

const BRAND_VALUES = [
  { icon: Truck, title: 'توصيل سريع', desc: 'لكافة محافظات الأردن' },
  { icon: RefreshCw, title: 'معاينة وقياس', desc: 'بوجود المندوب' },
  { icon: Shield, title: 'الدفع عند الاستلام', desc: 'تفقدي الطلب قبل الدفع' }
];

const BrandPromise = () => {
  return (
      <section className="py-8 sm:py-10 lg:py-14 bg-white border-y border-charcoal-200/60">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {BRAND_VALUES.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-medium text-charcoal-800 text-sm sm:text-base mb-0.5 sm:mb-1">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-charcoal-500">{item.desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>
  );
};

// ══════════════════════════════════════════════════════════════════
// NEWSLETTER
// ══════════════════════════════════════════════════════════════════

const Newsletter = () => {
  const [email, setEmail] = useState('');

  return (
      <section className="py-8 sm:py-12 lg:py-16 bg-ivory-200">
        <div className="container-main">
          <div className="max-w-lg mx-auto text-center">
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-berry-500 font-medium mb-2 sm:mb-3 block">
            النشرة البريدية
          </span>
            <h2 className="font-serif text-charcoal-800 text-xl sm:text-2xl lg:text-display-sm mb-3 sm:mb-4">ابقي على اطلاع</h2>
            <p className="text-charcoal-500 text-sm sm:text-base mb-6 sm:mb-8">اشتركي للحصول على أحدث العروض والمجموعات الجديدة</p>

            <form className="flex flex-col sm:flex-row gap-3">
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="input-field flex-1 text-center sm:text-right text-sm sm:text-base py-3"
                  required
              />
              <button type="submit" className="btn-primary px-6 sm:px-8 py-3 rounded-xl whitespace-nowrap text-sm sm:text-base min-h-[44px]">
                اشتراك
              </button>
            </form>
          </div>
        </div>
      </section>
  );
};

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

const HomePage = () => {
  const [heroData, setHeroData] = useState(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  // SEO: Update page meta
  useEffect(() => {
    updatePageMeta({
      title: 'الصفحة الرئيسية',
      description: 'سماح ستور - متجر أزياء نسائية عصرية وأنيقة. تسوقي أحدث الموديلات بأفضل الأسعار مع توصيل سريع في الأردن.',
      url: '/',
    });
  }, []);

  // Fetch hero settings
  useEffect(() => {
    const fetchHero = async () => {
      try {
        setHeroLoading(true);
        const data = await heroApi.getPublicHero();
        setHeroData(data);
      } catch (err) {
        console.error('Failed to load hero settings:', err);
        // Silently fail - HeroSection will use fallback
      } finally {
        setHeroLoading(false);
      }
    };

    fetchHero();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsData = await productsApi.getProducts({
          page: 0,
          size: 9,
          sort: 'createdAt,desc',
        });

        const products = productsData.content || [];
        if (products.length > 0) {
          setFeaturedProduct(products[0]);
          setLatestProducts(products.slice(1));
        } else {
          setFeaturedProduct(null);
          setLatestProducts([]);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error]);

  return (
      <div className="bg-ivory-100 pt-14 sm:pt-16">
        <HeroSection heroData={heroData} loading={heroLoading} />
        <ProductSpotlight product={featuredProduct} loading={loading} />
        <NewArrivals products={latestProducts} loading={loading} />
        <BrandPromise />
        {/* EditorialSection removed to prevent errors/breaking HomePage */}
        <Newsletter />
      </div>
  );
};

export default HomePage;
