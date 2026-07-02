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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(244,180,32,0.25),_transparent_32%),linear-gradient(135deg,_#fffdf6_0%,_#fef3c7_100%)] text-slate-900">
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ModulesSlider />
      <Pricing />
      <Testimonials />
      <CtaFinal />

      <footer className="border-t border-amber-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-900">ANTA</p>
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
