import React, { useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-30 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700/60 rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-all duration-150 transform -translate-x-1/2 left-1/2 ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
              position === 'top'
                ? 'top-full border-t-slate-900/95 dark:border-t-slate-800/95'
                : 'bottom-full border-b-slate-900/95 dark:border-b-slate-800/95'
            }`}
          />
        </div>
      )}
    </div>
  );
};
