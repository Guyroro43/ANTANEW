import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LearnerSidebar } from '@/components/layout/LearnerSidebar';
import { PushNotificationRegistration } from '@/components/PushNotificationRegistration';
import { getHomePathForRole, isAdminRole } from '@/lib/roleRouting';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, placement_test_completed, notifications_enabled')
    .eq('id', user.id)
    .single();

  if (profile && isAdminRole(profile.role)) {
    redirect(getHomePathForRole(profile.role));
  }

  if (!profile?.placement_test_completed) {
    redirect('/evaluation');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <PushNotificationRegistration userId={user.id} notificationsEnabled={profile?.notifications_enabled ?? true} />
      <LearnerSidebar firstName={profile?.first_name ?? 'Apprenant'} />
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0">{children}</div>
    </div>
  );
}
