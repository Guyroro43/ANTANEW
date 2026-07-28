'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FieldInput } from '@/components/ui/field-input';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/button';
import { Icon, icons } from '@/components/ui/Icon';
import type { LessonInsert, Lesson } from '@/types/module';

interface LessonFormProps {
  initialValue?: Lesson;
  moduleTitle: string;
  onSubmit: (values: Omit<LessonInsert, 'module_id'>) => Promise<void>;
  onCancel: () => void;
}

const difficulties = ['debutant', 'intermediaire', 'avance'] as const;

const contentTypes = [
  { value: 'qcm', label: 'Interactif (généré depuis un PDF)' },
  { value: 'video', label: 'Vidéo' },
  { value: 'audio', label: 'Audio' },
] as const;

const accessLevels = [
  { value: 'free', label: 'Gratuit' },
  { value: 'premium', label: 'Premium' },
  { value: 'all', label: 'Tout le monde' },
] as const;

export function LessonForm({ initialValue, moduleTitle, onSubmit, onCancel }: LessonFormProps) {
  const [brief, setBrief] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [values, setValues] = useState({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    category: initialValue?.category ?? '',
    difficulty: initialValue?.difficulty ?? 'debutant',
    order_index: initialValue?.order_index ?? 0,
    is_published: initialValue?.is_published ?? false,
    content_type: initialValue?.content_type ?? 'qcm',
    content_url: initialValue?.content_url ?? '',
    source_pdf_path: initialValue?.source_pdf_path ?? '',
    image_url: initialValue?.image_url ?? '',
    access_level: initialValue?.access_level ?? 'free',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDraft = async () => {
    if (!brief.trim()) {
      setError('Décris en quelques mots la leçon que tu veux créer.');
      return;
    }
    setIsDrafting(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/content/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lesson', brief, moduleTitle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Échec de la génération.');
      setValues((prev) => ({ ...prev, title: data.title, description: data.description, category: data.category }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la génération.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `${values.content_type}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('lesson-media').upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      setValues((prev) => ({ ...prev, content_url: path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload du fichier.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('lesson-source').upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      setValues((prev) => ({ ...prev, source_pdf_path: path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload du PDF.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `lessons/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('lesson-media').upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('lesson-media').getPublicUrl(path);
      setValues((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload de l'image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }

    if (values.content_type !== 'qcm' && !values.content_url.trim()) {
      setError('Ajoute un fichier ou une URL pour ce type de contenu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description || null,
        category: values.category || null,
        difficulty: values.difficulty,
        order_index: values.order_index,
        is_published: values.is_published,
        content_type: values.content_type,
        content_url: values.content_url || null,
        source_pdf_path: values.source_pdf_path || null,
        image_url: values.image_url || null,
        access_level: values.access_level,
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
          Assistant IA — décris la leçon en quelques mots
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Ex : commander à manger au restaurant"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <Button type="button" variant="outline" onClick={handleDraft} disabled={isDrafting}>
            <Icon icon={icons.sparkles} className="h-4 w-4" />
            {isDrafting ? 'Génération…' : 'Générer avec l’IA'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Remplit titre, description et catégorie ci-dessous — relis et ajuste avant d&apos;enregistrer.
        </p>
      </div>
      <FieldInput
        label="Titre"
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        placeholder="Se présenter en anglais"
      />
      <FieldInput
        label="Description"
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
      />
      <FieldInput
        label="Catégorie"
        value={values.category}
        onChange={(e) => setValues({ ...values, category: e.target.value })}
        placeholder="Vocabulaire, grammaire…"
      />

      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Image de couverture (optionnel)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isUploadingImage}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700 dark:text-slate-300"
        />
        {isUploadingImage && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Envoi en cours…</p>}
        {values.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.image_url}
            alt="Aperçu de l'image de la leçon"
            className="mt-3 h-28 w-full rounded-lg object-cover"
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
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Difficulté</label>
          <select
            value={values.difficulty}
            onChange={(e) => setValues({ ...values, difficulty: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
        <FieldInput
          label="Ordre d'affichage"
          type="number"
          min={0}
          value={values.order_index}
          onChange={(e) => setValues({ ...values, order_index: Number(e.target.value) })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Type de contenu</label>
          <select
            value={values.content_type}
            onChange={(e) => setValues({ ...values, content_type: e.target.value as (typeof contentTypes)[number]['value'] })}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Accès</label>
          <select
            value={values.access_level}
            onChange={(e) => setValues({ ...values, access_level: e.target.value as (typeof accessLevels)[number]['value'] })}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {accessLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {values.content_type !== 'qcm' && (
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Fichier {values.content_type === 'video' ? 'vidéo' : 'audio'}
          </label>
          <input
            type="file"
            accept={values.content_type === 'video' ? 'video/*' : 'audio/*'}
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700 dark:text-slate-300"
          />
          {isUploading && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Envoi en cours…</p>}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Stocké de façon privée : lu en interne par l&apos;app via une URL signée temporaire, jamais téléchargeable directement.
          </p>
          <FieldInput
            label="Ou colle une URL externe (optionnel — inutile si tu as déjà importé un fichier ci-dessus)"
            className="mt-3"
            value={values.content_url}
            onChange={(e) => setValues({ ...values, content_url: e.target.value })}
            placeholder="https://…"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Taille maximale par fichier : 50 Mo (limite du palier gratuit Supabase). Au-delà, utilise une URL externe
            (YouTube non répertorié, Vimeo...) ou compresse le fichier.
          </p>
          {values.content_url && /^https?:\/\//.test(values.content_url) && (
            <a
              href={values.content_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-red-600 hover:underline dark:text-yellow-400"
            >
              Prévisualiser le fichier
            </a>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          PDF source pour génération IA (optionnel)
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePdfChange}
          disabled={isUploadingPdf}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700 dark:text-slate-300"
        />
        {isUploadingPdf && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Envoi en cours…</p>}
        {values.source_pdf_path && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            PDF associé : {values.source_pdf_path.replace(/^\d+-/, '')}. Jamais visible par les apprenants — sert uniquement à
            générer les questions d&apos;évaluation (bouton « Générer depuis le PDF » sur la page des questions de cette leçon).
          </p>
        )}
        {values.content_type !== 'qcm' && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Pour une leçon {values.content_type === 'video' ? 'vidéo' : 'audio'} : si tu fournis un PDF (ex. transcription),
            l&apos;IA générera les questions à partir de ce PDF plutôt qu&apos;en analysant directement le fichier{' '}
            {values.content_type === 'video' ? 'vidéo' : 'audio'}.
          </p>
        )}
      </div>

      <Toggle
        checked={values.is_published}
        onChange={(checked) => setValues({ ...values, is_published: checked })}
        label="Publiée"
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
