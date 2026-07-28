'use client';

import { useState, type FormEvent } from 'react';
import { FieldInput } from '@/components/ui/field-input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { LessonBlockInsert, LessonBlock, NotionBlockContent } from '@/types/module';

interface NotionBlockFormProps {
  initialValue?: LessonBlock;
  onSubmit: (values: Omit<LessonBlockInsert, 'lesson_id'>) => Promise<void>;
  onCancel: () => void;
}

function getInitialContent(block?: LessonBlock): NotionBlockContent {
  const content = (block?.content ?? {}) as Partial<NotionBlockContent>;
  return {
    title: content.title ?? '',
    body: content.body ?? '',
    example: content.example ?? '',
    audio_url: content.audio_url ?? '',
  };
}

export function NotionBlockForm({ initialValue, onSubmit, onCancel }: NotionBlockFormProps) {
  const initial = getInitialContent(initialValue);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [example, setExample] = useState(initial.example ?? '');
  const [audioUrl, setAudioUrl] = useState(initial.audio_url ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError('Le titre et le contenu sont obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const content: NotionBlockContent = {
        title: title.trim(),
        body: body.trim(),
        ...(example.trim() ? { example: example.trim() } : {}),
        ...(audioUrl.trim() ? { audio_url: audioUrl.trim() } : {}),
      };
      await onSubmit({
        block_type: 'notion',
        content: content as unknown as LessonBlockInsert['content'],
        status: 'approved',
        source: 'manual',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldInput label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Les salutations" />
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Contenu</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Explique la notion ici…" />
      </div>
      <FieldInput label="Exemple (optionnel)" value={example} onChange={(e) => setExample(e.target.value)} />
      <FieldInput
        label="URL audio (optionnel)"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
        placeholder="https://…"
      />

      {error ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
