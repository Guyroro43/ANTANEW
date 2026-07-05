import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsToggle } from '@/components/parametres/NotificationsToggle';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('notifications_enabled')
    .eq('id', user.id)
    .single();

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Paramètres</p>
        <h1 className="mt-3 text-4xl font-black">Gère ton expérience ANTA</h1>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
            <span>Thème</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
            <span>Notifications</span>
            <NotificationsToggle userId={user.id} initialEnabled={profile?.notifications_enabled ?? true} />
          </div>
        </div>

        <Link href="/dashboard" className="mt-8 inline-flex rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
          Retour au dashboard
        </Link>
      </div>
    </main>
  );
}
