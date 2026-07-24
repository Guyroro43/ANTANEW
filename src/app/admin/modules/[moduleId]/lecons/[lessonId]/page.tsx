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
import type { Lesson, Question, QuestionInsert } from '@/types/module';

export default function Page() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const loadData = async () => {
    const supabase = createClient();
    const [{ data: lessonData }, { data: questionsData }] = await Promise.all([
      supabase.from('lessons').select('*').eq('id', lessonId).single(),
      supabase.from('questions').select('*').eq('lesson_id', lessonId).order('order_index'),
    ]);
    setLesson(lessonData ?? null);
    setQuestions(questionsData ?? []);
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const response = await fetch('/api/admin/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, count: 5 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Échec de la génération.");
      }
      await loadData();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Échec de la génération.");
    } finally {
      setIsGenerating(false);
    }
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
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">
            {lesson.title}
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Questions</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Génération…' : '✨ Générer avec l’IA'}
          </Button>
          <Button onClick={openCreate}>+ Nouvelle question</Button>
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
    </main>
  );
}
