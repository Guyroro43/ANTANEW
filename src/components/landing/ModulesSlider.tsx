import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from './Reveal';

const modules = [
  {
    title: 'Vie quotidienne',
    description: 'Apprends les expressions utiles pour les situations du quotidien et de la vie sociale.',
    tag: 'Gratuit',
    image: '/modules/vie-quotidienne.jpeg',
  },
  {
    title: 'Entretien',
    description: 'Prépare-toi à décrocher un poste avec un anglais professionnel et naturel.',
    tag: 'Premium',
    image: '/modules/entretien.jpeg',
  },
  {
    title: 'Voyage',
    description: 'Maîtrise les bases pour voyager, communiquer et t’ouvrir à de nouveaux horizons.',
    tag: 'Gratuit',
    image: '/modules/voyage.jpeg',
  },
  {
    title: 'Tech & startups',
    description: 'Découvre un anglais adapté à l’innovation, au numérique et à l’entrepreneuriat.',
    tag: 'Premium',
    image: '/modules/tech.jpeg',
  },
];

export function ModulesSlider() {
  return (
    <section id="modules" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <Reveal>
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
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {modules.map((module, index) => (
          <Reveal key={module.title} delay={index * 0.1}>
            <div className="overflow-hidden rounded-[1.75rem] border border-red-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
              <div className="relative h-32">
                <Image src={module.image} alt={module.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
              </div>
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
          </Reveal>
        ))}
      </div>
    </section>
  );
}
