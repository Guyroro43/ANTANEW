'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/Spinner';
import { TransactionTable, type TransactionRow } from '@/components/admin/TransactionTable';
import type { Transaction } from '@/types/abonnement';

type StatusFilter = 'all' | Transaction['status'];
type PeriodFilter = 'all' | '7d' | '30d' | 'month';

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Réussies', value: 'success' },
  { label: 'Échouées', value: 'failed' },
  { label: 'Remboursées', value: 'refunded' },
];

const periodFilters: { label: string; value: PeriodFilter }[] = [
  { label: 'Toute période', value: 'all' },
  { label: '7 derniers jours', value: '7d' },
  { label: '30 derniers jours', value: '30d' },
  { label: 'Ce mois-ci', value: 'month' },
];

function isWithinPeriod(dateStr: string, period: PeriodFilter) {
  if (period === 'all') return true;
  const date = new Date(dateStr);
  const now = new Date();
  if (period === 'month') {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  const days = period === '7d' ? 7 : 30;
  const threshold = new Date(now);
  threshold.setDate(now.getDate() - days);
  return date >= threshold;
}

export default function Page() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  useEffect(() => {
    const loadTransactions = async () => {
      const supabase = createClient();
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      const userIds = Array.from(new Set((transactions ?? []).map((tx) => tx.user_id)));
      const { data: users } = userIds.length
        ? await supabase.from('profiles').select('id, first_name').in('id', userIds)
        : { data: [] as { id: string; first_name: string }[] };

      const nameById = new Map((users ?? []).map((u) => [u.id, u.first_name]));
      setRows(
        (transactions ?? []).map((tx) => ({ ...tx, userName: nameById.get(tx.user_id) ?? 'Utilisateur supprimé' })),
      );
      setIsLoading(false);
    };
    loadTransactions();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesPeriod = isWithinPeriod(row.created_at, periodFilter);
      return matchesStatus && matchesPeriod;
    });
  }, [rows, statusFilter, periodFilter]);

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Abonnements</h1>

      <div className="mt-6 flex flex-wrap gap-4">
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {periodFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        {isLoading ? <Spinner /> : <TransactionTable transactions={filteredRows} />}
      </div>
    </main>
  );
}
