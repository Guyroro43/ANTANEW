import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PracticeChat } from '@/components/pratique/PracticeChat';

export default async function PratiquePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single();

  return (
    <main className="flex h-[calc(100dvh-4rem)] flex-col px-6 py-6 md:h-dvh md:px-8">
      <div className="flex-shrink-0">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-yellow-400">Entraînement</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Pratique la conversation</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Discute librement en anglais avec Kora — corrections bienveillantes, à ton rythme.
        </p>
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <PracticeChat firstName={profile?.first_name ?? 'Apprenant'} />
      </div>
    </main>
  );
}
