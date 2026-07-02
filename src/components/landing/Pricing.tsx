const plans = [
  {
    name: 'Starter',
    price: '0',
    description: 'Pour commencer à apprendre sans pression.',
    features: ['Accès gratuit permanent', 'Leçons de base', 'Suivi de progression'],
    highlight: false,
  },
  {
    name: 'Premium',
    price: '5 000 FCFA',
    description: 'Le meilleur accès pour progresser plus vite.',
    features: ['Toutes les leçons', 'Modules premium', 'Badges et challenges', 'Paiement mobile local'],
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Tarifs</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl dark:text-white">
          Un accès accessible, avec un plan premium pensé pour les réalités locales.
        </h2>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[2rem] border p-8 shadow-sm ${plan.highlight ? 'border-green-500 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'}`}
          >
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${plan.highlight ? 'text-yellow-300' : 'text-red-600 dark:text-yellow-400'}`}>
              {plan.name}
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.name === 'Premium' ? <span className="pb-1 text-sm opacity-80">/ mois</span> : null}
            </div>
            <p className={`mt-4 text-sm leading-7 ${plan.highlight ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
              {plan.description}
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${plan.highlight ? 'bg-green-500/20 text-green-300' : 'bg-red-100 text-red-700 dark:bg-slate-800 dark:text-yellow-400'}`}>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
