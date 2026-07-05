'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { UserTable } from '@/components/admin/UserTable';
import type { Profile, SubscriptionPlan } from '@/types/user';

type PlanFilter = 'all' | SubscriptionPlan;

export default function Page() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');

  useEffect(() => {
    const loadUsers = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data ?? []);
      setIsLoading(false);
    };
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesPlan = planFilter === 'all' || user.subscription_plan === planFilter;
      const matchesSearch =
        !query ||
        user.first_name.toLowerCase().includes(query) ||
        (user.email ?? '').toLowerCase().includes(query);
      return matchesPlan && matchesSearch;
    });
  }, [users, search, planFilter]);

  const filters: { label: string; value: PlanFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Starter', value: 'starter' },
    { label: 'Premium', value: 'premium' },
  ];

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Utilisateurs</h1>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par prénom ou email…"
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setPlanFilter(filter.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                planFilter === filter.value
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        {isLoading ? (
          <Spinner />
        ) : (
          <UserTable users={filteredUsers} onRowClick={(user) => router.push(`/admin/utilisateurs/${user.id}`)} />
        )}
      </div>
    </main>
  );
}
