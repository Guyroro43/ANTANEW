import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';

const roles = [
  {
    icon: icons.code,
    title: 'Porteur de projet & Dev Full-Stack',
    skills: 'Next.js, Supabase, PostgreSQL, déploiement Vercel',
  },
  {
    icon: icons.book,
    title: "Professeurs d'anglais de renom",
    skills: "Expertise académique confirmée et sens aigu de la psychologie de l'apprenant",
  },
  {
    icon: icons.palette,
    title: 'Designer UI/UX',
    skills: 'Figma, identité visuelle mobile',
  },
  {
    icon: icons.megaphone,
    title: 'Responsable marketing digital',
    skills: 'Meta Ads, TikTok, community management',
  },
];

export function Team() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">
            L&apos;équipe
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl dark:text-white">
            Conçu par des professeurs de renom, hautement qualifiés.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-300">
            Nos enseignants allient expertise académique et finesse psychologique — une capacité rare à anticiper les besoins réels de chaque apprenant, pour un accompagnement qui s&apos;adapte vraiment à toi.
          </p>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((role, index) => (
          <Reveal key={role.title} delay={index * 0.1}>
            <div className="h-full rounded-[1.5rem] border border-red-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-6 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-green-900/60 dark:text-green-300">
                <Icon icon={role.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{role.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{role.skills}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
