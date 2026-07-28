'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserOption {
  id: string;
  first_name: string;
  email: string | null;
}

interface HistoryRow {
  id: string;
  title: string;
  body: string;
  target: 'all' | 'selected' | 'plan';
  target_plan?: 'starter' | 'premium' | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface NotificationsComposerProps {
  users: UserOption[];
  initialHistory: HistoryRow[];
}

export function NotificationsComposer({ users, initialHistory }: NotificationsComposerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'selected'>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>(initialHistory);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) => u.first_name.toLowerCase().includes(query) || (u.email ?? '').toLowerCase().includes(query),
    );
  }, [users, search]);

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSend = title.trim().length > 0 && body.trim().length > 0 && (target === 'all' || selectedIds.size > 0);

  const handleSend = async () => {
    setIsSending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          target,
          userIds: target === 'selected' ? Array.from(selectedIds) : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Échec de l'envoi.");

      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          body: body.trim(),
          target,
          recipient_count: data.recipientCount,
          sent_count: data.sentCount,
          failed_count: data.failedCount,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setTitle('');
      setBody('');
      setSelectedIds(new Set());
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Titre</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nouvelle leçon disponible !" maxLength={100} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Message</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Va jeter un œil au module « Anglais professionnel »…"
            maxLength={500}
            rows={4}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Destinataires</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget('all')}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                target === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
              }`}
            >
              Tous les utilisateurs
            </button>
            <button
              type="button"
              onClick={() => setTarget('selected')}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                target === 'selected' ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
              }`}
            >
              Sélection ({selectedIds.size})
            </button>
          </div>
        </div>

        {target === 'selected' && (
          <div className="flex flex-col gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un nom ou un email…" />
            <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
              {filteredUsers.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Aucun résultat.</p>
              ) : (
                filteredUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="font-medium text-foreground">{u.first_name}</span>
                    <span className="text-muted-foreground">{u.email ?? '—'}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button onClick={() => setConfirmOpen(true)} disabled={!canSend || isSending}>
          Envoyer
        </Button>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-black text-slate-900 dark:text-white">Historique des envois</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun envoi pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((h) => (
              <div key={h.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground">{h.title}</p>
                  <Badge variant={h.target === 'all' ? 'default' : h.target === 'plan' ? 'warning' : 'success'}>
                    {h.target === 'all'
                      ? 'Tous'
                      : h.target === 'plan'
                        ? h.target_plan === 'premium'
                          ? 'Premium'
                          : 'Gratuit'
                        : 'Sélection'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {h.recipient_count} destinataire{h.recipient_count > 1 ? 's' : ''} — {h.sent_count} envoyée
                  {h.sent_count > 1 ? 's' : ''}
                  {h.failed_count > 0 ? ` — ${h.failed_count} échec(s)` : ''} —{' '}
                  {new Date(h.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l&apos;envoi ?</DialogTitle>
            <DialogDescription>
              {target === 'all'
                ? 'Cette notification sera envoyée à TOUS les utilisateurs ayant activé les notifications. Action immédiate et irréversible.'
                : `Cette notification sera envoyée à ${selectedIds.size} utilisateur(s) sélectionné(s).`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSending}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? 'Envoi…' : 'Confirmer et envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
