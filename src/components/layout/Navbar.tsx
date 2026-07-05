'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/modules', label: 'Modules' },
  { href: '/classement', label: 'Classement' },
  { href: '/badges', label: 'Badges' },
  { href: '/profil', label: 'Profil' },
];

export function Navbar() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/connexion');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-red-200/70 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">
        <Link href="/dashboard" className="text-lg font-black text-slate-900 dark:text-white">
          ANTA
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-red-600 dark:text-slate-300 dark:hover:text-yellow-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
