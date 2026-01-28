/**
 * SAMAH STORE - Product Card
 * Premium feminine fashion product display
 * Optimized for mobile-first with luxury aesthetics
 */

import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';

export const ProductCard = ({ product }) => {

  const imageUrl = getImageUrl(product.primaryImageUrl);
  const price = product.minVariantPrice || 0;
  const originalPrice = product.originalPrice;
  const isOnSale = originalPrice && originalPrice > price;

  return (
    <Link 
      to={`/products/${product.slug}`} 
      className="group block rounded-xl sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-400 focus-visible:ring-offset-2"
    >
      {/* Image Container - Fixed aspect ratio prevents layout shift */}
      {/* Mobile: compact 3:4 ratio with max-height cap for comfortable density */}
      {/* Desktop: slightly taller product aspect for fashion presentation */}
      <div className="
        relative overflow-hidden rounded-xl sm:rounded-2xl
        bg-ivory-100
        border border-charcoal-100/60
        mb-3 sm:mb-4
        aspect-[3/4] sm:aspect-[4/5] lg:aspect-product
        max-h-[180px] sm:max-h-[280px] lg:max-h-none
        transition-shadow duration-300
        group-hover:shadow-soft
      ">
        {/* Product Image with proper lazy loading */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="
              w-full h-full
              object-cover object-[50%_20%]
              transition-transform duration-500 will-change-transform
              sm:group-hover:scale-[1.03]
            "
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.jpg'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-ivory-100">
            <span className="font-serif text-3xl sm:text-4xl text-rose-300">S</span>
          </div>
        )}

        {/* Soft inner highlight - premium print frame effect */}
        <div className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/8 via-transparent to-transparent" />

        {/* Sale Badge */}
        {isOnSale && (
          <span className="
            absolute top-2 left-2 sm:top-3 sm:left-3
            px-2 py-0.5 sm:px-2.5 sm:py-1
            bg-berry-500 text-white
            text-[9px] sm:text-[10px] font-medium tracking-wide
            rounded-full
          ">
            تخفيض
          </span>
        )}

        {/* New Badge */}
        {product.isNew && (
          <span className="
            absolute top-2 right-2 sm:top-3 sm:right-3
            px-2 py-0.5 sm:px-2.5 sm:py-1
            bg-rose-300 text-charcoal-800
            text-[9px] sm:text-[10px] font-medium tracking-wide
            rounded-full
          ">
            جديد
          </span>
        )}

        {/* Hover Overlay - Desktop only for performance */}
        <div className="hidden sm:block absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/4 transition-colors duration-300" />
      </div>

      {/* Product Info - Compact on mobile, spacious on desktop */}
      <div className="space-y-1 sm:space-y-1.5 px-0.5">
        {/* Category - Smaller on mobile */}
        {product.category && (
          <p className="text-[10px] sm:text-[11px] tracking-wide text-charcoal-400 uppercase truncate">
            {product.category.name}
          </p>
        )}

        {/* Product Name - 2 lines max, readable on all screens */}
        <h3 className="
          text-xs sm:text-sm md:text-base
          text-charcoal-700 leading-snug
          line-clamp-2
          group-hover:text-berry-500 transition-colors
          break-words font-medium
          min-h-[2.5em] sm:min-h-0
        ">
          {product.name}
        </h3>

        {/* Price - Prominent with tabular numbers */}
        <div className="flex items-baseline gap-2 sm:gap-3 pt-0.5 sm:pt-1 flex-wrap">
          <span className="text-sm sm:text-base font-semibold text-charcoal-800 tabular-nums tracking-tight">
            {price.toFixed(2)}&nbsp;د.أ
          </span>
          {isOnSale && (
            <span className="text-xs sm:text-sm text-charcoal-400 line-through tabular-nums">
              {originalPrice.toFixed(2)}&nbsp;د.أ
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
