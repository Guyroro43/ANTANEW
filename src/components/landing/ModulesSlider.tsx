import Link from 'next/link';

const modules = [
  {
    title: 'Vie quotidienne',
    description: 'Apprends les expressions utiles pour les situations du quotidien et de la vie sociale.',
    tag: 'Gratuit',
    accent: 'from-emerald-500 to-lime-400',
  },
  {
    title: 'Entretien',
    description: 'Prépare-toi à décrocher un poste avec un anglais professionnel et naturel.',
    tag: 'Premium',
    accent: 'from-amber-500 to-orange-400',
  },
  {
    title: 'Voyage',
    description: 'Maîtrise les bases pour voyager, communiquer et t’ouvrir à de nouveaux horizons.',
    tag: 'Gratuit',
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    title: 'Tech & startups',
    description: 'Découvre un anglais adapté à l’innovation, au numérique et à l’entrepreneuriat.',
    tag: 'Premium',
    accent: 'from-fuchsia-500 to-purple-500',
  },
];

export function ModulesSlider() {
  return (
    <section id="modules" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Modules</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl dark:text-white">
            Des parcours qui parlent à votre réalité.
          </h2>
        </div>
        <Link href="/modules" className="font-semibold text-red-700 transition hover:text-green-700 dark:text-yellow-400">
          Voir tous les modules →
        </Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <div key={module.title} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className={`h-32 bg-gradient-to-r ${module.accent}`} />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{module.title}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {module.tag}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{module.description}</p>
              <Link href="/modules" className="mt-5 inline-flex font-semibold text-red-700 transition hover:text-green-700 dark:text-yellow-400">
                Explorer ce module →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
