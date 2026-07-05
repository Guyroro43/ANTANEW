import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuizQuestions } from '@/lib/anthropic';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux admins.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = body?.lessonId as string | undefined;
  const count = Math.min(Math.max(Number(body?.count) || 5, 1), 10);

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId manquant.' }, { status: 400 });
  }

  const { data: lesson } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
  if (!lesson) {
    return NextResponse.json({ error: 'Leçon introuvable.' }, { status: 404 });
  }

  const { data: moduleRow } = await supabase.from('modules').select('title').eq('id', lesson.module_id).single();

  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('order_index')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: false })
    .limit(1);

  let nextOrderIndex = (existingQuestions?.[0]?.order_index ?? -1) + 1;

  let generated;
  try {
    generated = await generateQuizQuestions({
      moduleTitle: moduleRow?.title ?? '',
      lessonTitle: lesson.title,
      lessonDescription: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      count,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Échec de la génération IA.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const rows = generated.map((question) => ({
    lesson_id: lessonId,
    question_text: question.question_text,
    options: question.options,
    correct_index: question.correct_index,
    explanation: question.explanation,
    order_index: nextOrderIndex++,
    status: 'draft' as const,
    source: 'ai' as const,
  }));

  const { error } = await supabase.from('questions').insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: rows.length });
}
