import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/layout/AdminLayout';
import { Package, ShoppingCart, DollarSign, Truck, Tag, MapPin, UserCheck, Image, TrendingUp, Clock, CheckCircle2, RotateCcw, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/SectionHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, ordersRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.listAllOrders({ size: 5, sort: 'id,desc' })
      ]);

      setMetrics(metricsRes.data);
      setRecentOrders(ordersRes.data.content || []);
    } catch (error) {
      showToast('فشل تحميل بيانات لوحة التحكم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRevenue = async () => {
    try {
      setResetting(true);
      await adminApi.resetRevenue();

      // Update metrics immediately to show 0.00
      setMetrics(prev => ({
        ...prev,
        revenueSinceReset: 0,
        revenueResetAt: new Date().toISOString()
      }));

      showToast('تم تصفير إجمالي الإيرادات بنجاح', 'success');
      setShowResetModal(false);

      // Refetch to confirm from server
      await loadDashboardData();
    } catch (error) {
      const message = error.response?.data?.message || 'فشل تصفير الإيرادات';
      showToast(message, 'error');
    } finally {
      setResetting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };


  // Premium KPI Card Component
  const KPICard = ({ icon: Icon, label, value, subtext, trend, color = 'slate', loading: isLoading }) => {
    const colorClasses = {
      slate: { bg: 'bg-slate-50', icon: 'text-slate-600', border: 'border-slate-200/60' },
      indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-200/60' },
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200/60' },
      emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200/60' },
      teal: { bg: 'bg-teal-50', icon: 'text-teal-600', border: 'border-teal-200/60' },
      amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200/60' },
      rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-200/60' },
    };

    const colors = colorClasses[color] || colorClasses.slate;

    return (
      <div className={`
        bg-white rounded-xl border ${colors.border} 
        p-4 sm:p-5 
        hover:shadow-soft hover:border-slate-300/60 
        transition-all duration-200
        group
      `}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-1.5 truncate">{label}</p>
            <p className="text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums">
              {isLoading ? (
                <span className="inline-block w-16 h-7 bg-slate-100 rounded animate-pulse"></span>
              ) : value}
            </p>
            {subtext && (
              <p className="text-[11px] text-slate-400 mt-1.5 truncate">{subtext}</p>
            )}
          </div>
          <div className={`
            w-10 h-10 sm:w-11 sm:h-11 ${colors.bg} rounded-xl 
            flex items-center justify-center flex-shrink-0
            transition-transform duration-200 group-hover:scale-105
          `}>
            <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={1.5} />
          </div>
        </div>
        {trend && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className={`
              inline-flex items-center gap-1 text-xs font-medium
              ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-slate-500'}
            `}>
              <TrendingUp className={`w-3.5 h-3.5 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}% من الأسبوع الماضي
            </span>
          </div>
        )}
      </div>
    );
  };

  // Status breakdown mini card
  const StatusCard = ({ label, value, colorClass, isLoading }) => (
    <div className={`${colorClass} rounded-xl p-3 sm:p-4 border transition-all duration-200 hover:shadow-sm`}>
      <p className="text-[10px] sm:text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-lg sm:text-xl font-semibold">
        {isLoading ? '...' : value}
      </p>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8" dir="rtl">
        {/* Page Header */}
        <PageHeader
          title="لوحة التحكم"
          subtitle="نظرة عامة على المتجر والطلبات"
        />

        {/* KPI Cards - Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            icon={ShoppingCart}
            label="إجمالي الطلبات"
            value={metrics?.totalOrders || 0}
            color="indigo"
            loading={loading}
          />
          <KPICard
            icon={Clock}
            label="طلبات اليوم"
            value={metrics?.ordersToday || 0}
            color="blue"
            loading={loading}
          />
          <KPICard
            icon={DollarSign}
            label="الإيرادات"
            value={`${(Number(metrics?.revenueSinceReset) || 0).toFixed(2)} د.أ`}
            subtext={metrics?.revenueResetAt ? `منذ ${formatDate(metrics.revenueResetAt)}` : 'إجمالي'}
            color="emerald"
            loading={loading}
          />
          <KPICard
            icon={CheckCircle2}
            label="تم التوصيل"
            value={metrics?.deliveredOrders || 0}
            color="teal"
            loading={loading}
          />
        </div>

        {/* Main Grid - Responsive: stack on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Order Status Breakdown */}
          <Card variant="default" padding="default">
            <CardHeader
              title="حالة الطلبات"
              subtitle="توزيع الطلبات حسب الحالة"
            />
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <StatusCard
                label="قيد المعالجة"
                value={metrics?.processingOrders || 0}
                colorClass="bg-slate-50 border-slate-100 text-slate-700"
                isLoading={loading}
              />
              <StatusCard
                label="تم الشحن"
                value={metrics?.shippedOrders || 0}
                colorClass="bg-violet-50 border-violet-100 text-violet-700"
                isLoading={loading}
              />
              <StatusCard
                label="تم التوصيل"
                value={metrics?.deliveredOrders || 0}
                colorClass="bg-emerald-50 border-emerald-100 text-emerald-700"
                isLoading={loading}
              />
              <StatusCard
                label="ملغى"
                value={metrics?.cancelledOrders || 0}
                colorClass="bg-rose-50 border-rose-100 text-rose-700"
                isLoading={loading}
              />
            </div>

            {/* Revenue Reset */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowResetModal(true)}
                disabled={resetting}
                className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-2.5 text-sm font-medium
                  text-rose-600 bg-rose-50 border border-rose-200 rounded-xl
                  hover:bg-rose-100 hover:border-rose-300
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200
                "
              >
                <RotateCcw className="w-4 h-4" />
                تصفير إجمالي الإيرادات
              </button>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card variant="default" padding="default">
            <CardHeader
              title="آخر الطلبات"
              action={
                <Link
                  to="/admin/orders"
                  className="
                    inline-flex items-center gap-1 text-xs font-medium
                    text-brand-accent hover:text-brand-primary
                    transition-colors
                  "
                >
                  عرض الكل
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {/* Desktop: Table view */}
            <div className="hidden sm:block">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">لا توجد طلبات</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-5 lg:-mx-6">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-right text-[11px] font-medium text-slate-500 py-2 px-4 sm:px-5 lg:px-6">رقم</th>
                        <th className="text-right text-[11px] font-medium text-slate-500 py-2 px-2">العميل</th>
                        <th className="text-right text-[11px] font-medium text-slate-500 py-2 px-2">الحالة</th>
                        <th className="text-left text-[11px] font-medium text-slate-500 py-2 px-4 sm:px-5 lg:px-6">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, idx) => (
                        <tr
                          key={order.id}
                          className={`
                            border-b border-slate-50 last:border-0
                            hover:bg-slate-50/50 transition-colors cursor-pointer
                            ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-25'}
                          `}
                          onClick={() => window.location.href = `/admin/orders`}
                        >
                          <td className="py-3 px-4 sm:px-5 lg:px-6">
                            <span className="text-xs font-medium text-slate-900">#{order.id}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-xs text-slate-600 truncate max-w-[100px] block">
                              {order.customer?.username || 'عميل'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <StatusBadge status={order.status} size="sm" />
                          </td>
                          <td className="py-3 px-4 sm:px-5 lg:px-6 text-left">
                            <span className="text-xs font-semibold text-slate-900 tabular-nums">
                              {Number(order.total).toFixed(2)} د.أ
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mobile: Card list view */}
            <div className="sm:hidden space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">لا توجد طلبات</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders`}
                    className="
                      block p-3 rounded-xl border border-slate-100
                      bg-white hover:bg-slate-50 hover:border-slate-200
                      transition-all duration-200
                      active:scale-[0.98]
                    "
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-900">#{order.id}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 truncate max-w-[120px]">
                        {order.customer?.username || 'عميل'}
                      </span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {Number(order.total).toFixed(2)} د.أ
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions - Responsive grid */}
        <Card variant="default" padding="default">
          <CardHeader title="إجراءات سريعة" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {[
              { to: '/admin/orders', icon: ShoppingCart, label: 'الطلبات', color: 'slate' },
              { to: '/admin/products', icon: Package, label: 'المنتجات', color: 'blue' },
              { to: '/admin/categories', icon: Tag, label: 'الفئات', color: 'violet' },
              { to: '/admin/users', icon: UserCheck, label: 'المستخدمين', color: 'emerald' },
              { to: '/admin/shipping-zones', icon: MapPin, label: 'مناطق الشحن', color: 'orange' },
              { to: '/admin/coupons', icon: Truck, label: 'الكوبونات', color: 'pink' },
              { to: '/admin/hero', icon: Image, label: 'الهيرو', color: 'rose' },
            ].map((item) => {
              const colorMap = {
                slate: 'bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-900',
                blue: 'bg-blue-50 hover:bg-blue-100 border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-700',
                violet: 'bg-violet-50 hover:bg-violet-100 border-violet-100 hover:border-violet-200 text-violet-600 hover:text-violet-700',
                emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 hover:border-emerald-200 text-emerald-600 hover:text-emerald-700',
                orange: 'bg-orange-50 hover:bg-orange-100 border-orange-100 hover:border-orange-200 text-orange-600 hover:text-orange-700',
                pink: 'bg-pink-50 hover:bg-pink-100 border-pink-100 hover:border-pink-200 text-pink-600 hover:text-pink-700',
                rose: 'bg-rose-50 hover:bg-rose-100 border-rose-100 hover:border-rose-200 text-rose-600 hover:text-rose-700',
              };
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex flex-col items-center gap-2 p-3 sm:p-4 
                    rounded-xl border transition-all duration-200
                    ${colorMap[item.color]}
                    group
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                  `}
                >
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Revenue Reset Modal */}
        {showResetModal && (
          <Modal
            title="تصفير إجمالي الإيرادات"
            onClose={() => setShowResetModal(false)}
          >
            <div className="space-y-4" dir="rtl">
              <p className="text-sm text-slate-600">
                هل أنت متأكد من تصفير إجمالي الإيرادات؟
              </p>
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>ملاحظة:</strong> لن يتم حذف أي طلبات. سيتم فقط تعيين نقطة بداية جديدة لحساب الإيرادات من الآن.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleResetRevenue}
                  disabled={resetting}
                  variant="primary"
                  className="flex-1"
                >
                  {resetting ? 'جاري التصفير...' : 'تأكيد التصفير'}
                </Button>
                <Button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetting}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;


