import Image from 'next/image';
import { cn } from '@/utils/cn';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
  return initials.join('') || '?';
}

export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 font-bold text-white',
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
