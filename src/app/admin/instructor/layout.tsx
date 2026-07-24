import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const allowed = profile && ['instructor', 'founder_instructor', 'developer'].includes(profile.role);
  if (!allowed) redirect('/dashboard');

  return children;
}
