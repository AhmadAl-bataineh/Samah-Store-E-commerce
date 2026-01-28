import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ordersApi } from '../services/ordersApi';
import { useToast } from '../context/ToastContext';
import { ArrowRight, MapPin, Package, Calendar, Hash, Truck, CreditCard } from 'lucide-react';

/**
 * Map common color names to hex values for color swatches (display only)
 * This is ONLY used for visual swatch display, NOT for determining the selected color
 */
const COLOR_HEX_MAP = {
  // Arabic color names
  'أحمر': '#dc2626', 'أزرق': '#2563eb', 'أخضر': '#16a34a', 'أصفر': '#eab308',
  'برتقالي': '#ea580c', 'بنفسجي': '#9333ea', 'وردي': '#ec4899', 'أسود': '#171717',
  'أبيض': '#ffffff', 'رمادي': '#6b7280', 'بني': '#92400e', 'بيج': '#d4a574',
  'كحلي': '#1e3a5f', 'ذهبي': '#d4af37', 'فضي': '#c0c0c0', 'سماوي': '#06b6d4',
  'زهري': '#f472b6', 'كريمي': '#fffdd0', 'عنابي': '#722f37', 'زيتي': '#556b2f',
  // English fallbacks
  'red': '#dc2626', 'blue': '#2563eb', 'green': '#16a34a', 'yellow': '#eab308',
  'orange': '#ea580c', 'purple': '#9333ea', 'pink': '#ec4899', 'black': '#171717',
  'white': '#ffffff', 'gray': '#6b7280', 'grey': '#6b7280', 'brown': '#92400e',
  'beige': '#d4a574', 'navy': '#1e3a5f', 'gold': '#d4af37', 'silver': '#c0c0c0',
};

/**
 * Get hex color from color name (for visual swatch display only)
 */
const getColorHex = (colorName) => {
  if (!colorName || typeof colorName !== 'string') return null;
  const normalized = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[colorName] || COLOR_HEX_MAP[normalized] || null;
};

/**
 * Color Swatch Component - Visual display only
 * Only shows if we have a valid hex color
 */
const ColorSwatch = ({ color, size = 'sm' }) => {
  const hex = getColorHex(color);
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  // No swatch if no valid hex color
  if (!hex) return null;

  const isWhite = hex.toLowerCase() === '#ffffff';

  return (
    <span
      className={`${sizeClasses[size]} rounded-full inline-block flex-shrink-0 ${isWhite ? 'border border-gray-300' : ''}`}
      style={{ backgroundColor: hex }}
      title={color}
    />
  );
};

/**
 * Order Item Card Component
 * Uses ONLY the snapshot fields from the order item (item.color, item.size)
 * NO guessing or fallback logic - displays exactly what was stored at order time
 */
const OrderItemCard = ({ item }) => {
  // Use ONLY the direct snapshot fields from the order item
  // These are stored at order creation time and represent the exact customer selection
  const productName = item?.productName || 'منتج غير معروف';
  const color = item?.color || null; // Direct from order item snapshot - NO guessing
  const size = item?.size || null;   // Direct from order item snapshot
  const quantity = item?.quantity || 1;
  const unitPrice = item?.unitPrice || 0;
  const lineTotal = item?.lineTotal || unitPrice * quantity;
  const sku = item?.variantSku || null;

  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 mb-2 leading-tight">{productName}</h4>

          {/* Variant Details - Size & Color */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {size && (
              <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                <span className="text-gray-500">المقاس:</span>
                <span className="font-semibold text-gray-800">{size}</span>
              </span>
            )}

            {color ? (
              <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                <ColorSwatch color={color} size="sm" />
                <span className="text-gray-500">اللون:</span>
                <span className="font-semibold text-gray-800">{color}</span>
              </span>
            ) : (
              /* Show "غير محدد" only if no color was selected */
              !size && (
                <span className="text-gray-400 text-xs">بدون مواصفات إضافية</span>
              )
            )}
          </div>

          {/* Quantity */}
          <div className="mt-2 text-sm text-gray-600">
            الكمية: <span className="font-semibold">{quantity}</span>
          </div>

          {/* SKU (optional) */}
          {sku && (
            <div className="mt-1 text-xs text-gray-400">SKU: {sku}</div>
          )}
        </div>

        {/* Price */}
        <div className="text-left flex-shrink-0">
          <div className="text-lg font-bold text-brand-primary">
            {lineTotal?.toFixed(2)} <span className="text-sm">د.أ</span>
          </div>
          {quantity > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              {quantity} × {unitPrice?.toFixed(2)} د.أ
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Info Row Component for clean two-column layout
 */
const InfoRow = ({ label, value, icon: Icon, highlight = false }) => (
  <div className={`flex items-center justify-between py-3 ${highlight ? '' : 'border-b border-gray-100'}`}>
    <div className="flex items-center gap-2 text-gray-600">
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </div>
    <span className={`font-semibold ${highlight ? 'text-brand-primary text-xl' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
);

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      error('فشل في تحميل تفاصيل الطلب');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    };
    const labels = {
      PENDING: 'قيد الانتظار',
      CONFIRMED: 'مؤكد',
      PROCESSING: 'قيد المعالجة',
      SHIPPED: 'تم الشحن',
      DELIVERED: 'تم التوصيل',
      CANCELLED: 'ملغي',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </Container>
    );
  }

  if (!order) return null;

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <Container>
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors mb-6"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع للطلبات</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">طلب #{order.id}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4 inline-block ml-1" />
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Products & Address */}
          <div className="lg:col-span-2 space-y-6">

            {/* Products Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Package className="w-5 h-5 text-brand-primary" />
                <span>المنتجات</span>
                <span className="text-sm font-normal text-gray-500">({order.items?.length || 0})</span>
              </h3>

              <div className="space-y-3">
                {order.items?.length > 0 ? (
                  order.items.map((item, index) => (
                    <OrderItemCard key={item.id || index} item={item} index={index} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">لا توجد منتجات</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <span>عنوان التوصيل</span>
              </h3>

              {order.address ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{order.address.city}</p>
                      <p className="text-gray-700 mt-1">{order.address.street}</p>
                      {order.address.details && (
                        <p className="text-gray-500 text-sm mt-1">{order.address.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">الهاتف:</span> {order.address.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا يوجد عنوان</p>
              )}
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <CreditCard className="w-5 h-5 text-brand-primary" />
                <span>ملخص الطلب</span>
              </h3>

              <div className="space-y-1">
                <InfoRow
                  label="المجموع الفرعي"
                  value={`${order.subtotal?.toFixed(2) || '0.00'} د.أ`}
                />

                {order.shippingFee > 0 && (
                  <InfoRow
                    icon={Truck}
                    label="رسوم الشحن"
                    value={`${order.shippingFee?.toFixed(2)} د.أ`}
                  />
                )}

                {order.discountTotal > 0 && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 text-green-600">
                    <span>الخصم</span>
                    <span className="font-semibold">-{order.discountTotal?.toFixed(2)} د.أ</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">الإجمالي</span>
                  <span className="text-2xl font-bold text-brand-primary">
                    {order.total?.toFixed(2) || '0.00'} <span className="text-sm">د.أ</span>
                  </span>
                </div>
              </div>

              {/* Tracking Code */}
              {order.trackingCode && (
                <div className="mt-6 bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
                  <p className="text-sm font-medium text-gray-700 mb-1">رمز التتبع</p>
                  <p className="text-lg font-mono font-bold text-brand-primary">{order.trackingCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OrderDetailsPage;

