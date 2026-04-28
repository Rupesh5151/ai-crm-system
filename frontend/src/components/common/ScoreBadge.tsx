/**
 * ScoreBadge - Animated AI score indicator
 */
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Lead } from '../../types';
import { cn } from '../../lib/utils';

interface ScoreBadgeProps {
  lead: Lead;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ScoreBadge({ lead, size = 'sm', showLabel = true, className }: ScoreBadgeProps) {
  const score = lead.score ?? 0;
  const label = lead.scoreLabel;

  const config = {
    high: { color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', bar: 'bg-emerald-500' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', bar: 'bg-amber-500' },
    low: { color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', bar: 'bg-rose-500' },
  }[label || 'low'];

  const sizeClasses = {
    sm: { ring: 'h-8 w-8', text: 'text-sm', label: 'text-[10px]' },
    md: { ring: 'h-10 w-10', text: 'text-base', label: 'text-xs' },
    lg: { ring: 'h-14 w-14', text: 'text-xl', label: 'text-sm' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <svg className={cn('transform -rotate-90', sizeClasses[size].ring)}>
          <circle cx="50%" cy="50%" r="38%" fill="none" stroke="currentColor" strokeWidth="12%"
            className="text-slate-100 dark:text-slate-800" />
          <motion.circle cx="50%" cy="50%" r="38%" fill="none" stroke="currentColor" strokeWidth="12%"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 240' }}
            animate={{ strokeDasharray: `${(score / 100) * 240} 240` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={config.color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', sizeClasses[size].text, config.color)}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn('font-medium capitalize', sizeClasses[size].label, config.color)}>
            {label}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
            <Zap className="h-3 w-3" /> AI Score
          </span>
        </div>
      )}
    </div>
  );
}

