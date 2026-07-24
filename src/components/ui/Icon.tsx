import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Trophy,
  User,
  Award,
  Zap,
  Flame,
  Shield,
  Lock,
  ChevronRight,
  Settings,
  Crown,
  Check,
  X,
  Video,
  Volume2,
  FileText,
  Users,
  LayoutDashboard,
  CreditCard,
  GraduationCap,
  Bell,
  Menu,
  Banknote,
  Plus,
  Sparkles,
} from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  className?: string;
}

/** Icône Lucide, stroke-width cohérent sur toute l'app. */
export function Icon({ icon: IconComponent, className }: IconProps) {
  return <IconComponent className={className} strokeWidth={1.5} aria-hidden="true" />;
}

export const icons = {
  module: BookOpen,
  trophy: Trophy,
  user: User,
  badge: Award,
  bolt: Zap,
  flame: Flame,
  shield: Shield,
  lock: Lock,
  chevronRight: ChevronRight,
  settings: Settings,
  crown: Crown,
  check: Check,
  x: X,
  video: Video,
  speaker: Volume2,
  doc: FileText,
  users: Users,
  chart: LayoutDashboard,
  creditCard: CreditCard,
  book: GraduationCap,
  bell: Bell,
  bars: Menu,
  cash: Banknote,
  plus: Plus,
  sparkles: Sparkles,
} as const;
