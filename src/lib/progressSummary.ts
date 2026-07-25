import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { summarizeProgress } from '@/lib/gemini';

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
export const MIN_COMPLETED_LESSONS = 3;

export interface CategoryStat {
  category: string;
  avgScore: number;
  lessonsCompleted: number;
}

export async function getCategoryStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ completedCount: number; categoryStats: CategoryStat[] }> {
  const { data: rows } = await supabase
    .from('progress')
    .select('score, lessons(category)')
    .eq('user_id', userId)
    .eq('completed', true);

  const completedCount = rows?.length ?? 0;

  const statsByCategory = new Map<string, { total: number; count: number }>();
  for (const row of rows ?? []) {
    const lessonRelation = row.lessons as unknown as { category: string | null } | { category: string | null }[] | null;
    const category = (Array.isArray(lessonRelation) ? lessonRelation[0]?.category : lessonRelation?.category) ?? 'Général';
    const entry = statsByCategory.get(category) ?? { total: 0, count: 0 };
    entry.total += row.score ?? 0;
    entry.count += 1;
    statsByCategory.set(category, entry);
  }

  const categoryStats = Array.from(statsByCategory.entries()).map(([category, { total, count }]) => ({
    category,
    avgScore: Math.round((total / count) * 10) / 10,
    lessonsCompleted: count,
  }));

  return { completedCount, categoryStats };
}

interface ProgressSummaryParams {
  userId: string;
  firstName: string;
  level: string;
  currentStreak: number;
}

export async function getOrGenerateProgressSummary(
  supabase: SupabaseClient<Database>,
  { userId, firstName, level, currentStreak }: ProgressSummaryParams,
): Promise<string | null> {
  const [{ data: profile }, { data: latestProgress }] = await Promise.all([
    supabase.from('profiles').select('progress_summary, progress_summary_generated_at').eq('id', userId).single(),
    supabase
      .from('progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const generatedAt = profile?.progress_summary_generated_at ? new Date(profile.progress_summary_generated_at).getTime() : 0;
  const isFresh = Boolean(profile?.progress_summary) && Date.now() - generatedAt < STALE_AFTER_MS;
  const generatedAfterLatestLesson = latestProgress?.completed_at
    ? generatedAt >= new Date(latestProgress.completed_at).getTime()
    : true;

  if (isFresh && generatedAfterLatestLesson) {
    return profile!.progress_summary;
  }

  const { completedCount, categoryStats } = await getCategoryStats(supabase, userId);
  if (completedCount < MIN_COMPLETED_LESSONS) {
    return null;
  }

  let summary: string;
  try {
    summary = await summarizeProgress({ firstName, level, completedLessonsCount: completedCount, currentStreak, categoryStats });
  } catch {
    return profile?.progress_summary ?? null;
  }

  if (!summary) {
    return profile?.progress_summary ?? null;
  }

  await supabase
    .from('profiles')
    .update({ progress_summary: summary, progress_summary_generated_at: new Date().toISOString() })
    .eq('id', userId);

  return summary;
}
