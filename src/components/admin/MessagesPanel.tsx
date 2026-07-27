'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { roleLabel } from '@/lib/roles';
import { cn } from '@/lib/utils';

interface AuthorInfo {
  first_name: string;
  role: string;
}

interface MessageRow {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: AuthorInfo | AuthorInfo[] | null;
}

interface MessagesPanelProps {
  currentUserId: string;
  currentUserName: string;
  initialMessages: MessageRow[];
}

function getAuthor(row: MessageRow): AuthorInfo | null {
  if (!row.author) return null;
  return Array.isArray(row.author) ? (row.author[0] ?? null) : row.author;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const EXPIRY_MS = 24 * 60 * 60 * 1000;

export function MessagesPanel({ currentUserId, currentUserName, initialMessages }: MessagesPanelProps) {
  const [messages, setMessages] = useState<MessageRow[]>(
    initialMessages.filter((m) => Date.now() - new Date(m.created_at).getTime() < EXPIRY_MS),
  );
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('admin-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const row = payload.new as { id: string; author_id: string; content: string; created_at: string };
        const { data: author } = await supabase
          .from('profiles')
          .select('first_name, role')
          .eq('id', row.author_id)
          .single();
        setMessages((prev) => [...prev, { ...row, author }]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        const oldRow = payload.old as { id: string };
        setMessages((prev) => prev.filter((m) => m.id !== oldRow.id));
      })
      .subscribe();

    // Purge côté client toutes les minutes pour cacher les messages expirés
    // sans attendre un rechargement de page.
    const interval = setInterval(() => {
      setMessages((prev) => prev.filter((m) => Date.now() - new Date(m.created_at).getTime() < EXPIRY_MS));
    }, 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from('messages').insert({ author_id: currentUserId, content: trimmed });
      if (insertError) throw new Error(insertError.message);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from('messages').delete().eq('id', id);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun message dans les dernières 24h.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const author = getAuthor(message);
              const isMine = message.author_id === currentUserId;
              return (
                <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'group relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                      isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                    )}
                  >
                    {!isMine && (
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-bold">{author?.first_name ?? currentUserName}</span>
                        {author?.role && (
                          <Badge variant={author.role === 'user' ? 'default' : 'success'} className="text-[10px]">
                            {roleLabel(author.role)}
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className={cn('text-[10px]', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        {formatTime(message.created_at)}
                      </span>
                      {isMine && (
                        <button
                          type="button"
                          onClick={() => handleDelete(message.id)}
                          aria-label="Supprimer ce message"
                          className="opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire à l'équipe…"
          disabled={isSending}
          className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" size="icon" disabled={isSending || !content.trim()} aria-label="Envoyer">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
