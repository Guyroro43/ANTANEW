import { Users, DollarSign, BookOpen, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/StatCard';
import { RoleManagementTable } from '@/components/admin/RoleManagementTable';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/format';

export default async function DeveloperDashboardPage() {
  const supabase = createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    { count: totalUsers },
    { count: premiumUsers },
    { data: monthTransactions },
    { count: modulesCount },
    { data: recentXpLogs },
    { data: allProfiles },
    { data: roleChanges },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'premium'),
    supabase.from('transactions').select('amount').eq('status', 'success').gte('created_at', monthStart.toISOString()),
    supabase.from('modules').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('xp_logs').select('user_id').gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase
      .from('role_changes')
      .select('id, previous_role, new_role, changed_at, user:profiles!role_changes_user_id_fkey(first_name), changed_by_profile:profiles!role_changes_changed_by_fkey(first_name)')
      .order('changed_at', { ascending: false })
      .limit(10),
  ]);

  const monthlyRevenue = (monthTransactions ?? []).reduce((sum, tx) => sum + Number(tx.amount), 0);
  const activeUsers7d = new Set((recentXpLogs ?? []).map((log) => log.user_id)).size;

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Développeur</p>
      <h1 className="mt-2 text-3xl font-black text-foreground">Synthèse globale</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inscrits total" value={String(totalUsers ?? 0)} icon={Users} />
        <StatCard label="Comptes Premium" value={String(premiumUsers ?? 0)} icon={DollarSign} />
        <StatCard label="Revenu du mois" value={formatCurrency(monthlyRevenue)} icon={DollarSign} />
        <StatCard label="Actifs 7 jours" value={String(activeUsers7d)} icon={Activity} />
      </div>

      <div className="mt-4">
        <StatCard label="Modules publiés" value={String(modulesCount ?? 0)} icon={BookOpen} />
      </div>

      <div id="roles" className="mt-10 scroll-mt-6">
        <h2 className="text-lg font-bold text-foreground">Gestion des rôles</h2>
        <p className="mt-1 text-sm text-muted-foreground">Confirmation obligatoire avant tout changement.</p>
        <Card className="mt-4">
          <RoleManagementTable users={allProfiles ?? []} />
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Historique des changements de rôle</h2>
        <Card className="mt-4">
          {roleChanges && roleChanges.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border text-sm">
              {roleChanges.map((change) => (
                <li key={change.id} className="flex items-center justify-between py-3">
                  <span>
                    <span className="font-semibold text-foreground">
                      {(change.user as unknown as { first_name: string } | null)?.first_name ?? 'Utilisateur supprimé'}
                    </span>{' '}
                    : {change.previous_role} → {change.new_role}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(change.changed_at)} par{' '}
                    {(change.changed_by_profile as unknown as { first_name: string } | null)?.first_name ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun changement de rôle pour l'instant.</p>
          )}
        </Card>
      </div>
    </main>
  );
}
