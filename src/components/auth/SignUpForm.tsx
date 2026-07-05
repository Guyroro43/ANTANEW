'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GoogleButton } from './GoogleButton';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-900';

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const englishLevel = String(formData.get('englishLevel') ?? 'debutant');
    const acceptedTerms = formData.get('terms') === 'on';

    if (!firstName || !email || !password) {
      setError('Merci de remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('Tu dois accepter les conditions générales pour continuer.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            english_level: englishLevel,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <p className="font-semibold">Compte créé !</p>
        <p className="mt-2">
          Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.
        </p>
        <Link href="/connexion" className="mt-3 inline-block font-semibold text-red-600 hover:underline dark:text-green-400">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <>
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Prénom
          </label>
          <input id="firstName" name="firstName" type="text" placeholder="Ex : Aminata" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Adresse e-mail
          </label>
          <input id="email" name="email" type="email" placeholder="toi@exemple.com" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Mot de passe
          </label>
          <input id="password" name="password" type="password" placeholder="8 caractères minimum" minLength={8} required className={inputClass} />
        </div>

        <div>
          <label htmlFor="englishLevel" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Ton niveau en anglais
          </label>
          <select id="englishLevel" name="englishLevel" defaultValue="debutant" className={inputClass}>
            <option value="debutant">Débutant — je commence de zéro</option>
            <option value="intermediaire">Intermédiaire — je connais les bases</option>
            <option value="avance">Avancé — je veux perfectionner</option>
          </select>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
          <input name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-red-600" />
          <span>
            J&apos;accepte les{' '}
            <Link href="/cgu" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              conditions générales
            </Link>{' '}
            et la{' '}
            <Link href="/confidentialite" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              politique de confidentialité
            </Link>
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-red-600 py-3 font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 disabled:opacity-60 dark:bg-green-600 dark:shadow-green-600/30 dark:hover:bg-green-700"
        >
          {loading ? 'Création en cours...' : 'Créer mon compte gratuitement'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">ou</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <GoogleButton />
    </>
  );
}
