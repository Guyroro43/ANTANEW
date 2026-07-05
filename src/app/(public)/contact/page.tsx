import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Contact</p>
        <h1 className="mt-3 text-4xl font-black">Discutons de votre projet</h1>
        <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
          Vous avez une question, un besoin ou une idée ? Écrivez-nous et nous vous répondrons très rapidement.
        </p>
        <div className="mt-8 space-y-4">
          <input className="w-full rounded-full border border-slate-300 px-4 py-3 outline-none focus:border-red-500 dark:border-slate-700 dark:bg-slate-800" placeholder="Nom complet" />
          <input className="w-full rounded-full border border-slate-300 px-4 py-3 outline-none focus:border-red-500 dark:border-slate-700 dark:bg-slate-800" placeholder="Email" />
          <textarea className="min-h-[140px] w-full rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none focus:border-red-500 dark:border-slate-700 dark:bg-slate-800" placeholder="Votre message" />
          <button className="rounded-full bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700">Envoyer</button>
        </div>
        <Link href="/" className="mt-8 inline-flex rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-red-500 hover:text-red-700 dark:border-slate-600 dark:text-slate-200">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
