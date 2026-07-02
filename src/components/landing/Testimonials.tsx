const testimonials = [
  {
    quote: 'ANTA m’a aidé à gagner confiance pour mes entretiens. Les leçons sont courtes et vraiment utiles.',
    name: 'Awa, 23 ans',
    role: 'Étudiante à Abidjan',
  },
  {
    quote: 'J’aime le fait que les exemples soient proches de ma réalité. C’est beaucoup plus motivant.',
    name: 'Koffi, 27 ans',
    role: 'Jeune professionnel',
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">Témoignages</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
          Ce que disent les premiers apprenants ANTA.
        </h2>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {testimonials.map((item) => (
          <div key={item.name} className="rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-lg leading-8 text-slate-700">“{item.quote}”</p>
            <div className="mt-6">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
