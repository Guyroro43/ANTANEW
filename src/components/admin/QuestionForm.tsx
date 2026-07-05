'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { QuestionInsert, Question } from '@/types/module';

interface QuestionFormProps {
  initialValue?: Question;
  onSubmit: (values: Omit<QuestionInsert, 'lesson_id'>) => Promise<void>;
  onCancel: () => void;
}

function getInitialOptions(question?: Question): string[] {
  if (Array.isArray(question?.options) && question.options.length > 0) {
    return question.options.map((option) => String(option));
  }
  return ['', ''];
}

export function QuestionForm({ initialValue, onSubmit, onCancel }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState(initialValue?.question_text ?? '');
  const [options, setOptions] = useState<string[]>(getInitialOptions(initialValue));
  const [correctIndex, setCorrectIndex] = useState(initialValue?.correct_index ?? 0);
  const [explanation, setExplanation] = useState(initialValue?.explanation ?? '');
  const [orderIndex, setOrderIndex] = useState(initialValue?.order_index ?? 0);
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
      await onSubmit({
        question_text: questionText.trim(),
        options: trimmedOptions,
        correct_index: correctIndex,
        explanation: explanation || null,
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
      <Input
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
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)}>
                  ✕
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addOption}>
          + Ajouter une option
        </Button>
      </div>

      <Input
        label="Explication (optionnel)"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
      />
      <Input
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
