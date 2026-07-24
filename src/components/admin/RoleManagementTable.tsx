'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Profile, UserRole } from '@/types/user';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'user', label: 'Apprenant' },
  { value: 'instructor', label: 'Instructeur' },
  { value: 'founder', label: 'Fondateur' },
  { value: 'founder_instructor', label: 'Fondateur-Instructeur' },
  { value: 'developer', label: 'Développeur' },
];

function roleLabel(role: string) {
  return roleOptions.find((r) => r.value === role)?.label ?? role;
}

export function RoleManagementTable({ users }: { users: Profile[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<{ user: Profile; role: UserRole } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          {users.map((user) => (
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
