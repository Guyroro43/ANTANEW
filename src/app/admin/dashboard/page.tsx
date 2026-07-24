import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getHomePathForRole } from '@/lib/roleRouting';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/connexion');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  redirect(getHomePathForRole(profile?.role ?? 'user'));
}
