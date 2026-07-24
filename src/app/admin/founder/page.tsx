import Link from 'next/link';
import { DollarSign, UserPlus, TrendingUp, Repeat2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/StatCard';
import { FilterableUserTable, type UserWithActivity } from '@/components/admin/FilterableUserTable';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

type Period = 'today' | '7d' | '30d' | '3m' | '1y';

const periods: { value: Period; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '3m', label: '3 mois' },
  { value: '1y', label: '1 an' },
];

function getPeriodStart(period: Period, now: Date) {
  const start = new Date(now);
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '3m':
      start.setMonth(start.getMonth() - 3);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  return start;
}

export default async function FounderDashboardPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const supabase = createClient();
  const period = (periods.some((p) => p.value === searchParams.period) ? searchParams.period : '30d') as Period;

  const now = new Date();
  const periodStart = getPeriodStart(period, now);
  const retentionCutoff = new Date(now);
  retentionCutoff.setDate(retentionCutoff.getDate() - 30);

  const [
    { data: periodTransactions },
    { count: newSignups },
    { count: totalUsers },
    { count: premiumUsers },
    { data: allProfiles },
    { data: modules },
    { data: lessons },
    { data: oldEnoughProfiles },
    { data: retainedProgress },
  ] = await Promise.all([
    supabase.from('transactions').select('amount').eq('status', 'success').gte('created_at', periodStart.toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', periodStart.toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'premium'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('modules').select('id, title').eq('is_published', true),
    supabase.from('lessons').select('id, module_id').eq('is_published', true),
    supabase.from('profiles').select('id').lt('created_at', retentionCutoff.toISOString()),
    supabase
      .from('progress')
      .select('user_id')
      .eq('completed', true)
      .gte('completed_at', retentionCutoff.toISOString()),
  ]);

  const periodRevenue = (periodTransactions ?? []).reduce((sum, tx) => sum + Number(tx.amount), 0);
  const arpu = newSignups && newSignups > 0 ? periodRevenue / newSignups : 0;
  const conversionRate = totalUsers && totalUsers > 0 ? Math.round(((premiumUsers ?? 0) / totalUsers) * 100) : 0;

  const retainedUserIds = new Set((retainedProgress ?? []).map((p) => p.user_id));
  const eligibleForRetention = (oldEnoughProfiles ?? []).length;
  const retainedCount = (oldEnoughProfiles ?? []).filter((p) => retainedUserIds.has(p.id)).length;
  const retentionRate = eligibleForRetention > 0 ? Math.round((retainedCount / eligibleForRetention) * 100) : 0;

  const lessonCountByModule = new Map<string, number>();
  for (const lesson of lessons ?? []) {
    lessonCountByModule.set(lesson.module_id, (lessonCountByModule.get(lesson.module_id) ?? 0) + 1);
  }
  const topModules = [...(modules ?? [])]
    .map((m) => ({ title: m.title, lessons: lessonCountByModule.get(m.id) ?? 0 }))
    .sort((a, b) => b.lessons - a.lessons)
    .slice(0, 3);

  const users: UserWithActivity[] = (allProfiles ?? []).map((profile) => ({
    ...profile,
    isActive: retainedUserIds.has(profile.id),
  }));

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Fondateur</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-foreground">Pilotage économique</h1>
        <div className="inline-flex gap-1 rounded-full bg-muted p-1">
          {periods.map((p) => (
            <Link
              key={p.value}
              href={`/admin/founder?period=${p.value}`}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                period === p.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenu de la période" value={formatCurrency(periodRevenue)} icon={DollarSign} />
        <StatCard label="Nouveaux inscrits" value={String(newSignups ?? 0)} icon={UserPlus} />
        <StatCard label="ARPU (période)" value={formatCurrency(arpu)} icon={TrendingUp} />
        <StatCard label="Rétention 30j" value={`${retentionRate}%`} icon={Repeat2} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-foreground">Conversion Starter → Premium</h2>
          <p className="mt-3 text-3xl font-black text-foreground">{conversionRate}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {premiumUsers ?? 0} comptes Premium sur {totalUsers ?? 0} inscrits.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-foreground">Synthèse éducative</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Modules publiés</p>
              <p className="text-xl font-black text-foreground">{modules?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Leçons totales</p>
              <p className="text-xl font-black text-foreground">{lessons?.length ?? 0}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top 3 modules</p>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {topModules.map((m) => (
              <li key={m.title} className="flex justify-between">
                <span>{m.title}</span>
                <span className="text-muted-foreground">{m.lessons} leçons</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Apprenants</h2>
        <div className="mt-4">
          <FilterableUserTable users={users} showEmail />
        </div>
      </div>
    </main>
  );
}
