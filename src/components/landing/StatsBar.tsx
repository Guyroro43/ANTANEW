const stats = [
  { value: '10 min', label: 'par jour' },
  { value: '5 pays', label: 'ciblés' },
  { value: '+300 XP', label: 'à chaque module' },
  { value: '100%', label: 'mobile first' },
];

export function StatsBar() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
      <div className="grid gap-4 rounded-[2rem] border border-red-200 bg-white/80 p-6 shadow-lg shadow-red-100 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800">
            <p className="text-2xl font-black text-red-600 dark:text-yellow-400">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
