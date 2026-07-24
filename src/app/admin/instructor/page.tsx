import { Users, Zap, CalendarCheck, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/StatCard';
import { FilterableUserTable, type UserWithActivity } from '@/components/admin/FilterableUserTable';
import { Card } from '@/components/ui/card';

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function InstructorDashboardPage() {
  const supabase = createClient();

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    { data: modules },
    { data: allProfiles },
    { data: recentXpLogs },
    { data: allProgress },
  ] = await Promise.all([
    supabase.from('modules').select('id, title').eq('is_published', true),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('xp_logs').select('user_id').gte('created_at', weekStart.toISOString()),
    supabase.from('lessons').select('id, module_id, progress(completed, completed_at)').eq('is_published', true),
  ]);

  const activeUserIds = new Set((recentXpLogs ?? []).map((log) => log.user_id));
  const users: UserWithActivity[] = (allProfiles ?? []).map((profile) => ({
    ...profile,
    isActive: activeUserIds.has(profile.id),
  }));

  const lessons = (allProgress ?? []) as unknown as {
    id: string;
    module_id: string;
    progress: { completed: boolean; completed_at: string | null }[];
  }[];

  let completedToday = 0;
  let completedWeek = 0;
  let completedMonth = 0;
  const moduleStats = new Map<string, { total: number; completed: number }>();

  for (const lesson of lessons) {
    const stat = moduleStats.get(lesson.module_id) ?? { total: 0, completed: 0 };
    stat.total += 1;
    const hasCompletion = lesson.progress.some((p) => p.completed);
    if (hasCompletion) stat.completed += 1;
    moduleStats.set(lesson.module_id, stat);

    for (const p of lesson.progress) {
      if (!p.completed || !p.completed_at) continue;
      const t = new Date(p.completed_at).getTime();
      if (t >= todayStart.getTime()) completedToday += 1;
      if (t >= weekStart.getTime()) completedWeek += 1;
      if (t >= monthStart.getTime()) completedMonth += 1;
    }
  }

  const moduleCompletion = (modules ?? []).map((module) => {
    const stat = moduleStats.get(module.id) ?? { total: 0, completed: 0 };
    const rate = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
    return { title: module.title, rate, total: stat.total };
  });

  const avgCompletionRate = moduleCompletion.length
    ? Math.round(moduleCompletion.reduce((sum, m) => sum + m.rate, 0) / moduleCompletion.length)
    : 0;

  const sortedByRate = [...moduleCompletion].sort((a, b) => b.rate - a.rate);
  const topModules = sortedByRate.slice(0, 5);
  const bottomModules = sortedByRate.slice(-3).reverse();

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Instructeur</p>
      <h1 className="mt-2 text-3xl font-black text-foreground">Vue d'ensemble pédagogique</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Apprenants actifs (7j)" value={String(activeUserIds.size)} icon={Users} />
        <StatCard label="Leçons complétées aujourd'hui" value={String(completedToday)} icon={CalendarCheck} />
        <StatCard label="Cette semaine" value={String(completedWeek)} icon={Zap} />
        <StatCard label="Taux de complétion moyen" value={`${avgCompletionRate}%`} icon={TrendingUp} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-foreground">Top 5 modules</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {topModules.map((m) => (
              <li key={m.title} className="flex items-center justify-between">
                <span className="text-foreground">{m.title}</span>
                <span className="font-semibold text-success">{m.rate}%</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-foreground">À améliorer (bottom 3)</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {bottomModules.map((m) => (
              <li key={m.title} className="flex items-center justify-between">
                <span className="text-foreground">{m.title}</span>
                <span className="font-semibold text-warning-foreground">{m.rate}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Statistiques apprenants</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {completedMonth} leçons complétées ce mois-ci, tous modules confondus.
        </p>
        <div className="mt-4">
          <FilterableUserTable users={users} showEmail={false} />
        </div>
      </div>
    </main>
  );
}
