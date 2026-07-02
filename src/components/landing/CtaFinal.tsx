import Link from 'next/link';

export function CtaFinal() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
      <div className="rounded-[2rem] border border-amber-200 bg-gradient-to-r from-amber-500 to-orange-400 p-8 text-white shadow-xl shadow-amber-200 sm:p-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">Prêt à commencer ?</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Rejoins ANTA et apprends l’anglais en quelques minutes par jour.
          </h2>
          <p className="mt-4 text-lg leading-8 text-amber-50">
            Inscris-toi en moins de 60 secondes et débute avec un parcours adapté à ton niveau.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/inscription" className="rounded-full bg-white px-6 py-3 text-center font-semibold text-amber-700 transition hover:bg-amber-50">
            Créer mon compte
          </Link>
          <Link href="/connexion" className="rounded-full border border-white/60 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10">
            J’ai déjà un compte
          </Link>
        </div>
      </div>
    </section>
  );
}
