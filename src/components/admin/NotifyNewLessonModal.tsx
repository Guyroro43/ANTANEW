'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';

interface NotifyNewLessonModalProps {
  open: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleTitle: string;
}

type Audience = 'all' | 'starter' | 'premium';

const audienceOptions: { value: Audience; label: string }[] = [
  { value: 'all', label: 'Tous les utilisateurs' },
  { value: 'starter', label: 'Gratuit uniquement' },
  { value: 'premium', label: 'Premium uniquement' },
];

export function NotifyNewLessonModal({ open, onClose, lessonTitle, moduleTitle }: NotifyNewLessonModalProps) {
  const [audience, setAudience] = useState<Audience>('all');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nouvelle leçon disponible !',
          body: `« ${lessonTitle} » vient d'être ajoutée au module ${moduleTitle}.`,
          target: audience === 'all' ? 'all' : 'plan',
          plan: audience === 'all' ? undefined : audience,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Échec de l'envoi.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setAudience('all');
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Notifier les apprenants ?">
      {sent ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Notification envoyée.</p>
          <Button onClick={handleClose}>Fermer</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            La leçon « {lessonTitle} » est maintenant publiée. Envoyer une notification push pour l&apos;annoncer ?
          </p>
          <div className="flex flex-col gap-2">
            {audienceOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                <input
                  type="radio"
                  name="audience"
                  checked={audience === option.value}
                  onChange={() => setAudience(option.value)}
                  className="h-4 w-4 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSending}>
              Ne pas notifier
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? 'Envoi…' : 'Envoyer'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
