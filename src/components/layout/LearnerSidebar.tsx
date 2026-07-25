'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Award,
  User,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/modules', label: 'Modules', icon: BookOpen },
  { href: '/pratique', label: 'Pratique', icon: MessageCircle },
  { href: '/classement', label: 'Classement', icon: Trophy },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/abonnement', label: 'Abonnement', icon: CreditCard },
  { href: '/profil', label: 'Profil', icon: User },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
];

interface LearnerSidebarProps {
  firstName: string;
}

export function LearnerSidebar({ firstName }: LearnerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/connexion');
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden
          className="fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-card px-4 py-6 transition-transform duration-200 ease-in-out',
          'md:static md:z-auto md:w-64 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="text-xl font-black text-foreground">
            ANTA
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
            className="text-muted-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <UserAvatar name={firstName} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{firstName}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <LogOut className="h-3 w-3" />
                Déconnexion
              </button>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
