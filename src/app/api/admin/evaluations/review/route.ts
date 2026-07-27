import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewQuestion } from '@/lib/gemini';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const canEditContent = profile && ['instructor', 'founder_instructor', 'developer'].includes(profile.role);
  if (!canEditContent) {
    return NextResponse.json({ error: 'Accès réservé aux instructeurs et développeurs.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const questionId = body?.questionId as string | undefined;
  if (!questionId) {
    return NextResponse.json({ error: 'questionId manquant.' }, { status: 400 });
  }

  const { data: question } = await supabase.from('questions').select('*, lessons(title)').eq('id', questionId).single();
  if (!question) {
    return NextResponse.json({ error: 'Question introuvable.' }, { status: 404 });
  }

  try {
    const review = await reviewQuestion({
      lessonTitle: (question.lessons as { title: string } | null)?.title ?? '',
      questionText: question.question_text,
      options: Array.isArray(question.options) ? question.options.map(String) : [],
      correctIndex: question.correct_index,
      explanation: question.explanation,
    });
    return NextResponse.json(review);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de la relecture IA.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
