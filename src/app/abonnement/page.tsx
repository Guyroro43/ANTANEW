import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/utils/format';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_expires_at')
    .eq('id', user.id)
    .single();

  const isPremium = profile?.subscription_plan === 'premium';
  const expiresAt = profile?.subscription_expires_at;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <Reveal>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
              <Icon icon={icons.crown} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Abonnement</p>
              <h1 className="text-4xl font-black">{isPremium ? 'Ton abonnement Premium' : 'Passe à Premium'}</h1>
            </div>
          </div>

          {isPremium ? (
            <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
              Tu profites de tous les modules premium.
              {expiresAt ? (
                <> Ton abonnement est valide jusqu&apos;au <span className="font-semibold">{formatDate(expiresAt)}</span>.</>
              ) : (
                ' Ton abonnement est actif.'
              )}
            </p>
          ) : (
            <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
              Accède à tous les modules premium et débloque un apprentissage plus complet avec des contenus avancés.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {!isPremium && (
              <span
                title="Le paiement Mobile Money (CinetPay) arrive bientôt"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-red-600/60 px-5 py-3 font-semibold text-white"
              >
                <Icon icon={icons.creditCard} className="h-4 w-4" />
                Choisir Premium — bientôt disponible
              </span>
            )}
            <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
              Retour au dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
