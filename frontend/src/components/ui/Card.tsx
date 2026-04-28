/**
 * Card Component
 * Container with consistent padding, radius, shadow
 */
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  variant = 'default',
  hover = false,
  padding = 'md',
  children,
  className,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-slate-900 shadow-sm shadow-slate-200/50 dark:shadow-none',
    elevated: 'bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50',
    bordered: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

