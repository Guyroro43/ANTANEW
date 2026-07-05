import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950',
        className,
      )}
      {...props}
    />
  );
}
