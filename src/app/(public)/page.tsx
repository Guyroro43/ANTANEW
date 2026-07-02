import Link from 'next/link';
import { Hero } from '../../components/landing/Hero';
import { StatsBar } from '../../components/landing/StatsBar';
import { HowItWorks } from '../../components/landing/HowItWorks';
import { ModulesSlider } from '../../components/landing/ModulesSlider';
import { Pricing } from '../../components/landing/Pricing';
import { Testimonials } from '../../components/landing/Testimonials';
import { CtaFinal } from '../../components/landing/CtaFinal';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.22),_transparent_24%),linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.24),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.24),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ModulesSlider />
      <Pricing />
      <Testimonials />
      <CtaFinal />

      <footer className="border-t border-red-200/70 bg-white/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8 dark:text-slate-300">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">ANTA</p>
            <p className="mt-1">African Native Tongue Academy</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/a-propos" className="transition hover:text-amber-600">
              À propos
            </Link>
            <Link href="/contact" className="transition hover:text-amber-600">
              Contact
            </Link>
            <Link href="/cgu" className="transition hover:text-amber-600">
              CGU
            </Link>
            <Link href="/confidentialite" className="transition hover:text-amber-600">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
