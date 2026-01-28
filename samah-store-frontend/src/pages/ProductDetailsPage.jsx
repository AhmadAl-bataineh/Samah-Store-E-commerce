import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import VariantPicker from '../components/products/VariantPicker';
import QuantitySelector from '../components/products/QuantitySelector';
import { Skeleton } from '../components/ui/Skeleton';
import { productsApi } from '../services/productsApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { updatePageMeta, setStructuredData, removeStructuredData, getProductSchema, getBreadcrumbSchema } from '../utils/seo';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getProductBySlug(slug);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        if (data.variants && data.variants.length === 1) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        error('فشل في تحميل تفاصيل المنتج');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // SEO: Update meta tags and structured data when product loads
  useEffect(() => {
    if (product) {
      const price = product.variants?.[0]?.price || product.minVariantPrice;
      const image = product.images?.[0]?.url ? getImageUrl(product.images[0].url) : null;

      updatePageMeta({
        title: product.name,
        description: product.description || `${product.name} - تسوقي الآن من سماح ستور بسعر ${price} د.أ`,
        image: image,
        url: `/products/${product.slug}`,
        type: 'product',
      });

      // Add Product schema
      setStructuredData(getProductSchema(product), 'product-schema');

      // Add Breadcrumb schema
      const breadcrumbs = [
        { name: 'الرئيسية', url: '/' },
        { name: 'المنتجات', url: '/products' },
      ];
      if (product.category) {
        breadcrumbs.push({ name: product.category.name, url: `/products?categoryId=${product.category.id}` });
      }
      breadcrumbs.push({ name: product.name, url: `/products/${product.slug}` });
      setStructuredData(getBreadcrumbSchema(breadcrumbs), 'breadcrumb-schema');
    }

    // Cleanup structured data on unmount
    return () => {
      removeStructuredData('product-schema');
      removeStructuredData('breadcrumb-schema');
    };
  }, [product]);


  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    if (!selectedVariant) {
      error('يرجى اختيار المقاس واللون');
      return;
    }

    if (selectedVariant.stockQuantity <= 0) {
      error('المنتج غير متوفر حالياً');
      return;
    }

    try {
      setAdding(true);
      await addToCart(selectedVariant.id, quantity);
      success('تمت إضافة المنتج للسلة بنجاح');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      error('فشل في إضافة المنتج للسلة');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product) return null;

  const currentPrice = selectedVariant?.price || product.minVariantPrice || 0;
  const stock = selectedVariant?.stockQuantity || 0;
  const inStock = stock > 0;

  return (
    <div className="py-8">
      <Container>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6">
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="card mb-4 overflow-hidden">
              <img
                src={getImageUrl(selectedImage?.url)}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`card overflow-hidden ${selectedImage?.id === img.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <img
                      src={getImageUrl(img.url)}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold text-dark mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-brand-primary">{currentPrice} JOD</span>
              {inStock ? (
                <Badge variant="success">متوفر</Badge>
              ) : (
                <Badge variant="danger">غير متوفر</Badge>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <VariantPicker
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelect={setSelectedVariant}
                />
              </div>
            )}

            {selectedVariant && (
              <div className="mb-8">
                <label className="block font-semibold mb-2">الكمية</label>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={stock}
                />
                <p className="text-sm text-gray-600 mt-2">متوفر: {stock} قطعة</p>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={!inStock || adding || !selectedVariant}
              className="w-full flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{adding ? 'جاري الإضافة...' : 'أضف للسلة'}</span>
            </Button>

            {!selectedVariant && product.variants && product.variants.length > 0 && (
              <p className="text-amber-600 text-center mt-4">يرجى اختيار المقاس واللون</p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetailsPage;

