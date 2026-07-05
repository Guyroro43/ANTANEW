import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const shortcuts = [
  { href: '/modules', label: 'Modules' },
  { href: '/classement', label: 'Classement' },
  { href: '/profil', label: 'Profil' },
  { href: '/badges', label: 'Badges' },
];

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
    .select('first_name, level, total_xp, role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .single();

  const firstName = profile?.first_name ?? 'Apprenant';
  const level = profile?.level ?? 'Lionceau';
  const totalXp = profile?.total_xp ?? 0;
  const currentStreak = streak?.current_streak ?? 0;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Dashboard</p>
        <h1 className="mt-3 text-4xl font-black">Bonjour {firstName} 👋</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
          Niveau <span className="font-semibold text-red-600 dark:text-green-400">{level}</span> — {totalXp} XP — Streak de {currentStreak} jour{currentStreak > 1 ? 's' : ''}.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">XP total</p>
            <p className="mt-1 text-2xl font-black">{totalXp}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Streak</p>
            <p className="mt-1 text-2xl font-black">{currentStreak} 🔥</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Niveau</p>
            <p className="mt-1 text-2xl font-black">{level}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 font-semibold text-slate-800 transition hover:border-red-400 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950 dark:text-slate-100">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
