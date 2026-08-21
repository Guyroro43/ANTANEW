import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SignInForm } from '@/components/auth/SignInForm';
import { Icon, icons } from '@/components/ui/Icon';

const trustBadges = [
  { icon: icons.lock, label: 'Sécurisé' },
  { icon: icons.trophy, label: "Tes badges t'attendent" },
  { icon: icons.flame, label: 'Reprends ton streak' },
];

export default function ConnexionPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.24),_transparent_28%),linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] text-slate-900 transition-colors dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-red-200 bg-white shadow-sm">
            <Image src="/logo.jpeg" alt="Logo ANTA" fill className="object-cover object-top" />
          </div>
          <span className="text-lg font-black tracking-wide text-slate-900 dark:text-white">ANTA</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/inscription" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
            Créer un compte
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="mx-auto flex max-w-md flex-col px-6 py-10 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-2xl bg-slate-900 p-5 dark:bg-slate-800">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Bon retour</p>
          <h2 className="mt-1 text-xl font-black text-white">
            Bienvenue dans ton espace <span className="italic text-amber-400">apprenant.</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Retrouve ta progression, tes badges et tes leçons.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white/80 p-8 shadow-xl shadow-amber-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Connexion</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Aucun mot de passe à retenir si tu utilises Google.
          </p>

          <Suspense fallback={<p className="mt-6 text-sm text-slate-500">Chargement...</p>}>
            <SignInForm />
          </Suspense>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {trustBadges.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-green-800">
              <Icon icon={item.icon} className="h-3.5 w-3.5" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
