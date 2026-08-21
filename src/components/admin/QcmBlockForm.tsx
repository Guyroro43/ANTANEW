'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { FieldInput } from '@/components/ui/field-input';
import { Button } from '@/components/ui/button';
import { Icon, icons } from '@/components/ui/Icon';
import type { LessonBlockInsert, LessonBlock, QcmBlockContent } from '@/types/module';

interface QcmBlockFormProps {
  initialValue?: LessonBlock;
  onSubmit: (values: Omit<LessonBlockInsert, 'lesson_id'>) => Promise<void>;
  onCancel: () => void;
}

function getInitialContent(block?: LessonBlock): QcmBlockContent {
  const content = (block?.content ?? {}) as Partial<QcmBlockContent>;
  return {
    question_text: content.question_text ?? '',
    options: Array.isArray(content.options) && content.options.length > 0 ? content.options : ['', ''],
    correct_index: content.correct_index ?? 0,
    explanation: content.explanation ?? '',
  };
}

export function QcmBlockForm({ initialValue, onSubmit, onCancel }: QcmBlockFormProps) {
  const initial = getInitialContent(initialValue);
  const [questionText, setQuestionText] = useState(initial.question_text);
  const [options, setOptions] = useState<string[]>(initial.options);
  const [correctIndex, setCorrectIndex] = useState(initial.correct_index);
  const [explanation, setExplanation] = useState(initial.explanation ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((option, i) => (i === index ? value : option)));
  };

  const addOption = () => setOptions((prev) => [...prev, '']);

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectIndex((prev) => (prev >= index ? Math.max(0, prev - 1) : prev));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedOptions = options.map((option) => option.trim());
    if (!questionText.trim()) {
      setError('La question est obligatoire.');
      return;
    }
    if (trimmedOptions.some((option) => !option) || trimmedOptions.length < 2) {
      setError('Il faut au moins 2 options non vides.');
      return;
    }

    setIsSubmitting(true);
    try {
      const content: QcmBlockContent = {
        question_text: questionText.trim(),
        options: trimmedOptions,
        correct_index: correctIndex,
        ...(explanation.trim() ? { explanation: explanation.trim() } : {}),
      };
      await onSubmit({
        block_type: 'qcm',
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
      <FieldInput
        label="Question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Comment dit-on « Bonjour » en anglais ?"
      />

      <div>
        <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Options (sélectionne la bonne réponse)
        </p>
        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-option"
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index)}
                aria-label={`Marquer l'option ${index + 1} comme correcte`}
              />
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              {options.length > 2 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)} aria-label={`Supprimer l'option ${index + 1}`}>
                  <Icon icon={icons.x} className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addOption}>
          + Ajouter une option
        </Button>
      </div>

      <FieldInput
        label="Explication (optionnel)"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
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
