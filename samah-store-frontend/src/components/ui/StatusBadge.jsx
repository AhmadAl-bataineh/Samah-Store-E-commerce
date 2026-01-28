import React from 'react';

/**
 * StatusBadge Component
 * Premium status badges for orders, users, products
 * Luxury design: soft colors, subtle borders, refined typography
 */

const statusConfig = {
  // Order statuses
  NEW: {
    label: 'جديد',
    colors: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-100'
  },
  PENDING: {
    label: 'معلق',
    colors: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100'
  },
  CONFIRMED: {
    label: 'مؤكد',
    colors: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100'
  },
  PROCESSING: {
    label: 'قيد المعالجة',
    colors: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100'
  },
  SHIPPED: {
    label: 'تم الشحن',
    colors: 'bg-violet-50 text-violet-700 border-violet-200 ring-violet-100'
  },
  DELIVERED: {
    label: 'تم التوصيل',
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100'
  },
  CANCELLED: {
    label: 'ملغى',
    colors: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100'
  },
  FAILED_PICKUP: {
    label: 'تعذر الاستلام',
    colors: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-100'
  },

  // User statuses
  ACTIVE: {
    label: 'نشط',
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100'
  },
  INACTIVE: {
    label: 'غير نشط',
    colors: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100'
  },
  BANNED: {
    label: 'محظور',
    colors: 'bg-red-50 text-red-700 border-red-200 ring-red-100'
  },

  // Product statuses
  IN_STOCK: {
    label: 'متوفر',
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100'
  },
  OUT_OF_STOCK: {
    label: 'نفذ',
    colors: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100'
  },
  LOW_STOCK: {
    label: 'كمية قليلة',
    colors: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100'
  },

  // Generic
  SUCCESS: {
    label: 'نجاح',
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100'
  },
  WARNING: {
    label: 'تحذير',
    colors: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100'
  },
  ERROR: {
    label: 'خطأ',
    colors: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100'
  },
  INFO: {
    label: 'معلومة',
    colors: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100'
  },
};

export const StatusBadge = ({
  status,
  label: customLabel,
  size = 'default',
  dot = false,
  className = ''
}) => {
  const config = statusConfig[status] || statusConfig.INFO;
  const label = customLabel || config.label || status;

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    default: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-md border
        ${config.colors} ${sizes[size]} ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {label}
    </span>
  );
};

/**
 * Get status label utility function
 */
export const getStatusLabel = (status) => {
  return statusConfig[status]?.label || status;
};

/**
 * Get status color classes utility function
 */
export const getStatusColors = (status) => {
  return statusConfig[status]?.colors || statusConfig.INFO.colors;
};

export default StatusBadge;
