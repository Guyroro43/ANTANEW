'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Repeat,
  MessageSquare,
  ClipboardCheck,
  Send,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/user';

type ActiveRole = 'founder' | 'instructor';

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const linksByRole: Record<ActiveRole | 'developer', NavLink[]> = {
  instructor: [
    { href: '/admin/instructor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/modules', label: 'Modules & Leçons', icon: BookOpen },
    { href: '/admin/evaluations', label: 'Évaluations', icon: ClipboardCheck },
    { href: '/admin/notifications', label: 'Notifications', icon: Send },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  ],
  founder: [
    { href: '/admin/founder', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { href: '/admin/notifications', label: 'Notifications', icon: Send },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  ],
  developer: [
    { href: '/admin/developer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/modules', label: 'Modules & Leçons', icon: BookOpen },
    { href: '/admin/evaluations', label: 'Évaluations', icon: ClipboardCheck },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { href: '/admin/abonnements', label: 'Abonnements', icon: CreditCard },
    { href: '/admin/notifications', label: 'Notifications', icon: Send },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  ],
};

const TOGGLE_STORAGE_KEY = 'anta_admin_active_role';

interface AdminSidebarProps {
  adminName: string;
  role: UserRole;
  userId: string;
}

function lastSeenMessagesKey(userId: string) {
  return `anta_messages_last_seen_${userId}`;
}

export function AdminSidebar({ adminName, role, userId }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<ActiveRole>('founder');
  const [unreadMessages, setUnreadMessages] = useState(0);

  const isFounderInstructor = role === 'founder_instructor';

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    const lastSeen = window.localStorage.getItem(lastSeenMessagesKey(userId)) ?? new Date(0).toISOString();

    const loadUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .neq('author_id', userId)
        .gt('created_at', lastSeen);
      setUnreadMessages(count ?? 0);
    };
    loadUnread();

    const channel = supabase
      .channel('admin-sidebar-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const row = payload.new as { author_id: string };
        if (row.author_id !== userId) {
          setUnreadMessages((prev) => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (!pathname?.startsWith('/admin/messages')) return;
    window.localStorage.setItem(lastSeenMessagesKey(userId), new Date().toISOString());
    setUnreadMessages(0);
  }, [pathname, userId]);

  useEffect(() => {
    if (!isFounderInstructor) return;
    const stored = window.localStorage.getItem(TOGGLE_STORAGE_KEY);
    if (stored === 'founder' || stored === 'instructor') {
      setActiveRole(stored);
    } else if (pathname?.startsWith('/admin/instructor')) {
      setActiveRole('instructor');
    }
  }, [isFounderInstructor, pathname]);

  const toggleActiveRole = () => {
    const next = activeRole === 'founder' ? 'instructor' : 'founder';
    setActiveRole(next);
    window.localStorage.setItem(TOGGLE_STORAGE_KEY, next);
    router.push(next === 'founder' ? '/admin/founder' : '/admin/instructor');
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/connexion');
    router.refresh();
  };

  const links = role === 'developer' ? linksByRole.developer : linksByRole[isFounderInstructor ? activeRole : (role as ActiveRole)];
  const homeHref = role === 'developer' ? '/admin/developer' : links[0]?.href ?? '/dashboard';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu admin"
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
          <Link href={homeHref} className="text-xl font-black text-foreground">
            ANTA <span className="text-sm font-semibold text-primary">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu admin"
            className="text-muted-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isFounderInstructor && (
          <button
            type="button"
            onClick={toggleActiveRole}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <Repeat className="h-3.5 w-3.5" />
            <AnimatePresence mode="wait">
              <motion.span
                key={activeRole}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
              >
                Vue {activeRole === 'founder' ? 'Fondateur' : 'Instructeur'}
              </motion.span>
            </AnimatePresence>
          </button>
        )}

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            const Icon = link.icon;
            const isMessages = link.href === '/admin/messages';
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
                {isMessages && unreadMessages > 0 && (
                  <span
                    className={cn(
                      'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                      isActive ? 'bg-primary-foreground text-primary' : 'bg-red-600 text-white',
                    )}
                  >
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
          {role === 'developer' && (
            <Link
              href="/admin/developer#roles"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
              Rôles
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <UserAvatar name={adminName} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{adminName}</p>
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
      </aside>
    </>
  );
}
