import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/apiAuth';
import { getOrGenerateProgressSummary } from '@/lib/progressSummary';

export async function GET(request: Request) {
  const { supabase, user } = await getAuthenticatedClient(request);

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, level')
    .eq('id', user.id)
    .single();
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .maybeSingle();

  const summary = await getOrGenerateProgressSummary(supabase, {
    userId: user.id,
    firstName: profile?.first_name ?? 'Apprenant',
    level: profile?.level ?? 'Lionceau',
    currentStreak: streak?.current_streak ?? 0,
  });

  return NextResponse.json({ summary });
}
