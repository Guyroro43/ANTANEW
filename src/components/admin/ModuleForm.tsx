'use client';

import { useState, type FormEvent } from 'react';
import { FieldInput } from '@/components/ui/field-input';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/button';
import type { ModuleInsert, Module } from '@/types/module';

interface ModuleFormProps {
  initialValue?: Module;
  onSubmit: (values: ModuleInsert) => Promise<void>;
  onCancel: () => void;
}

export function ModuleForm({ initialValue, onSubmit, onCancel }: ModuleFormProps) {
  const [values, setValues] = useState({
    slug: initialValue?.slug ?? '',
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    image_url: initialValue?.image_url ?? '',
    is_premium: initialValue?.is_premium ?? false,
    xp_reward: initialValue?.xp_reward ?? 50,
    order_index: initialValue?.order_index ?? 0,
    is_published: initialValue?.is_published ?? false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.slug.trim() || !values.title.trim()) {
      setError('Le slug et le titre sont obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        slug: values.slug.trim(),
        title: values.title.trim(),
        description: values.description || null,
        image_url: values.image_url || null,
        is_premium: values.is_premium,
        xp_reward: values.xp_reward,
        order_index: values.order_index,
        is_published: values.is_published,
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
        label="Slug"
        value={values.slug}
        onChange={(e) => setValues({ ...values, slug: e.target.value })}
        placeholder="salutations-premiers-contacts"
      />
      <FieldInput
        label="Titre"
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        placeholder="Salutations & Premiers contacts"
      />
      <FieldInput
        label="Description"
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
      />
      <FieldInput
        label="URL de l'image"
        value={values.image_url}
        onChange={(e) => setValues({ ...values, image_url: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <FieldInput
          label="XP à la clé"
          type="number"
          min={0}
          value={values.xp_reward}
          onChange={(e) => setValues({ ...values, xp_reward: Number(e.target.value) })}
        />
        <FieldInput
          label="Ordre d'affichage"
          type="number"
          min={0}
          value={values.order_index}
          onChange={(e) => setValues({ ...values, order_index: Number(e.target.value) })}
        />
      </div>
      <Toggle
        checked={values.is_premium}
        onChange={(checked) => setValues({ ...values, is_premium: checked })}
        label="Module premium"
      />
      <Toggle
        checked={values.is_published}
        onChange={(checked) => setValues({ ...values, is_published: checked })}
        label="Publié"
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
