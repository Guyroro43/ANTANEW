import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';

const levelLabels: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const [{ data: profile }, { data: streak }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, avatar_url, english_level, level, total_xp, subscription_plan, created_at')
      .eq('id', user.id)
      .single(),
    supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', user.id).single(),
  ]);

  const firstName = profile?.first_name ?? 'Apprenant';
  const isPremium = profile?.subscription_plan === 'premium';

  const stats = [
    { label: 'Niveau actuel', value: profile?.level ?? 'Lionceau', icon: icons.shield },
    { label: "Niveau d'anglais", value: levelLabels[profile?.english_level ?? 'debutant'], icon: icons.book },
    { label: 'XP total', value: profile?.total_xp ?? 0, icon: icons.bolt },
    {
      label: 'Streak',
      value: `${streak?.current_streak ?? 0} 🔥`,
      hint: `record : ${streak?.longest_streak ?? 0}`,
      icon: icons.flame,
    },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Profil</p>
              <h1 className="mt-3 text-4xl font-black">Ton profil ANTA</h1>
            </div>
            <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
              Retour au dashboard
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <UserAvatar name={firstName} src={profile?.avatar_url} size={64} />
            <div>
              <p className="text-xl font-semibold">{firstName}</p>
              <Badge variant={isPremium ? 'success' : 'default'} className="mt-1">
                {isPremium ? 'Premium' : 'Starter'}
              </Badge>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06} className={stat.label === 'Membre depuis' ? 'sm:col-span-2' : undefined}>
              <div className="flex items-center gap-4 rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-green-950 dark:text-green-400">
                  <Icon icon={stat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums">
                    {stat.value}
                    {stat.hint && <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">({stat.hint})</span>}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.24} className="sm:col-span-2">
            <div className="flex items-center gap-4 rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-green-950 dark:text-green-400">
                <Icon icon={icons.user} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Membre depuis</p>
                <p className="mt-0.5 text-lg font-semibold">{profile?.created_at ? formatDate(profile.created_at) : '—'}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
