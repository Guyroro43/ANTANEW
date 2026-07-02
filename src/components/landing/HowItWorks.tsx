const steps = [
  {
    icon: '1',
    title: 'Choisis un module',
    text: 'Des sujets concrets comme la vie quotidienne, le voyage, l’entrepreneuriat et les entretiens.',
  },
  {
    icon: '2',
    title: 'Apprends en 10 minutes',
    text: 'Des leçons rapides, structurées et pensées pour être suivies depuis un smartphone.',
  },
  {
    icon: '3',
    title: 'Gagne en confiance',
    text: 'Exercices, feedback instantané, XP et streaks pour garder la motivation.',
  },
  {
    icon: '4',
    title: 'Passe au niveau supérieur',
    text: 'Débloque de nouveaux défis et progresse avec des badges inspirés de l’identité africaine.',
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Comment ça marche</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl dark:text-white">
          Une expérience d’apprentissage pensée pour rester engagée au quotidien.
        </h2>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => (
          <div key={step.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-700 dark:bg-green-900/60 dark:text-green-300">
              {step.icon}
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
