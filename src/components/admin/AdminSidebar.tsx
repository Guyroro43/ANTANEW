'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/modules', label: 'Modules & Leçons', icon: '📚' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥' },
  { href: '/admin/abonnements', label: 'Abonnements', icon: '💳' },
  { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
];

interface AdminSidebarProps {
  adminName: string;
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
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
        aria-label="Ouvrir le menu admin"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white/90 text-lg text-slate-800 shadow-sm md:hidden dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
      >
        ☰
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-shrink-0 flex-col border-r border-red-200/70 bg-white/95 px-4 py-6 transition-transform duration-200 ease-in-out dark:border-slate-700 dark:bg-slate-900/95',
          'md:static md:z-auto md:w-64 md:translate-x-0 md:bg-white/80 md:dark:bg-slate-900/80',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/admin/dashboard" className="text-xl font-black text-slate-900 dark:text-white">
            ANTA <span className="text-sm font-semibold text-red-600 dark:text-yellow-400">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu admin"
            className="text-xl text-slate-500 md:hidden dark:text-slate-400"
          >
            ✕
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
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

        <div className="flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Avatar name={adminName} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{adminName}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-semibold text-red-600 hover:underline dark:text-yellow-400"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
