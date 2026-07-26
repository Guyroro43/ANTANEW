import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateLessonContent, generateLessonContentFromPdf, generateQuestionsFromMedia } from '@/lib/gemini';

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
};

function guessMimeType(url: string, contentType: 'video' | 'audio') {
  const extension = url.split('.').pop()?.toLowerCase().split('?')[0];
  if (extension && MIME_TYPES_BY_EXTENSION[extension]) return MIME_TYPES_BY_EXTENSION[extension];
  return contentType === 'video' ? 'video/mp4' : 'audio/mpeg';
}

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
  const lessonId = body?.lessonId as string | undefined;
  const source = body?.source === 'pdf' ? 'pdf' : body?.source === 'media' ? 'media' : 'text';
  const count = Math.min(Math.max(Number(body?.count) || 5, 1), 10);
  const vocabCount = Math.min(Math.max(Number(body?.vocabCount) || 5, 0), 8);

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId manquant.' }, { status: 400 });
  }

  const { data: lesson } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
  if (!lesson) {
    return NextResponse.json({ error: 'Leçon introuvable.' }, { status: 404 });
  }

  const [{ data: existingQuestions }, { data: existingVocab }] = await Promise.all([
    supabase.from('questions').select('order_index').eq('lesson_id', lessonId).order('order_index', { ascending: false }).limit(1),
    supabase.from('lesson_vocabulary').select('order_index').eq('lesson_id', lessonId).order('order_index', { ascending: false }).limit(1),
  ]);

  let nextOrderIndex = (existingQuestions?.[0]?.order_index ?? -1) + 1;
  let nextVocabOrderIndex = (existingVocab?.[0]?.order_index ?? -1) + 1;

  let generated;
  try {
    if (source === 'pdf') {
      if (!lesson.source_pdf_path) {
        return NextResponse.json({ error: 'Aucun PDF source associé à cette leçon.' }, { status: 400 });
      }
      const { data: signed, error: signedError } = await supabase.storage
        .from('lesson-source')
        .createSignedUrl(lesson.source_pdf_path, 300);
      if (signedError || !signed) {
        return NextResponse.json({ error: 'Impossible de lire le PDF source.' }, { status: 500 });
      }
      generated = await generateLessonContentFromPdf({
        pdfUrl: signed.signedUrl,
        lessonTitle: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        count,
        vocabCount,
      });
    } else if (source === 'media') {
      if (!lesson.content_url || (lesson.content_type !== 'video' && lesson.content_type !== 'audio')) {
        return NextResponse.json({ error: 'Aucun fichier vidéo/audio associé à cette leçon.' }, { status: 400 });
      }
      const isExternalUrl = /^https?:\/\//.test(lesson.content_url);
      const mediaUrl = isExternalUrl
        ? lesson.content_url
        : supabase.storage.from('lesson-media').getPublicUrl(lesson.content_url).data.publicUrl;

      const questions = await generateQuestionsFromMedia({
        mediaUrl,
        mimeType: guessMimeType(lesson.content_url, lesson.content_type),
        lessonTitle: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        count,
      });
      generated = { questions, vocabulary: [] };
    } else {
      const { data: moduleRow } = await supabase.from('modules').select('title').eq('id', lesson.module_id).single();
      generated = await generateLessonContent({
        moduleTitle: moduleRow?.title ?? '',
        lessonTitle: lesson.title,
        lessonDescription: lesson.description,
        category: lesson.category,
        difficulty: lesson.difficulty,
        count,
        vocabCount,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Échec de la génération IA.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const questionRows = generated.questions.map((question) => ({
    lesson_id: lessonId,
    question_text: question.question_text,
    options: question.options,
    correct_index: question.correct_index,
    explanation: question.explanation,
    order_index: nextOrderIndex++,
    status: 'draft' as const,
    source: 'ai' as const,
  }));

  const vocabRows = generated.vocabulary.map((item) => ({
    lesson_id: lessonId,
    word: item.word,
    definition: item.definition,
    example: item.example,
    order_index: nextVocabOrderIndex++,
  }));

  const [{ error: questionsError }, { error: vocabError }] = await Promise.all([
    questionRows.length ? supabase.from('questions').insert(questionRows) : Promise.resolve({ error: null }),
    vocabRows.length ? supabase.from('lesson_vocabulary').insert(vocabRows) : Promise.resolve({ error: null }),
  ]);

  if (questionsError || vocabError) {
    return NextResponse.json({ error: (questionsError ?? vocabError)?.message }, { status: 500 });
  }

  return NextResponse.json({ insertedQuestions: questionRows.length, insertedVocabulary: vocabRows.length });
}
