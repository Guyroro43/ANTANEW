'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/Spinner';
import { Icon, icons } from '@/components/ui/Icon';
import type { Question } from '@/types/module';

interface QuestionWithContext extends Question {
  lessonTitle: string;
  moduleId: string;
  moduleTitle: string;
}

interface Review {
  verdict: 'ok' | 'a_corriger';
  comment: string;
}

export default function Page() {
  const [pending, setPending] = useState<QuestionWithContext[]>([]);
  const [history, setHistory] = useState<QuestionWithContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<Record<string, string>>({});

  const loadData = async () => {
    const supabase = createClient();
    const { data: questions } = await supabase
      .from('questions')
      .select('*, lessons(title, module_id)')
      .eq('source', 'ai')
      .order('created_at', { ascending: false });

    const rows = questions ?? [];
    const moduleIds = Array.from(
      new Set(rows.map((row) => (row.lessons as { module_id: string } | null)?.module_id).filter((id): id is string => Boolean(id))),
    );
    const { data: modules } = moduleIds.length
      ? await supabase.from('modules').select('id, title').in('id', moduleIds)
      : { data: [] };
    const moduleTitleById = new Map((modules ?? []).map((m) => [m.id, m.title]));

    const withContext: QuestionWithContext[] = rows.map((row) => {
      const lesson = row.lessons as { title: string; module_id: string } | null;
      return {
        ...row,
        lessonTitle: lesson?.title ?? 'Leçon inconnue',
        moduleId: lesson?.module_id ?? '',
        moduleTitle: (lesson?.module_id && moduleTitleById.get(lesson.module_id)) ?? '',
      };
    });

    setPending(withContext.filter((q) => q.status === 'draft'));
    setHistory(withContext.filter((q) => q.status === 'approved').slice(0, 30));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (question: QuestionWithContext) => {
    setReviewingId(question.id);
    setReviewError((prev) => ({ ...prev, [question.id]: '' }));
    try {
      const response = await fetch('/api/admin/evaluations/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Échec de la relecture IA.');
      setReviews((prev) => ({ ...prev, [question.id]: data }));
    } catch (err) {
      setReviewError((prev) => ({ ...prev, [question.id]: err instanceof Error ? err.message : 'Échec de la relecture IA.' }));
    } finally {
      setReviewingId(null);
    }
  };

  const handleApprove = async (question: QuestionWithContext) => {
    const supabase = createClient();
    await supabase.from('questions').update({ status: 'approved' }).eq('id', question.id);
    await loadData();
  };

  const handleReject = async (question: QuestionWithContext) => {
    if (!window.confirm('Rejeter (supprimer) cette question générée par IA ?')) return;
    const supabase = createClient();
    await supabase.from('questions').delete().eq('id', question.id);
    await loadData();
  };

  if (isLoading) {
    return (
      <main className="flex justify-center px-8 py-16">
        <Spinner size={32} />
      </main>
    );
  }

  return (
    <main className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Évaluations</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Questions générées par IA en attente de validation, toutes leçons confondues. Demande une suggestion IA pour
        t'aider à vérifier une question avant de l'approuver.
      </p>

      <div className="mt-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">En attente de validation ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-slate-600 dark:text-slate-300">Aucune question en attente. 🎉</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {pending.map((question) => {
              const review = reviews[question.id];
              return (
                <Card key={question.id} className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Link href={`/admin/modules/${question.moduleId}`} className="hover:underline">
                      {question.moduleTitle}
                    </Link>
                    <span>/</span>
                    <span>{question.lessonTitle}</span>
                    <Badge variant="warning">Brouillon IA</Badge>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{question.question_text}</p>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    {(Array.isArray(question.options) ? question.options : []).map((option, index) => (
                      <li key={index} className={index === question.correct_index ? 'font-semibold text-green-700 dark:text-green-400' : ''}>
                        {index === question.correct_index ? '✓ ' : '• '}
                        {String(option)}
                      </li>
                    ))}
                  </ul>
                  {question.explanation && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">💡 {question.explanation}</p>
                  )}

                  {review && (
                    <div
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        review.verdict === 'ok'
                          ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
                          : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      <span className="font-semibold">{review.verdict === 'ok' ? 'IA : OK ✓' : 'IA : à corriger ⚠️'}</span> — {review.comment}
                    </div>
                  )}
                  {reviewError[question.id] && (
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">{reviewError[question.id]}</p>
                  )}

                  <div className="mt-1 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleReview(question)} disabled={reviewingId === question.id}>
                      <Icon icon={icons.sparkles} className="h-4 w-4" />
                      {reviewingId === question.id ? 'Analyse…' : 'Suggestion IA'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleApprove(question)}>
                      Approuver
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleReject(question)}>
                      Rejeter
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Historique des évaluations validées</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-slate-600 dark:text-slate-300">Aucune évaluation validée pour l'instant.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {history.map((question) => (
              <div
                key={question.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{question.question_text}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {question.moduleTitle} / {question.lessonTitle}
                  </p>
                </div>
                <Badge variant="default">Approuvée</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
