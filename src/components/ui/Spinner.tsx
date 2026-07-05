import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      style={{ width: size, height: size }}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-slate-300 border-t-red-600 dark:border-slate-700 dark:border-t-yellow-400',
        className,
      )}
    />
  );
}
