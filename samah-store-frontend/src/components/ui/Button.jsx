/**
 * SAMAH STORE - Button Component
 * Global feminine fashion styling
 */

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  rounded = 'default',
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-berry-500 text-white hover:bg-berry-600',
    secondary: 'bg-rose-300 text-charcoal-800 hover:bg-rose-200',
    outline: 'border border-charcoal-200 text-charcoal-700 hover:border-rose-300 hover:text-berry-500 bg-transparent',
    ghost: 'text-charcoal-600 hover:text-berry-500 bg-transparent',
  };

  const sizes = {
    small: 'px-4 py-2 text-xs',
    default: 'px-6 py-3 text-sm',
    large: 'px-8 py-4 text-base',
  };

  const roundedOptions = {
    none: 'rounded-none',
    default: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center gap-2 
        font-medium tracking-wide
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-400 focus-visible:ring-offset-2
        ${variants[variant]} 
        ${sizes[size]}
        ${roundedOptions[rounded]}
        ${className}
      `} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

