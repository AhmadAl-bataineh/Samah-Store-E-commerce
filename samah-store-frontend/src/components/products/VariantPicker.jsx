import React, { useState, useEffect } from 'react';

/**
 * VariantPicker Component
 *
 * IMPORTANT: Each variant has exactly ONE color and ONE size.
 * NO splitting of comma-separated values.
 * The variant is the source of truth for color/size.
 */
const VariantPicker = ({ variants, selectedVariant, onSelect }) => {
  const activeVariants = variants.filter(v => v.active !== false && v.deleted !== true);

  if (!activeVariants || activeVariants.length === 0) {
    return null;
  }

  // Get unique sizes and colors from variants (NO splitting)
  const sizes = [...new Set(activeVariants.map(v => v.size).filter(Boolean))];
  const allColors = [...new Set(activeVariants.map(v => v.color).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState(selectedVariant?.size || null);
  const [selectedColor, setSelectedColor] = useState(selectedVariant?.color || null);

  useEffect(() => {
    setSelectedSize(selectedVariant?.size || null);
    setSelectedColor(selectedVariant?.color || null);
  }, [selectedVariant]);


  // Colors available for the selected size
  const colorsForSelectedSize = selectedSize
    ? [...new Set(activeVariants.filter(v => v.size === selectedSize).map(v => v.color).filter(Boolean))]
    : allColors;

  return (
    <div className="space-y-4">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <label className="block font-semibold mb-3">المقاس</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              // Find a variant with this size (prefer one matching selectedColor)
              let variant = activeVariants.find(v => v.size === size && v.color === selectedColor);
              if (!variant) variant = activeVariants.find(v => v.size === size);

              const isSelected = selectedSize === size;
              const isAvailable = variant && variant.stockQuantity > 0;

              return (
                <button
                  key={size}
                  onClick={() => {
                    if (!variant) return;
                    setSelectedSize(size);
                    // Sync color from the selected variant
                    if (variant.color) setSelectedColor(variant.color);
                    onSelect(variant);
                  }}
                  disabled={!isAvailable}
                  className={`px-3 sm:px-6 py-3 min-h-12 sm:min-h-auto rounded-xl font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-white'
                      : isAvailable
                      ? 'bg-white border-2 border-gray-300 hover:border-brand-primary'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colorsForSelectedSize.length > 0 && (
        <div>
          <label className="block font-semibold mb-3">اللون</label>
          <div className="flex flex-wrap gap-2">
            {colorsForSelectedSize.map(color => {
              // Find variant with this exact color (and selected size if any)
              let variant = selectedSize
                ? activeVariants.find(v => v.size === selectedSize && v.color === color)
                : activeVariants.find(v => v.color === color);

              const isSelected = selectedColor === color;
              const isAvailable = variant && variant.stockQuantity > 0;

              return (
                <button
                  key={color}
                  onClick={() => {
                    if (!variant) return;
                    setSelectedColor(color);
                    // Sync size from the selected variant if not already set
                    if (variant.size && !selectedSize) setSelectedSize(variant.size);
                    onSelect(variant);
                  }}
                  disabled={!isAvailable}
                  className={`px-3 sm:px-6 py-3 min-h-12 sm:min-h-auto rounded-xl font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-white'
                      : isAvailable
                      ? 'bg-white border-2 border-gray-300 hover:border-brand-primary'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="bg-brand-soft p-4 rounded-xl">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">المنتج المحدد:</span>{' '}
            {selectedVariant.size && selectedVariant.size}
            {selectedVariant.size && selectedVariant.color && ' - '}
            {selectedVariant.color && selectedVariant.color}
          </p>
          {selectedVariant.sku && (
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">SKU:</span> {selectedVariant.sku}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VariantPicker;
