import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const [{ data: profile }, { data: modules }] = await Promise.all([
    supabase.from('profiles').select('subscription_plan').eq('id', user.id).single(),
    supabase.from('modules').select('*').eq('is_published', true).order('order_index', { ascending: true }),
  ]);

  const isPremiumUser = profile?.subscription_plan === 'premium';

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Modules</p>
            <h1 className="mt-3 text-4xl font-black">Choisis un parcours</h1>
          </div>
          <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
            Retour au dashboard
          </Link>
        </div>

        {!modules || modules.length === 0 ? (
          <p className="mt-8 text-slate-600 dark:text-slate-300">Aucun module disponible pour l&apos;instant.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {modules.map((module) => {
              const locked = module.is_premium && !isPremiumUser;
              const card = (
                <div
                  className={`h-full rounded-[1.5rem] border p-6 shadow-sm transition ${
                    locked
                      ? 'border-slate-200 bg-slate-100 opacity-70 dark:border-slate-700 dark:bg-slate-800/60'
                      : 'border-red-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 hover:border-red-400 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{module.title}</h2>
                    <Badge variant={module.is_premium ? 'warning' : 'success'}>
                      {module.is_premium ? 'Premium' : 'Gratuit'}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {module.description ?? 'Des leçons conçues pour t’aider à progresser dans des situations réelles, utiles et motivantes.'}
                  </p>
                  {locked && (
                    <p className="mt-3 text-xs font-semibold text-red-600 dark:text-yellow-400">
                      🔒 Réservé aux membres Premium
                    </p>
                  )}
                </div>
              );

              return (
                <Link key={module.id} href={locked ? '/abonnement' : `/modules/${module.slug}`}>
                  {card}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
