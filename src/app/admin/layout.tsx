import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { isAdminRole } from '@/lib/roleRouting';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase.from('profiles').select('role, first_name').eq('id', user.id).single();

  if (!profile || !isAdminRole(profile.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar adminName={profile.first_name} role={profile.role} />
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0">{children}</div>
    </div>
  );
}
