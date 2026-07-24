'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/Spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/format';
import type { Profile, UserRole, SubscriptionPlan } from '@/types/user';
import type { Transaction } from '@/types/abonnement';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'user', label: 'Apprenant' },
  { value: 'instructor', label: 'Instructeur' },
  { value: 'founder', label: 'Fondateur' },
  { value: 'founder_instructor', label: 'Fondateur-Instructeur' },
  { value: 'developer', label: 'Développeur' },
];

export default function Page() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const loadData = async () => {
    const supabase = createClient();
    const [{ data: userData }, { data: transactionsData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    setUser(userData ?? null);
    setTransactions(transactionsData ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const confirmRoleChange = async () => {
    if (!user || !pendingRole) return;
    setIsSaving(true);
    setRoleError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_profile', {
      p_user_id: user.id,
      p_role: pendingRole,
    });
    if (error) {
      setRoleError(error.message);
    } else {
      setPendingRole(null);
      await loadData();
    }
    setIsSaving(false);
  };

  const updatePlan = async (subscription_plan: SubscriptionPlan) => {
    if (!user) return;
    setIsSaving(true);
    const supabase = createClient();
    await supabase.rpc('admin_update_profile', {
      p_user_id: user.id,
      p_subscription_plan: subscription_plan,
    });
    await loadData();
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <main className="flex justify-center px-8 py-16">
        <Spinner size={32} />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="px-8 py-16 text-center">
        <p className="text-lg font-semibold">Utilisateur introuvable.</p>
        <Link href="/admin/utilisateurs" className="mt-4 inline-flex text-red-600 underline dark:text-yellow-400">
          Retour aux utilisateurs
        </Link>
      </main>
    );
  }

  return (
    <main className="px-8 py-10">
      <Link href="/admin/utilisateurs" className="text-sm font-semibold text-red-600 hover:underline dark:text-yellow-400">
        ← Retour aux utilisateurs
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <UserAvatar name={user.first_name} src={user.avatar_url} size={56} />
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user.first_name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email ?? 'Email inconnu'}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">XP total</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{user.total_xp}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Niveau</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{user.level}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Niveau d'anglais</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{user.english_level}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Inscrit le</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{formatDate(user.created_at)}</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rôle</h2>
          <div className="mt-3 flex items-center gap-3">
            <Badge variant={user.role === 'developer' ? 'destructive' : user.role === 'user' ? 'default' : 'success'}>
              {roleOptions.find((r) => r.value === user.role)?.label ?? user.role}
            </Badge>
            <Select
              disabled={isSaving}
              value={user.role}
              onValueChange={(value) => setPendingRole(value as UserRole)}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Changer le rôle" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Abonnement</h2>
          <div className="mt-3 flex items-center gap-3">
            <Badge variant={user.subscription_plan === 'premium' ? 'success' : 'default'}>
              {user.subscription_plan}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => updatePlan(user.subscription_plan === 'premium' ? 'starter' : 'premium')}
            >
              Passer en {user.subscription_plan === 'premium' ? 'Starter' : 'Premium'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transactions</h2>
        <div className="mt-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucune transaction.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-3">
                  <span>{formatDate(tx.created_at)} — {tx.payment_method ?? '—'}</span>
                  <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'destructive' : 'warning'}>
                    {tx.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={pendingRole !== null} onOpenChange={(open) => !open && setPendingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle de {user.first_name} ?</DialogTitle>
            <DialogDescription>
              {user.first_name} passera de « {roleOptions.find((r) => r.value === user.role)?.label} » à «{' '}
              {roleOptions.find((r) => r.value === pendingRole)?.label} ». Cette action est immédiate et journalisée.
            </DialogDescription>
          </DialogHeader>
          {roleError && <p className="text-sm font-medium text-destructive">{roleError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingRole(null)} disabled={isSaving}>
              Annuler
            </Button>
            <Button onClick={confirmRoleChange} disabled={isSaving}>
              {isSaving ? 'Enregistrement…' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
