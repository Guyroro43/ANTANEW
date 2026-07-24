import { Header } from '../../components/landing/Header';
import { Hero } from '../../components/landing/Hero';
import { StatsBar } from '../../components/landing/StatsBar';
import { HowItWorks } from '../../components/landing/HowItWorks';
import { ModulesSlider } from '../../components/landing/ModulesSlider';
import { Team } from '../../components/landing/Team';
import { Testimonials } from '../../components/landing/Testimonials';
import { Challenge } from '../../components/landing/Challenge';
import { CtaFinal } from '../../components/landing/CtaFinal';
import { Footer } from '../../components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.22),_transparent_24%),linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.24),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.24),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <Header />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ModulesSlider />
      <Team />
      <Testimonials />
      <Challenge />
      <CtaFinal />
      <Footer />
    </main>
  );
}
