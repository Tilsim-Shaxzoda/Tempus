import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const GlassCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl2 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl shadow-glass',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
