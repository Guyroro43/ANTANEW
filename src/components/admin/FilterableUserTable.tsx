'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserTable } from '@/components/admin/UserTable';
import type { Profile } from '@/types/user';

type Filter = 'all' | 'active' | 'inactive' | 'premium' | 'starter';

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'inactive', label: 'Inactifs' },
  { value: 'premium', label: 'Premium' },
  { value: 'starter', label: 'Starter' },
];

export interface UserWithActivity extends Profile {
  isActive: boolean;
}

export function FilterableUserTable({ users, showEmail = true }: { users: UserWithActivity[]; showEmail?: boolean }) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return users.filter((u) => u.isActive);
      case 'inactive':
        return users.filter((u) => !u.isActive);
      case 'premium':
        return users.filter((u) => u.subscription_plan === 'premium');
      case 'starter':
        return users.filter((u) => u.subscription_plan !== 'premium');
      default:
        return users;
    }
  }, [users, filter]);

  return (
    <div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          {filters.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-4">
        <UserTable users={filtered} showEmail={showEmail} />
      </div>
    </div>
  );
}
