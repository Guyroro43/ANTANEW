import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FieldInputProps extends React.ComponentProps<'input'> {
  label: string;
  containerClassName?: string;
}

export function FieldInput({ label, id, containerClassName, className, ...props }: FieldInputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} className={className} {...props} />
    </div>
  );
}
