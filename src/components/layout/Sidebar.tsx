'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/modules', label: 'Modules', icon: '📚' },
  { href: '/classement', label: 'Classement', icon: '🏆' },
  { href: '/badges', label: 'Badges', icon: '🎖️' },
  { href: '/profil', label: 'Profil', icon: '👤' },
  { href: '/abonnement', label: 'Abonnement', icon: '💳' },
  { href: '/parametres', label: 'Paramètres', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-red-200/70 bg-white/60 px-4 py-6 dark:border-slate-700 dark:bg-slate-900/60 lg:block">
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-green-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
