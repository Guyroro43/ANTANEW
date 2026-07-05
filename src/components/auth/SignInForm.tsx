'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GoogleButton } from './GoogleButton';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-900';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const authError = searchParams.get('error');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === 'auth' ? 'La connexion a échoué. Réessaie.' : null,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GoogleButton />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">ou avec ton email</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Adresse e-mail
          </label>
          <input id="email" name="email" type="email" placeholder="toi@exemple.com" required className={inputClass} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mot de passe
            </label>
            <Link href="/mot-de-passe-oublie" className="text-xs font-semibold text-red-600 hover:underline dark:text-green-400">
              Mot de passe oublié ?
            </Link>
          </div>
          <input id="password" name="password" type="password" placeholder="••••••••" required className={inputClass} />
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
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </>
  );
}
