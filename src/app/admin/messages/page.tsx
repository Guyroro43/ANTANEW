import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MessagesPanel } from '@/components/admin/MessagesPanel';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single();

  const { data: initialMessages } = await supabase
    .from('messages')
    .select('id, author_id, content, created_at, author:profiles!messages_author_id_fkey(first_name, role)')
    .order('created_at', { ascending: true })
    .limit(200);

  return (
    <main className="flex h-screen flex-col px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Équipe</p>
      <h1 className="mt-2 text-3xl font-black text-foreground">Messagerie interne</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Canal partagé entre instructeurs, fondateurs et développeurs — les messages disparaissent après 24h.
      </p>
      <div className="mt-6 min-h-0 flex-1">
        <MessagesPanel
          currentUserId={user.id}
          currentUserName={profile?.first_name ?? 'Toi'}
          initialMessages={initialMessages ?? []}
        />
      </div>
    </main>
  );
}
