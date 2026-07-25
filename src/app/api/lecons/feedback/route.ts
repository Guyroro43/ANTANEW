import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { explainWrongAnswers, type WrongAnswerItem } from '@/lib/gemini';

interface SubmittedAnswer {
  questionId: string;
  selectedIndex: number;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = body?.lessonId as string | undefined;
  const answers = (body?.answers as SubmittedAnswer[] | undefined) ?? [];

  if (!lessonId || answers.length === 0) {
    return NextResponse.json({ feedback: [] });
  }

  const [{ data: lesson }, { data: questions }] = await Promise.all([
    supabase.from('lessons').select('title').eq('id', lessonId).single(),
    supabase.from('questions').select('*').eq('lesson_id', lessonId).eq('status', 'approved'),
  ]);

  const questionById = new Map((questions ?? []).map((question) => [question.id, question]));

  const wrongItems: WrongAnswerItem[] = answers
    .map((answer) => {
      const question = questionById.get(answer.questionId);
      if (!question || answer.selectedIndex === question.correct_index) return null;
      const options = Array.isArray(question.options) ? question.options.map(String) : [];
      return {
        questionId: question.id,
        questionText: question.question_text,
        options,
        correctIndex: question.correct_index,
        selectedIndex: answer.selectedIndex,
        explanation: question.explanation,
      };
    })
    .filter((item): item is WrongAnswerItem => item !== null);

  if (wrongItems.length === 0) {
    return NextResponse.json({ feedback: [] });
  }

  try {
    const feedback = await explainWrongAnswers({
      lessonTitle: lesson?.title ?? '',
      items: wrongItems,
    });
    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ feedback: [] });
  }
}
