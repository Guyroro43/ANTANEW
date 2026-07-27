'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { roleOptions, roleLabel } from '@/lib/roles';
import type { Profile, UserRole } from '@/types/user';

const PAGE_SIZE = 10;

type SortKey = 'date_desc' | 'date_asc' | 'role' | 'xp_desc';

const sortOptionsList: { value: SortKey; label: string }[] = [
  { value: 'date_desc', label: "Plus récent d'abord" },
  { value: 'date_asc', label: "Plus ancien d'abord" },
  { value: 'role', label: 'Par rôle' },
  { value: 'xp_desc', label: 'XP décroissant' },
];

const sortFns: Record<SortKey, (a: Profile, b: Profile) => number> = {
  date_desc: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  date_asc: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  role: (a, b) => a.role.localeCompare(b.role),
  xp_desc: (a, b) => b.total_xp - a.total_xp,
};

export function RoleManagementTable({ users }: { users: Profile[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<{ user: Profile; role: UserRole } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const confirm = async () => {
    if (!pending) return;
    setIsSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc('admin_update_profile', {
      p_user_id: pending.user.id,
      p_role: pending.role,
    });
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setPending(null);
      router.refresh();
    }
    setIsSaving(false);
  };

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
            {sortOptionsList.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {sorted.length} utilisateur{sorted.length > 1 ? 's' : ''}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun résultat pour cette recherche.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Prénom</th>
                <th className="py-2 pr-4 font-semibold">Email</th>
                <th className="py-2 pr-4 font-semibold">Rôle actuel</th>
                <th className="py-2 pr-4 font-semibold">Changer</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr key={user.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-semibold text-foreground">{user.first_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{user.email ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={user.role === 'user' ? 'default' : 'success'}>{roleLabel(user.role)}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <Select
                      value={user.role}
                      onValueChange={(value) => setPending({ user, role: value as UserRole })}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
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

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle de {pending?.user.first_name} ?</DialogTitle>
            <DialogDescription>
              Passage de « {pending ? roleLabel(pending.user.role) : ''} » à « {pending ? roleLabel(pending.role) : ''} ».
              Action immédiate et journalisée.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)} disabled={isSaving}>
              Annuler
            </Button>
            <Button onClick={confirm} disabled={isSaving}>
              {isSaving ? 'Enregistrement…' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
