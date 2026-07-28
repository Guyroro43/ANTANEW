'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { VocabularyForm } from '@/components/admin/VocabularyForm';
import { Icon, icons } from '@/components/ui/Icon';
import type { Lesson, Question, QuestionInsert, VocabularyItem, VocabularyInsert } from '@/types/module';

export default function Page() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [vocabModalOpen, setVocabModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<VocabularyItem | null>(null);
  const [isGenerating, setIsGenerating] = useState<'text' | 'pdf' | 'media' | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const loadData = async () => {
    const supabase = createClient();
    const [{ data: lessonData }, { data: questionsData }, { data: vocabData }] = await Promise.all([
      supabase.from('lessons').select('*').eq('id', lessonId).single(),
      supabase.from('questions').select('*').eq('lesson_id', lessonId).order('order_index'),
      supabase.from('lesson_vocabulary').select('*').eq('lesson_id', lessonId).order('order_index'),
    ]);
    setLesson(lessonData ?? null);
    setQuestions(questionsData ?? []);
    setVocabulary(vocabData ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const openCreate = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const openEdit = (question: Question) => {
    setEditingQuestion(question);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Omit<QuestionInsert, 'lesson_id'>) => {
    const supabase = createClient();
    if (editingQuestion) {
      const { error } = await supabase.from('questions').update(values).eq('id', editingQuestion.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('questions').insert({ ...values, lesson_id: lessonId });
      if (error) throw new Error(error.message);
    }
    setModalOpen(false);
    await loadData();
  };

  const handleDelete = async (question: Question) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    const supabase = createClient();
    await supabase.from('questions').delete().eq('id', question.id);
    await loadData();
  };

  const handleApprove = async (question: Question) => {
    const supabase = createClient();
    await supabase.from('questions').update({ status: 'approved' }).eq('id', question.id);
    await loadData();
  };

  const handleGenerate = async (source: 'text' | 'pdf' | 'media') => {
    setIsGenerating(source);
    setGenerateError(null);
    try {
      const response = await fetch('/api/admin/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, count: 5, source }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Échec de la génération.");
      }
      await loadData();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Échec de la génération.");
    } finally {
      setIsGenerating(null);
    }
  };

  const openCreateVocab = () => {
    setEditingVocab(null);
    setVocabModalOpen(true);
  };

  const openEditVocab = (item: VocabularyItem) => {
    setEditingVocab(item);
    setVocabModalOpen(true);
  };

  const handleVocabSubmit = async (values: Omit<VocabularyInsert, 'lesson_id'>) => {
    const supabase = createClient();
    if (editingVocab) {
      const { error } = await supabase.from('lesson_vocabulary').update(values).eq('id', editingVocab.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('lesson_vocabulary').insert({ ...values, lesson_id: lessonId });
      if (error) throw new Error(error.message);
    }
    setVocabModalOpen(false);
    await loadData();
  };

  const handleVocabDelete = async (item: VocabularyItem) => {
    if (!window.confirm('Supprimer ce mot de vocabulaire ?')) return;
    const supabase = createClient();
    await supabase.from('lesson_vocabulary').delete().eq('id', item.id);
    await loadData();
  };

  if (isLoading) {
    return (
      <main className="flex justify-center px-8 py-16">
        <Spinner size={32} />
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="px-8 py-16 text-center">
        <p className="text-lg font-semibold">Leçon introuvable.</p>
        <Link href={`/admin/modules/${moduleId}`} className="mt-4 inline-flex text-red-600 underline dark:text-yellow-400">
          Retour aux leçons
        </Link>
      </main>
    );
  }

  return (
    <main className="px-8 py-10">
      <Link href={`/admin/modules/${moduleId}`} className="text-sm font-semibold text-red-600 hover:underline dark:text-yellow-400">
        ← Retour aux leçons
      </Link>

      <div className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">
          {lesson.title}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Vocabulaire</h2>
        <Button variant="outline" onClick={openCreateVocab}>
          <Icon icon={icons.plus} className="h-4 w-4" />
          Ajouter un mot
        </Button>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Affiché en flashcards avant le QCM, dans l&apos;ordre choisi ici. Optionnel — laisse vide pour passer directement au QCM.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {vocabulary.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">Aucun mot de vocabulaire pour cette leçon.</p>
        ) : (
          vocabulary.map((item) => (
            <Card key={item.id} className="flex flex-col gap-2">
              <p className="font-bold text-slate-900 dark:text-white">{item.word}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{item.definition}</p>
              {item.example && <p className="text-xs italic text-slate-500 dark:text-slate-400">{item.example}</p>}
              <div className="mt-1 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditVocab(item)}>
                  Éditer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleVocabDelete(item)}>
                  Supprimer
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Questions</h2>
        <div className="flex flex-wrap gap-2">
          {lesson.content_type === 'qcm' && (
            <>
              <Button variant="outline" onClick={() => handleGenerate('text')} disabled={isGenerating !== null}>
                <Icon icon={icons.sparkles} className="h-4 w-4" />
                {isGenerating === 'text' ? 'Génération…' : 'Générer avec l’IA'}
              </Button>
              {lesson.source_pdf_path && (
                <Button variant="outline" onClick={() => handleGenerate('pdf')} disabled={isGenerating !== null}>
                  <Icon icon={icons.doc} className="h-4 w-4" />
                  {isGenerating === 'pdf' ? 'Génération…' : 'Générer depuis le PDF'}
                </Button>
              )}
            </>
          )}
          {(lesson.content_type === 'video' || lesson.content_type === 'audio') && (
            <>
              {lesson.content_url && (
                <Button variant="outline" onClick={() => handleGenerate('media')} disabled={isGenerating !== null}>
                  <Icon icon={lesson.content_type === 'video' ? icons.video : icons.speaker} className="h-4 w-4" />
                  {isGenerating === 'media'
                    ? 'Génération…'
                    : `Générer depuis ${lesson.content_type === 'video' ? 'la vidéo' : "l'audio"}`}
                </Button>
              )}
              {lesson.source_pdf_path && (
                <Button variant="outline" onClick={() => handleGenerate('pdf')} disabled={isGenerating !== null}>
                  <Icon icon={icons.doc} className="h-4 w-4" />
                  {isGenerating === 'pdf' ? 'Génération…' : 'Générer depuis le PDF'}
                </Button>
              )}
            </>
          )}
          <Button onClick={openCreate}>
            <Icon icon={icons.plus} className="h-4 w-4" />
            Nouvelle question
          </Button>
        </div>
      </div>

      {generateError && (
        <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{generateError}</p>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {questions.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">Aucune question pour cette leçon.</p>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-white">{question.question_text}</p>
                  {question.status === 'draft' && <Badge variant="warning">Brouillon IA</Badge>}
                  {question.source === 'ai' && question.status === 'approved' && (
                    <Badge variant="default">Généré par IA</Badge>
                  )}
                </div>
                <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {(Array.isArray(question.options) ? question.options : []).map((option, index) => (
                    <li key={index} className={index === question.correct_index ? 'font-semibold text-green-700 dark:text-green-400' : ''}>
                      {index === question.correct_index ? '✓ ' : '• '}
                      {String(option)}
                    </li>
                  ))}
                </ul>
                {question.explanation && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">💡 {question.explanation}</p>
                )}
              </div>
              <div className="flex gap-2">
                {question.status === 'draft' && (
                  <Button variant="secondary" size="sm" onClick={() => handleApprove(question)}>
                    Approuver
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => openEdit(question)}>
                  Éditer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(question)}>
                  Supprimer
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingQuestion ? 'Éditer la question' : 'Nouvelle question'}>
        <QuestionForm
          key={editingQuestion?.id ?? 'new'}
          initialValue={editingQuestion ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal open={vocabModalOpen} onClose={() => setVocabModalOpen(false)} title={editingVocab ? 'Éditer le mot' : 'Nouveau mot de vocabulaire'}>
        <VocabularyForm
          key={editingVocab?.id ?? 'new'}
          initialValue={editingVocab ?? undefined}
          onSubmit={handleVocabSubmit}
          onCancel={() => setVocabModalOpen(false)}
        />
      </Modal>
    </main>
  );
}
