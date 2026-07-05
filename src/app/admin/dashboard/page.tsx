import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/StatCard';
import { ActivityChart } from '@/components/admin/ActivityChart';
import { UserTable } from '@/components/admin/UserTable';
import { TransactionTable, type TransactionRow } from '@/components/admin/TransactionTable';
import { formatCurrency } from '@/utils/format';

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function Page() {
  const supabase = createClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    { count: totalUsers },
    { count: premiumUsers },
    { data: recentXpLogs },
    { data: monthTransactions },
    { data: weekProfiles },
    { data: weekProgress },
    { data: latestUsers },
    { data: latestTransactions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'premium'),
    supabase.from('xp_logs').select('user_id').gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'success')
      .gte('created_at', startOfMonth.toISOString()),
    supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('progress')
      .select('completed_at')
      .eq('completed', true)
      .gte('completed_at', sevenDaysAgo.toISOString()),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const activeUsers7d = new Set((recentXpLogs ?? []).map((log) => log.user_id)).size;
  const monthlyRevenue = (monthTransactions ?? []).reduce((sum, tx) => sum + Number(tx.amount), 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sevenDaysAgo);
    day.setDate(sevenDaysAgo.getDate() + index);
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const signups = (weekProfiles ?? []).filter((profile) => {
      const t = new Date(profile.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;

    const completedLessons = (weekProgress ?? []).filter((entry) => {
      if (!entry.completed_at) return false;
      const t = new Date(entry.completed_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;

    return {
      label: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
      signups,
      completedLessons,
    };
  });

  const transactionUserIds = Array.from(new Set((latestTransactions ?? []).map((tx) => tx.user_id)));
  const { data: transactionUsers } = transactionUserIds.length
    ? await supabase.from('profiles').select('id, first_name').in('id', transactionUserIds)
    : { data: [] as { id: string; first_name: string }[] };

  const userNameById = new Map((transactionUsers ?? []).map((u) => [u.id, u.first_name]));
  const transactionRows: TransactionRow[] = (latestTransactions ?? []).map((tx) => ({
    ...tx,
    userName: userNameById.get(tx.user_id) ?? 'Utilisateur supprimé',
  }));

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Vue d'ensemble</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inscrits total" value={String(totalUsers ?? 0)} icon="👥" />
        <StatCard label="Actifs 7 jours" value={String(activeUsers7d)} icon="⚡" />
        <StatCard label="Comptes Premium" value={String(premiumUsers ?? 0)} icon="💎" />
        <StatCard label="Revenu du mois" value={formatCurrency(monthlyRevenue)} icon="💰" />
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activité des 7 derniers jours</h2>
        <div className="mt-4">
          <ActivityChart days={days} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Derniers inscrits</h2>
          <div className="mt-4">
            <UserTable users={latestUsers ?? []} />
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dernières transactions</h2>
          <div className="mt-4">
            <TransactionTable transactions={transactionRows} />
          </div>
        </div>
      </div>
    </main>
  );
}
