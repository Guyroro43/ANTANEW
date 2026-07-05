import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile, error } = await supabase.from('profiles').select('role, first_name').eq('id', user.id).single();

  if (error) {
    console.error(`[admin/layout] Impossible de lire profiles pour user.id=${user.id} :`, error.message);
  } else if (!profile) {
    console.error(`[admin/layout] Aucune ligne profiles trouvée pour user.id=${user.id}.`);
  } else {
    console.log(`[admin/layout] user.id=${user.id} role="${profile.role}"`);
  }

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar adminName={profile.first_name} />
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0">{children}</div>
    </div>
  );
}
