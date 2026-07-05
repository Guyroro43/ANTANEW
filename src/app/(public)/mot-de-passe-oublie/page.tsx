import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.24),_transparent_28%),linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] text-slate-900 transition-colors dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-red-200 bg-white shadow-sm">
            <Image src="/logo.jpeg" alt="Logo ANTA" fill className="object-cover object-top" />
          </div>
          <span className="text-lg font-black tracking-wide text-slate-900 dark:text-white">ANTA</span>
        </Link>
        <ThemeToggle />
      </nav>

      <div className="mx-auto flex max-w-md flex-col px-6 py-10 lg:px-8">
        <div className="rounded-2xl border border-amber-200 bg-white/80 p-8 shadow-xl shadow-amber-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Mot de passe oublié</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Réinitialiser ton mot de passe</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Saisis ton adresse email pour recevoir un lien de réinitialisation.
          </p>

          <ForgotPasswordForm />

          <Link href="/connexion" className="mt-6 inline-flex text-sm font-semibold text-red-600 hover:underline dark:text-green-400">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
