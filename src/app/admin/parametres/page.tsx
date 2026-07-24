import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatDate } from '@/utils/format';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Paramètres</h1>

      <Card className="mt-8 flex flex-wrap items-center gap-4">
        <UserAvatar name={profile?.first_name ?? 'Admin'} src={profile?.avatar_url} size={56} />
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{profile?.first_name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="destructive">{profile?.role}</Badge>
            <span className="text-xs text-slate-400">
              Admin depuis le {profile ? formatDate(profile.created_at) : '—'}
            </span>
          </div>
        </div>
      </Card>

      <Card className="mt-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">Apparence</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bascule entre mode clair et sombre.</p>
        </div>
        <ThemeToggle />
      </Card>
    </main>
  );
}
