import React from 'react';

/**
 * Premium Card Component
 * Supports different variants and responsive padding
 */
export const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'default',
  hover = false,
  as: Component = 'div',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-slate-200/60',
    elevated: 'bg-white border border-slate-100 shadow-card',
    outlined: 'bg-white/50 border border-slate-200',
    ghost: 'bg-slate-50/50',
  };

  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    default: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-5 sm:p-6 lg:p-8',
  };

  const hoverClasses = hover
    ? 'transition-all duration-200 hover:shadow-soft hover:border-slate-300/60 cursor-pointer'
    : '';

  return (
    <Component
      className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Card Header with optional action
 */
export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div className="min-w-0 flex-1">
      <h3 className="text-base font-semibold text-slate-900 truncate">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/**
 * Card Body
 */
export const CardBody = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

/**
 * Card Footer
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>
    {children}
  </div>
);

export default Card;
