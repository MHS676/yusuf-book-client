import { forwardRef } from 'react';

export const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-primary text-[#fffdf7] hover:-translate-y-0.5 hover:bg-brand-primaryHover",
    outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5",
    ghost: "text-brand-primary hover:bg-brand-primary/10"
  };

  return (
    <button 
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
