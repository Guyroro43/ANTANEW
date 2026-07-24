import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';
import { ModulesGrid, type ModuleCardData } from '@/components/modules/ModulesGrid';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const [{ data: profile }, { data: modules }, { data: streak }, { count: badgesCount }] = await Promise.all([
    supabase.from('profiles').select('subscription_plan, total_xp').eq('id', user.id).single(),
    supabase.from('modules').select('*').eq('is_published', true).order('order_index', { ascending: true }),
    supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
    supabase.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  const isPremiumUser = profile?.subscription_plan === 'premium';
  const moduleIds = (modules ?? []).map((m) => m.id);

  const [{ data: lessons }, { data: progressRows }] = await Promise.all([
    moduleIds.length
      ? supabase.from('lessons').select('id, module_id').eq('is_published', true).in('module_id', moduleIds)
      : Promise.resolve({ data: [] as { id: string; module_id: string }[] }),
    supabase.from('progress').select('lesson_id, completed').eq('user_id', user.id).eq('completed', true),
  ]);

  const completedLessonIds = new Set((progressRows ?? []).map((row) => row.lesson_id));

  const moduleCards: ModuleCardData[] = (modules ?? []).map((module) => {
    const moduleLessons = (lessons ?? []).filter((lesson) => lesson.module_id === module.id);
    const completedCount = moduleLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;

    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      description: module.description,
      imageUrl: module.image_url,
      isPremium: module.is_premium,
      locked: module.is_premium && !isPremiumUser,
      completedCount,
      totalCount: moduleLessons.length,
    };
  });

  const statPills = [
    { icon: icons.flame, value: streak?.current_streak ?? 0, color: 'text-red-600 dark:text-red-400' },
    { icon: icons.trophy, value: badgesCount ?? 0, color: 'text-yellow-600 dark:text-yellow-400' },
    { icon: icons.bolt, value: profile?.total_xp ?? 0, color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {statPills.map((stat, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Icon icon={stat.icon} className={`h-4 w-4 ${stat.color}`} />
                  {stat.value}
                </span>
              ))}
            </div>
            <Link
              href="/parametres"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Icon icon={icons.settings} className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Modules</p>
              <h1 className="mt-3 text-4xl font-black">Choisis un parcours</h1>
            </div>
            <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
              Retour au dashboard
            </Link>
          </div>
        </Reveal>

        {moduleCards.length === 0 ? (
          <p className="mt-8 text-slate-600 dark:text-slate-300">Aucun module disponible pour l&apos;instant.</p>
        ) : (
          <ModulesGrid modules={moduleCards} />
        )}
      </div>
    </main>
  );
}
