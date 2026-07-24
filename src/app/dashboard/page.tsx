import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';
import { WelcomeBackModal } from '@/components/dashboard/WelcomeBackModal';

const shortcuts = [
  { href: '/modules', label: 'Modules', icon: icons.module },
  { href: '/classement', label: 'Classement', icon: icons.trophy },
  { href: '/profil', label: 'Profil', icon: icons.user },
  { href: '/badges', label: 'Badges', icon: icons.badge },
];

const weekdayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

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
    .select('first_name, level, total_xp, role, subscription_plan')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  const [{ data: streak }, { data: modules }] = await Promise.all([
    supabase.from('streaks').select('current_streak, last_activity_date').eq('user_id', user.id).single(),
    supabase.from('modules').select('id, order_index, is_premium').eq('is_published', true).order('order_index', { ascending: true }),
  ]);

  const isPremiumUser = profile?.subscription_plan === 'premium';
  const moduleIds = (modules ?? []).map((m) => m.id);

  const [{ data: lessons }, { data: progressRows }] = await Promise.all([
    moduleIds.length
      ? supabase
          .from('lessons')
          .select('id, module_id, title, order_index, access_level')
          .eq('is_published', true)
          .in('module_id', moduleIds)
          .order('order_index', { ascending: true })
      : Promise.resolve({ data: [] as { id: string; module_id: string; title: string; order_index: number; access_level: string }[] }),
    supabase.from('progress').select('lesson_id, completed, completed_at').eq('user_id', user.id),
  ]);

  const completedLessonIds = new Set((progressRows ?? []).filter((row) => row.completed).map((row) => row.lesson_id));
  const completedDateKeys = new Set(
    (progressRows ?? [])
      .filter((row) => row.completed && row.completed_at)
      .map((row) => (row.completed_at as string).slice(0, 10)),
  );

  const now = new Date();
  const todayKey = toDateKey(now);
  const hasCompletedToday = completedDateKeys.has(todayKey);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const key = toDateKey(date);
    return {
      label: weekdayLabels[i],
      dayNumber: date.getDate(),
      isToday: key === todayKey,
      done: completedDateKeys.has(key),
    };
  });

  const modulesById = new Map((modules ?? []).map((m) => [m.id, m]));
  const nextLessonRow = (lessons ?? []).find((lesson) => {
    if (completedLessonIds.has(lesson.id)) return false;
    const parentModule = modulesById.get(lesson.module_id);
    const moduleLocked = parentModule?.is_premium && !isPremiumUser;
    const lessonLocked = lesson.access_level === 'premium' && !isPremiumUser;
    return !moduleLocked && !lessonLocked;
  });

  const firstName = profile?.first_name ?? 'Apprenant';
  const level = profile?.level ?? 'Lionceau';
  const totalXp = profile?.total_xp ?? 0;
  const currentStreak = streak?.current_streak ?? 0;
  const streakIntact = streak?.last_activity_date
    ? [todayKey, toDateKey(new Date(now.getTime() - 86_400_000))].includes(streak.last_activity_date)
    : false;

  const stats = [
    { label: 'XP total', value: totalXp, icon: icons.bolt },
    { label: 'Streak', value: `${currentStreak} jour${currentStreak > 1 ? 's' : ''}`, icon: icons.flame },
    { label: 'Niveau', value: level, icon: icons.shield },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-4">
              {weekDays.map((day) => (
                <div key={day.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{day.label}</span>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                      day.isToday
                        ? 'bg-red-600 text-white dark:bg-green-600'
                        : day.done
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {day.done ? <Icon icon={icons.check} className="h-4 w-4" /> : day.dayNumber}
                  </div>
                </div>
              ))}
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-800">
              <Icon icon={icons.flame} className="h-4 w-4 text-red-600 dark:text-yellow-400" />
              {currentStreak}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-gradient-to-br from-red-600 via-red-500 to-yellow-500 p-6 text-white shadow-lg dark:from-green-700 dark:via-green-600 dark:to-emerald-500">
            <div>
              <h1 className="text-3xl font-black">Bonjour {firstName} 👋</h1>
              <p className="mt-2 max-w-lg text-white/90">
                Niveau <span className="font-semibold">{level}</span> — {totalXp} XP — Streak de {currentStreak} jour{currentStreak > 1 ? 's' : ''}.
              </p>
            </div>
            <Link
              href={nextLessonRow ? `/lecon/${nextLessonRow.id}` : '/modules'}
              className="flex-shrink-0 rounded-full bg-white px-6 py-3 font-bold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:text-green-700"
            >
              Continuer une leçon
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Objectifs du jour
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-[1.25rem] bg-orange-50 p-5 dark:bg-orange-950/30">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  hasCompletedToday ? 'border-green-600 bg-green-600 text-white' : 'border-orange-300 text-transparent dark:border-orange-700'
                }`}
              >
                <Icon icon={icons.check} className="h-4 w-4" />
              </div>
              <p className={`font-semibold text-slate-800 dark:text-slate-100 ${hasCompletedToday ? 'line-through opacity-60' : ''}`}>
                Terminer une leçon aujourd&apos;hui
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-[1.25rem] bg-sky-50 p-5 dark:bg-sky-950/30">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  streakIntact ? 'border-green-600 bg-green-600 text-white' : 'border-sky-300 text-transparent dark:border-sky-700'
                }`}
              >
                <Icon icon={icons.check} className="h-4 w-4" />
              </div>
              <p className={`font-semibold text-slate-800 dark:text-slate-100 ${streakIntact ? 'line-through opacity-60' : ''}`}>
                Garder ton streak de {currentStreak} jour{currentStreak > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={0.15 + index * 0.05}>
              <div className="flex items-center gap-4 rounded-[1.25rem] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-green-950 dark:text-green-400">
                  <Icon icon={stat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-0.5 text-2xl font-black tabular-nums">{stat.value}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Accès rapide
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-[1.25rem] border border-red-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-5 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-red-400 hover:shadow-md dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950 dark:text-slate-100"
              >
                <Icon icon={item.icon} className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-green-400" />
                <span className="flex-1">{item.label}</span>
                <Icon
                  icon={icons.chevronRight}
                  className="h-4 w-4 flex-shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-red-500 dark:group-hover:text-green-400"
                />
              </Link>
            ))}
          </div>
        </Reveal>
      </div>

      <WelcomeBackModal
        firstName={firstName}
        currentStreak={currentStreak}
        streakIntact={streakIntact}
        hasCompletedToday={hasCompletedToday}
        nextLesson={nextLessonRow ? { title: nextLessonRow.title, href: `/lecon/${nextLessonRow.id}` } : null}
      />
    </main>
  );
}
