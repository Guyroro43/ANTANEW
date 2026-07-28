import { createClient } from '@/lib/supabase/server';
import { NotificationsComposer } from '@/components/admin/NotificationsComposer';

export default async function Page() {
  const supabase = createClient();

  const [{ data: users }, { data: history }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, email').order('first_name'),
    supabase
      .from('notification_broadcasts')
      .select('id, title, body, target, target_plan, recipient_count, sent_count, failed_count, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Notifications push</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Envoie une notification push aux apprenants (web et mobile) — à tous, ou à une sélection.
      </p>

      <NotificationsComposer users={users ?? []} initialHistory={history ?? []} />
    </main>
  );
}
