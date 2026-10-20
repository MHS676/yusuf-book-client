import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold text-brand-primary w-full">
      {label && <span>{label}</span>}
      <input 
        ref={ref}
        className={`p-3 border border-gray-200 rounded font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all ${className}`}
        {...props} 
      />
      {error && <span className="text-red-500 text-xs font-normal">{error}</span>}
    </label>
  );
});
Input.displayName = 'Input';
