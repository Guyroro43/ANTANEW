'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-900';

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/parametres`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <p className="font-semibold">Email envoyé !</p>
        <p className="mt-2">Consulte ta boîte mail pour réinitialiser ton mot de passe.</p>
        <Link href="/connexion" className="mt-3 inline-block font-semibold text-red-600 hover:underline dark:text-green-400">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Adresse e-mail
        </label>
        <input id="email" name="email" type="email" placeholder="toi@exemple.com" required className={inputClass} />
      </div>

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
        {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
      </button>
    </form>
  );
}
