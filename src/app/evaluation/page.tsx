import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminRole, getHomePathForRole } from '@/lib/roleRouting';
import { PlacementTestRunner } from '@/components/evaluation/PlacementTestRunner';

export const dynamic = 'force-dynamic';

export default async function EvaluationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, placement_test_completed')
    .eq('id', user.id)
    .single();

  if (profile && isAdminRole(profile.role)) {
    redirect(getHomePathForRole(profile.role));
  }

  if (profile?.placement_test_completed) {
    redirect('/dashboard');
  }

  const { data: questions, error } = await supabase.rpc('get_placement_test');

  if (error || !questions || questions.length === 0) {
    redirect('/dashboard');
  }

  return (
    <PlacementTestRunner
      firstName={profile?.first_name ?? 'Apprenant'}
      topic={questions[0].topic}
      questions={questions.map((q) => ({
        id: q.question_id,
        text: q.question_text,
        options: (Array.isArray(q.options) ? q.options : []).map(String),
      }))}
    />
  );
}
