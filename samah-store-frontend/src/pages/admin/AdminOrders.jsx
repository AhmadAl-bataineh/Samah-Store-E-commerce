import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/layout/AdminLayout';
import { Modal } from '../../components/ui/Modal';
import AdminOrderCard from '../../components/admin/AdminOrderCard';
import { Eye, Copy, Phone, Mail, MapPin, SlidersHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/SectionHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const STATUS_LABELS = {
  NEW: 'جديد',
  PROCESSING: 'قيد المعالجة',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التوصيل',
  FAILED_PICKUP: 'تعذر الاستلام'
};

const FILTER_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'UNASSIGNED', label: 'غير معيّنة' },
  { value: 'ASSIGNED', label: 'معيّنة' },
  { value: 'NEW', label: 'جديد' },
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'SHIPPED', label: 'تم الشحن' },
  { value: 'DELIVERED', label: 'تم التوصيل' },
];

/**
 * Map color names to hex values for visual swatches ONLY
 * This does NOT determine the selected color - that comes from item.color
 */
const COLOR_HEX_MAP = {
  'أحمر': '#dc2626', 'أزرق': '#2563eb', 'أخضر': '#16a34a', 'أصفر': '#eab308',
  'برتقالي': '#ea580c', 'بنفسجي': '#9333ea', 'وردي': '#ec4899', 'أسود': '#171717',
  'أبيض': '#ffffff', 'رمادي': '#6b7280', 'بني': '#92400e', 'بيج': '#d4a574',
  'كحلي': '#1e3a5f', 'ذهبي': '#d4af37', 'فضي': '#c0c0c0', 'سماوي': '#06b6d4',
  'زهري': '#f472b6', 'كريمي': '#fffdd0', 'عنابي': '#722f37', 'زيتي': '#556b2f',
  'red': '#dc2626', 'blue': '#2563eb', 'green': '#16a34a', 'black': '#171717',
  'white': '#ffffff', 'gray': '#6b7280', 'pink': '#ec4899', 'beige': '#d4a574',
};

/**
 * Get hex color from color name (for visual swatch display only)
 */
const getColorHex = (colorName) => {
  if (!colorName || typeof colorName !== 'string') return null;
  return COLOR_HEX_MAP[colorName] || COLOR_HEX_MAP[colorName.toLowerCase().trim()] || null;
};

/**
 * Color Swatch Component - Visual display only
 */
