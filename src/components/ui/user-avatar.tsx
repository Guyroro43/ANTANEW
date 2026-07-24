import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserAvatar({ name, src, size = 32, className }: UserAvatarProps) {
  return (
    <Avatar className={cn(className)} style={{ width: size, height: size }}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
