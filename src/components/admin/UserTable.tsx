'use client';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import type { Profile } from '@/types/user';

interface UserTableProps {
  users: Profile[];
  onRowClick?: (user: Profile) => void;
  showEmail?: boolean;
}

export function UserTable({ users, onRowClick, showEmail = true }: UserTableProps) {
  if (users.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Aucun utilisateur pour l'instant.</p>;
  }

  return (
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
          {users.map((user) => (
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
              <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{user.total_xp}</td>
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
  );
}
