'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, ...props }, ref) => (
    <div className="flex w-full flex-col gap-1.5">
      {label ? <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
      <input
        ref={ref}
        type="range"
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-red-600 dark:bg-slate-800',
          className,
        )}
        {...props}
      />
    </div>
  ),
);

Slider.displayName = 'Slider';
