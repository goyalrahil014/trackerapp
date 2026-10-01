import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', hoverEffect = false, className = '', ...props }, ref) => {
    const base = 'rounded-2xl transition-all duration-200';

    const variants = {
      default:
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
      elevated:
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-200/50 dark:shadow-black/40',
      glass:
        'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800/50 shadow-sm',
    };

    const hover = hoverEffect
      ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5'
      : '';

    return (
      <div ref={ref} className={`${base} ${variants[variant]} ${hover} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
