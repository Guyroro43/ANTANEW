'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/utils/format';
import type { Profile } from '@/types/user';

const PAGE_SIZE = 10;

type SortKey = 'date_desc' | 'date_asc' | 'xp_desc' | 'plan';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'date_desc', label: "Plus récent d'abord" },
  { value: 'date_asc', label: "Plus ancien d'abord" },
  { value: 'xp_desc', label: 'XP décroissant' },
  { value: 'plan', label: 'Premium d\'abord' },
];

const sortFns: Record<SortKey, (a: Profile, b: Profile) => number> = {
  date_desc: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  date_asc: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  xp_desc: (a, b) => b.total_xp - a.total_xp,
  plan: (a, b) => Number(b.subscription_plan === 'premium') - Number(a.subscription_plan === 'premium'),
};

interface UserTableProps {
  users: Profile[];
  onRowClick?: (user: Profile) => void;
  showEmail?: boolean;
}

export function UserTable({ users, onRowClick, showEmail = true }: UserTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) => user.first_name.toLowerCase().includes(query) || (user.email ?? '').toLowerCase().includes(query),
    );
  }, [users, search]);

  const sorted = useMemo(() => [...filtered].sort(sortFns[sortKey]), [filtered, sortKey]);
  const visible = sorted.slice(0, visibleCount);

  if (users.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Aucun utilisateur pour l'instant.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Rechercher un nom ou un email…"
          className="max-w-xs"
        />
        <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {sorted.length} utilisateur{sorted.length > 1 ? 's' : ''}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucun résultat pour cette recherche.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-4 font-semibold">Prénom</th>
                {showEmail && <th className="py-2 pr-4 font-semibold">Email</th>}
                <th className="py-2 pr-4 font-semibold">XP</th>
                <th className="py-2 pr-4 font-semibold">Abonnement</th>
                <th className="py-2 pr-4 font-semibold">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onRowClick?.(user)}
                  className={
                    onRowClick
                      ? 'cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'
                      : 'border-b border-slate-100 dark:border-slate-800'
                  }
                >
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{user.first_name}</td>
                  {showEmail && <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{user.email ?? '—'}</td>}
                  <td className="py-3 pr-4 tabular-nums text-slate-600 dark:text-slate-300">{user.total_xp}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={user.subscription_plan === 'premium' ? 'success' : 'default'}>
                      {user.subscription_plan === 'premium' ? 'Premium' : 'Starter'}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visibleCount < sorted.length && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
            Afficher plus
          </Button>
        </div>
      )}
    </div>
  );
}
