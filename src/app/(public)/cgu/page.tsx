import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">CGU</p>
        <h1 className="mt-3 text-4xl font-black">Conditions générales d’utilisation</h1>
        <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
          En utilisant ANTA, vous acceptez de respecter nos règles d’usage, de protéger vos informations de connexion et de ne pas utiliser la plateforme de façon abusive ou frauduleuse.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
