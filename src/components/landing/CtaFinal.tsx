import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

export function CtaFinal() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
      <Reveal>
        <div className="rounded-[2rem] border border-red-200 bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 p-8 text-white shadow-xl shadow-red-200 sm:p-10 dark:border-green-700 dark:shadow-green-950/40">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-100">Prêt à commencer ?</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Rejoins ANTA et apprends l’anglais en quelques minutes par jour.
            </h2>
            <p className="mt-4 text-lg leading-8 text-yellow-50">
              Inscris-toi en moins de 60 secondes et débute avec un parcours adapté à ton niveau.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/inscription" className="rounded-full bg-white px-6 py-3 text-center font-semibold text-red-700 transition hover:bg-red-50">
              Créer mon compte
            </Link>
            <Link href="/connexion" className="rounded-full border border-white/60 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10">
              J’ai déjà un compte
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
