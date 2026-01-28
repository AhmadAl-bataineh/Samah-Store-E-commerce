import React from 'react';

/**
 * Section Header Component
 * Consistent section headers throughout admin dashboard
 */
export const SectionHeader = ({
  title,
  subtitle,
  action,
  icon: Icon,
  className = ''
}) => (
  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 ${className}`}>
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/**
 * Page Header Component
 * Main page title headers
 */
export const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumb,
  className = ''
}) => (
  <div className={`${className}`}>
    {breadcrumb && (
      <nav className="text-sm text-slate-500 mb-2">
        {breadcrumb}
      </nav>
    )}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  </div>
);

export default SectionHeader;
