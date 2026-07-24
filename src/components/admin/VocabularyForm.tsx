'use client';

import { useState, type FormEvent } from 'react';
import { FieldInput } from '@/components/ui/field-input';
import { Button } from '@/components/ui/button';
import type { VocabularyInsert, VocabularyItem } from '@/types/module';

interface VocabularyFormProps {
  initialValue?: VocabularyItem;
  onSubmit: (values: Omit<VocabularyInsert, 'lesson_id'>) => Promise<void>;
  onCancel: () => void;
}

export function VocabularyForm({ initialValue, onSubmit, onCancel }: VocabularyFormProps) {
  const [word, setWord] = useState(initialValue?.word ?? '');
  const [definition, setDefinition] = useState(initialValue?.definition ?? '');
  const [example, setExample] = useState(initialValue?.example ?? '');
  const [audioUrl, setAudioUrl] = useState(initialValue?.audio_url ?? '');
  const [orderIndex, setOrderIndex] = useState(initialValue?.order_index ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!word.trim() || !definition.trim()) {
      setError('Le mot et la définition sont obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        word: word.trim(),
        definition: definition.trim(),
        example: example || null,
        audio_url: audioUrl || null,
        order_index: orderIndex,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldInput label="Mot" value={word} onChange={(e) => setWord(e.target.value)} placeholder="Handshake" />
      <FieldInput
        label="Définition"
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
        placeholder="Poignée de main"
      />
      <FieldInput
        label="Exemple (optionnel)"
        value={example}
        onChange={(e) => setExample(e.target.value)}
        placeholder="They greeted each other with a handshake."
      />
      <FieldInput
        label="URL audio (optionnel)"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
        placeholder="https://…"
      />
      <FieldInput
        label="Ordre d'affichage"
        type="number"
        min={0}
        value={orderIndex}
        onChange={(e) => setOrderIndex(Number(e.target.value))}
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
