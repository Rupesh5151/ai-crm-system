/**
 * Select Component - Styled dropdown with label, icons, error state
 */
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, icon, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <select
          className={cn(
            'w-full appearance-none rounded-lg border bg-white dark:bg-slate-900 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500',
            icon ? 'pl-10 pr-10' : 'px-4 pr-10',
            'py-2.5 transition-colors',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
            'dark:text-slate-100',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

