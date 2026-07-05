import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function InscriptionPage() {
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
          <Link href="/connexion" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
            Déjà un compte ?
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="mx-auto flex max-w-md flex-col px-6 py-10 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-2xl bg-slate-900 p-5 dark:bg-slate-800">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Bienvenue</p>
          <h2 className="mt-1 text-xl font-black text-white">
            Rejoins l&apos;espace <span className="italic text-amber-400">apprenant.</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Crée ton compte en 60 secondes. Aucune carte bancaire requise.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white/80 p-8 shadow-xl shadow-amber-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Créer mon compte</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gratuit pour toujours sur le plan Starter.
          </p>

          <SignUpForm />

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Déjà un compte ?{' '}
            <Link href="/connexion" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {['🔒 Sécurisé', '🌍 5 pays', '⚡ Gratuit pour toujours'].map((item) => (
            <span key={item} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-green-800">
              {item}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
