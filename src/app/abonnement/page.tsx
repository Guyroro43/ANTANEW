import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/utils/format';

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
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Abonnement</p>
        <h1 className="mt-3 text-4xl font-black">{isPremium ? 'Ton abonnement Premium' : 'Passe à Premium'}</h1>

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
              className="cursor-not-allowed rounded-full bg-red-600/60 px-5 py-3 font-semibold text-white"
            >
              Choisir Premium — bientôt disponible
            </span>
          )}
          <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
            Retour au dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