const ColorSwatch = ({ color }) => {
  const hex = getColorHex(color);
  if (!hex) return null;
  const isWhite = hex.toLowerCase() === '#ffffff';
  return (
    <span
      className={`w-3.5 h-3.5 rounded-full inline-block flex-shrink-0 ${isWhite ? 'border border-gray-300' : ''}`}
      style={{ backgroundColor: hex }}
      title={color}
    />
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveredTab, setDeliveredTab] = useState(false); // false = active, true = delivered
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { showToast } = useToast();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`تم نسخ ${label}`, 'success');
    }).catch(() => {
      showToast('فشل النسخ', 'error');
    });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [page, deliveredTab]);

  useEffect(() => {
    // Apply filter
    if (!statusFilter) {
      setFilteredOrders(orders);
    } else if (statusFilter === 'UNASSIGNED') {
      setFilteredOrders(orders.filter(o => !o.assignedEmployee));
    } else if (statusFilter === 'ASSIGNED') {
      setFilteredOrders(orders.filter(o => o.assignedEmployee));
    } else {
      setFilteredOrders(orders.filter(o => o.status === statusFilter));
    }
  }, [orders, statusFilter]);

  const loadEmployees = async () => {
    try {
      const response = await adminApi.listEmployees();
      // Only show active employees
      setEmployees((response.data || []).filter(e => e.enabled));
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page, size: 100, sort: 'id,desc' };
      // Add delivered filter based on active tab
      params.delivered = deliveredTab;

      const response = await adminApi.listAllOrders(params);
      setOrders(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      showToast('فشل تحميل الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployee = async (orderId, employeeId) => {
    if (!employeeId) return;

    try {
      setAssigningOrderId(orderId);
      await adminApi.assignOrder(orderId, parseInt(employeeId));
      showToast('تم تعيين الطلب للموظف بنجاح', 'success');
      await loadOrders(); // Refresh immediately
    } catch (error) {
      const message = error.response?.data?.message || 'فشل تعيين الطلب';
      showToast(message, 'error');
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!window.confirm(`هل أنت متأكد من تحديث الحالة إلى ${STATUS_LABELS[newStatus]}؟`)) return;

    try {
      setUpdatingId(orderId);
      await adminApi.updateOrderStatus(orderId, newStatus);
      showToast('تم تحديث حالة الطلب بنجاح', 'success');

      // Optimistic update: remove order from list if FAILED_PICKUP or DELIVERED (when on active tab)
      if (newStatus === 'FAILED_PICKUP' || (newStatus === 'DELIVERED' && !deliveredTab)) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setFilteredOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        // For other status changes, refresh to get updated data
        await loadOrders();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'فشل تحديث حالة الطلب';
      showToast(message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'NEW').length,
    unassigned: orders.filter(o => !o.assignedEmployee && ['NEW', 'PROCESSING', 'SHIPPED'].includes(o.status)).length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  };

  if (loading && orders.length === 0) {
    return (
      <AdminLayout>
        <div className="text-center py-12">جاري التحميل...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="إدارة الطلبات"
            subtitle={`${stats.total} طلب${stats.unassigned > 0 ? ` • ${stats.unassigned} غير معيّن` : ''}`}
          />

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  appearance-none bg-white border border-slate-200 rounded-xl
                  pr-9 pl-4 py-2.5 text-sm text-slate-700
                  focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
                  transition-all duration-200
                  cursor-pointer hover:border-slate-300
                "
              >
                {FILTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active/Delivered Tabs - Premium styling */}
        <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl w-fit">
          <button
            onClick={() => {
              setDeliveredTab(false);
              setPage(0);
              setStatusFilter('');
            }}
            className={`
              px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${!deliveredTab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }
            `}
          >
            <span className="flex items-center gap-2">
              الطلبات النشطة
              {!deliveredTab && stats.total > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-primary/10 text-brand-accent rounded-full">
                  {stats.total}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => {
              setDeliveredTab(true);
              setPage(0);
              setStatusFilter('');
            }}
            className={`
              px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${deliveredTab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }
            `}
          >
            <span className="flex items-center gap-2">
              الطلبات المُسلّمة
              {deliveredTab && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                  ✓
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Stats - Premium mini cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          <button
            onClick={() => setStatusFilter('')}
            className={`
              p-3 rounded-xl border text-center transition-all duration-200
              ${statusFilter === '' 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }
            `}
          >
            <p className="text-lg sm:text-xl font-bold tabular-nums">{stats.total}</p>
            <p className="text-[10px] sm:text-xs opacity-80">الكل</p>
          </button>
          <button
            onClick={() => setStatusFilter('UNASSIGNED')}
            className={`
              p-3 rounded-xl border text-center transition-all duration-200
              ${statusFilter === 'UNASSIGNED' 
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                : 'bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-200 hover:shadow-sm'
              }
            `}
          >
            <p className="text-lg sm:text-xl font-bold tabular-nums">{stats.unassigned}</p>
            <p className="text-[10px] sm:text-xs opacity-80">غير معيّنة</p>
          </button>
          <button
            onClick={() => setStatusFilter('NEW')}
            className={`
              p-3 rounded-xl border text-center transition-all duration-200
              ${statusFilter === 'NEW' 
                ? 'bg-slate-600 text-white border-slate-600 shadow-sm' 
                : 'bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200 hover:shadow-sm'
              }
            `}
          >
            <p className="text-lg sm:text-xl font-bold tabular-nums">{stats.new}</p>
            <p className="text-[10px] sm:text-xs opacity-80">جديد</p>
          </button>
          <button
            onClick={() => setStatusFilter('PROCESSING')}
            className={`
              p-3 rounded-xl border text-center transition-all duration-200
              ${statusFilter === 'PROCESSING' 
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' 
                : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:border-indigo-200 hover:shadow-sm'
              }
            `}
          >
            <p className="text-lg sm:text-xl font-bold tabular-nums">{stats.processing}</p>
            <p className="text-[10px] sm:text-xs opacity-80">قيد المعالجة</p>
          </button>
          <button
            onClick={() => setStatusFilter('SHIPPED')}
            className={`
              p-3 rounded-xl border text-center transition-all duration-200
              ${statusFilter === 'SHIPPED' 
                ? 'bg-violet-500 text-white border-violet-500 shadow-sm' 
                : 'bg-violet-50 border-violet-100 text-violet-700 hover:border-violet-200 hover:shadow-sm'
              }
            `}
          >
            <p className="text-lg sm:text-xl font-bold tabular-nums">{stats.shipped}</p>
            <p className="text-[10px] sm:text-xs opacity-80">تم الشحن</p>
          </button>
          <button
            onClick={() => setStatusFilter('DELIVERED')}
            className={`
              p-3 rounded-xl border text-center transition-all duration-200
              ${statusFilter === 'DELIVERED' 
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-200 hover:shadow-sm'
              }
            `}
          >
            <p className="text-lg sm:text-xl font-bold tabular-nums">{stats.delivered}</p>
            <p className="text-[10px] sm:text-xs opacity-80">تم التوصيل</p>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center">
            <p className="text-slate-500">
              {statusFilter ? `لا توجد طلبات ${FILTER_OPTIONS.find(o => o.value === statusFilter)?.label || ''}` : 'لا توجد طلبات'}
            </p>
          </Card>
        ) : (
          <>
            {/* Desktop Table (hidden on small screens; visible md+) */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wide">رقم الطلب</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wide">الحالة</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wide">الإجمالي</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wide">المدينة</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wide">تعيين موظف</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wide">تحديث الحالة</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order, idx) => (
                    <tr key={order.id} className={`hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-900">#{order.id}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900 tabular-nums">{order.total?.toFixed(2)} د.أ</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{order.address?.city || '-'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <select
                            value={order.assignedEmployee?.id || ''}
                            onChange={(e) => handleAssignEmployee(order.id, e.target.value)}
                            disabled={assigningOrderId === order.id || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 w-32 disabled:opacity-50 disabled:bg-slate-50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                          >
                            <option value="">-- اختر موظف --</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.username}
                              </option>
                            ))}
                          </select>
                          {order.assignedEmployee && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              ✓ {order.assignedEmployee.username}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 disabled:opacity-50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                        >
                          {Object.keys(STATUS_LABELS).map(status => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => openDetails(order)}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5
                            bg-slate-900 text-white text-xs font-medium rounded-lg
                            hover:bg-slate-800 transition-colors
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
                          "
                        >
                          <Eye className="w-3.5 h-3.5" />
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* Mobile Cards (visible on small screens < md) */}
            <div className="block md:hidden space-y-3">
              {filteredOrders.map(order => (
                <AdminOrderCard
                  key={order.id}
                  item={order}
                  onView={() => openDetails(order)}
                  onEdit={() => {/* optional edit handler if exists */}}
                  onDelete={() => {/* optional delete handler if exists */}}
                  employees={employees}
                  assigningOrderId={assigningOrderId}
                  updatingId={updatingId}
                  STATUS_LABELS={STATUS_LABELS}
                  onAssign={handleAssignEmployee}
                  onUpdateStatus={handleStatusUpdate}
                />
              ))}
            </div>

             {totalPages > 1 && (
               <div className="flex justify-center items-center gap-2 pt-4">
                 <button
                   onClick={() => setPage(p => Math.max(0, p - 1))}
                   disabled={page === 0}
                   className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   السابق
                 </button>
                 <span className="px-4 py-2 text-sm text-slate-600">صفحة {page + 1} من {totalPages}</span>
                 <button
                   onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                   disabled={page >= totalPages - 1}
                   className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   التالي
                 </button>
               </div>
             )}
           </>
         )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title={`تفاصيل الطلب #${selectedOrder.id}`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  selectedOrder.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                  selectedOrder.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                  selectedOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {STATUS_LABELS[selectedOrder.status]}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-brand-soft p-4 rounded-xl">
                <h3 className="font-semibold text-brand-ink mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  معلومات العميل
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الاسم:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedOrder.customer?.username}</span>
                      <button
                        onClick={() => copyToClipboard(selectedOrder.customer?.username, 'اسم العميل')}
                        className="p-1 hover:bg-white rounded transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-brand-primary" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${selectedOrder.customer?.email}`} className="font-medium text-brand-primary hover:underline">
                        {selectedOrder.customer?.email}
                      </a>
                      <button
                        onClick={() => copyToClipboard(selectedOrder.customer?.email, 'البريد الإلكتروني')}
                        className="p-1 hover:bg-white rounded transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-brand-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-brand-soft p-4 rounded-xl">
                <h3 className="font-semibold text-brand-ink mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  عنوان التوصيل
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الهاتف:</span>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${selectedOrder.address?.phone}`} className="font-medium text-brand-primary hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {selectedOrder.address?.phone}
                      </a>
                      <button
                        onClick={() => copyToClipboard(selectedOrder.address?.phone, 'رقم الهاتف')}
                        className="p-1 hover:bg-white rounded transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-brand-primary" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">العنوان:</span>
                    <div className="flex items-start gap-2 text-left max-w-xs">
                      <div className="font-medium text-right">
                        <div>{selectedOrder.address?.city}</div>
                        <div>{selectedOrder.address?.street}</div>
                        {selectedOrder.address?.details && <div className="text-gray-600 text-xs mt-1">{selectedOrder.address.details}</div>}
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${selectedOrder.address?.city}, ${selectedOrder.address?.street}${selectedOrder.address?.details ? ', ' + selectedOrder.address.details : ''}`, 'العنوان')}
                        className="p-1 hover:bg-white rounded transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-brand-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items - Improved RTL Design */}
              <div>
                <h3 className="font-semibold text-brand-ink mb-3">المنتجات ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-brand-border overflow-hidden">
                      {/* Product Row */}
                      <div className="flex items-start justify-between p-4">
                        {/* Right Side: Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2">
                            {item.productName}
                          </h4>
                          {item.variantSku && (
                            <p className="text-xs text-gray-400 font-mono mb-2">SKU: {item.variantSku}</p>
                          )}

                          {/* Variant Chips */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Color Chip - Use item.color directly (NO guessing) */}
                            {item.color ? (
                              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-xs">
                                <ColorSwatch color={item.color} />
                                <span className="text-gray-600">اللون:</span>
                                <span className="font-medium text-gray-800">{item.color}</span>
                              </span>
                            ) : null}

                            {/* Size Chip */}
                            {item.size && (
                              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-xs">
                                <span className="text-gray-600">المقاس:</span>
                                <span className="font-medium text-gray-800">{item.size}</span>
                              </span>
                            )}

                            {/* Quantity Chip */}
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">
                              <span className="text-blue-600">الكمية:</span>
                              <span className="font-medium text-blue-800">{item.quantity}</span>
                            </span>
                          </div>
                        </div>

                        {/* Left Side: Price */}
                        <div className="text-left flex-shrink-0 mr-4">
                          <p className="text-base font-bold text-brand-primary">
                            {item.lineTotal?.toFixed(2)} د.أ
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.quantity} × {item.unitPrice?.toFixed(2)} د.أ
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-brand-soft p-4 rounded-xl space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">{selectedOrder.subtotal?.toFixed(2)} د.أ</span>
                </div>
                {selectedOrder.discountTotal > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>الخصم:</span>
                    <span className="font-medium">- {selectedOrder.discountTotal?.toFixed(2)} د.أ</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">رسوم الشحن:</span>
                  <span className="font-medium">{selectedOrder.shippingFee?.toFixed(2)} د.أ</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                  <span className="font-bold text-brand-ink">الإجمالي:</span>
                  <span className="font-bold text-brand-primary text-lg">{selectedOrder.total?.toFixed(2)} د.أ</span>
                </div>
              </div>

              {/* Assigned Employee */}
              {selectedOrder.assignedEmployee && (
                <div className="bg-blue-50 p-4 rounded-xl text-sm">
                  <span className="text-gray-600">معيّن إلى: </span>
                  <span className="font-medium">{selectedOrder.assignedEmployee.username}</span>
                  <span className="text-gray-500 mr-2">({selectedOrder.assignedEmployee.email})</span>
                </div>
              )}

              {/* Tracking Code */}
              {selectedOrder.trackingCode && (
                <div className="bg-purple-50 p-4 rounded-xl text-sm flex items-center justify-between">
                  <span className="text-gray-600">كود التتبع: <span className="font-mono font-medium">{selectedOrder.trackingCode}</span></span>
                  <button
                    onClick={() => copyToClipboard(selectedOrder.trackingCode, 'كود التتبع')}
                    className="p-1 hover:bg-white rounded transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-brand-primary" />
                  </button>
                </div>
              )}

              {/* Created Date */}
              {selectedOrder.createdAt && (
                <div className="text-xs text-gray-500 text-center">
                  تاريخ الإنشاء: {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;

