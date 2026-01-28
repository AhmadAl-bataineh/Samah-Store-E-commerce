import React from 'react';
import { StatusSelect, EmployeeSelect } from './OrderControls';
import { StatusBadge } from '../ui/StatusBadge';
import { Eye, MapPin, User } from 'lucide-react';

const AdminOrderCard = ({ item, onView, employees = [], assigningOrderId, updatingId, STATUS_LABELS = {}, onAssign, onUpdateStatus }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-4 transition-all duration-200 hover:shadow-soft hover:border-slate-300/60">
      {/* Header: Order ID & Total */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">#{item.id}</span>
          <StatusBadge status={item.status} size="sm" />
        </div>
        <span className="text-sm font-bold text-slate-900 tabular-nums">
          {(item.total || 0).toFixed(2)} د.أ
        </span>
      </div>

      {/* Customer & Location Info */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-3">
        <span className="inline-flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {item.customer?.username || item.customerName || 'عميل'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {item.address?.city || '-'}
        </span>
      </div>

      {/* Controls Section */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1 block">تحديث الحالة</label>
            <StatusSelect order={item} STATUS_LABELS={STATUS_LABELS} updatingId={updatingId} onUpdateStatus={onUpdateStatus} />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1 block">تعيين موظف</label>
            <EmployeeSelect order={item} employees={employees} assigningOrderId={assigningOrderId} onAssign={onAssign} />
          </div>
        </div>

        {item.assignedEmployee && (
          <div className="text-[10px] text-emerald-600 font-medium">
            ✓ معيّن لـ: {item.assignedEmployee.username}
          </div>
        )}
      </div>

      {/* View Details Button */}
      <button
        type="button"
        onClick={() => onView && onView(item)}
        className="
          w-full mt-3 h-10 rounded-xl
          bg-slate-900 text-white text-sm font-medium
          flex items-center justify-center gap-2
          hover:bg-slate-800 active:scale-[0.98]
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
        "
      >
        <Eye className="w-4 h-4" />
        عرض التفاصيل
      </button>
    </div>
  );
};

export default AdminOrderCard;

