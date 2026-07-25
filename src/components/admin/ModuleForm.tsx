'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FieldInput } from '@/components/ui/field-input';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/button';
import { Icon, icons } from '@/components/ui/Icon';
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
  const [isUploading, setIsUploading] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [brief, setBrief] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDraft = async () => {
    if (!brief.trim()) {
      setError('Décris en quelques mots le module que tu veux créer.');
      return;
    }
    setIsDrafting(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/content/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'module', brief }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Échec de la génération.');
      setValues((prev) => ({ ...prev, title: data.title, slug: data.slug, description: data.description }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la génération.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `modules/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('lesson-media').upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('lesson-media').getPublicUrl(path);
      setValues((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

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
      <div className="rounded-xl border border-dashed border-red-300 bg-red-50/50 p-4 dark:border-yellow-700 dark:bg-yellow-950/20">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Assistant IA — décris le module en quelques mots
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Ex : demander son chemin en ville"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <Button type="button" variant="outline" onClick={handleDraft} disabled={isDrafting}>
            <Icon icon={icons.sparkles} className="h-4 w-4" />
            {isDrafting ? 'Génération…' : 'Générer avec l’IA'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Remplit titre, slug et description ci-dessous — relis et ajuste avant d&apos;enregistrer.
        </p>
      </div>
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
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Image de couverture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isUploading}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700 dark:text-slate-300"
        />
        {isUploading && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Envoi en cours…</p>}
        {values.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.image_url}
            alt="Aperçu de l'image du module"
            className="mt-3 h-32 w-full rounded-lg object-cover"
          />
        )}
        <FieldInput
          label="Ou colle une URL externe"
          className="mt-3"
          value={values.image_url}
          onChange={(e) => setValues({ ...values, image_url: e.target.value })}
          placeholder="https://…"
        />
      </div>
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
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
