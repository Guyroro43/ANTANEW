'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { AudioPlayer } from './AudioPlayer';
import { QuestionQCM } from './QuestionQCM';
import { ResultatLecon, type Mistake } from './ResultatLecon';
import type { Question } from '@/types/module';

interface LeconRunnerProps {
  lessonId: string;
  moduleSlug: string;
  contentType: 'qcm' | 'pdf' | 'video' | 'audio';
  contentUrl: string | null;
  questions: Question[];
  alreadyCompleted: boolean;
}

interface CompletionResult {
  xpEarned: number;
  totalXp: number;
  currentStreak: number;
}

interface SubmittedAnswer {
  questionId: string;
  selectedIndex: number;
}

interface WrongAnswerFeedback {
  question_id: string;
  message: string;
}

export function LeconRunner({
  lessonId,
  moduleSlug,
  contentType,
  contentUrl,
  questions,
  alreadyCompleted,
}: LeconRunnerProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasQuestions = contentType === 'qcm' && questions.length > 0;
  const currentQuestion = hasQuestions ? questions[questionIndex] : null;
  const correctCount = answers.filter((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return question && answer.selectedIndex === question.correct_index;
  }).length;

  const buildMistakes = (finalAnswers: SubmittedAnswer[], feedback: WrongAnswerFeedback[]): Mistake[] => {
    const mistakes: Mistake[] = [];
    for (const answer of finalAnswers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question || answer.selectedIndex === question.correct_index) continue;
      const options = (Array.isArray(question.options) ? question.options : []).map(String);
      const aiMessage = feedback.find((f) => f.question_id === question.id)?.message;
      const mistake: Mistake = {
        questionText: question.question_text,
        yourAnswer: options[answer.selectedIndex] ?? '—',
        correctAnswer: options[question.correct_index] ?? '—',
      };
      const explanationText = aiMessage ?? question.explanation ?? undefined;
      if (explanationText) {
        mistake.feedback = explanationText;
      }
      mistakes.push(mistake);
    }
    return mistakes;
  };

  const finishLesson = async (score: number | null, finalAnswers: SubmittedAnswer[]) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const [{ data, error: rpcError }, feedbackResponse] = await Promise.all([
        supabase.rpc('complete_lesson', { p_lesson_id: lessonId, p_score: score }),
        finalAnswers.length > 0
          ? fetch('/api/lecons/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lessonId, answers: finalAnswers }),
            })
              .then((res) => (res.ok ? res.json() : { feedback: [] }))
              .catch(() => ({ feedback: [] }))
          : Promise.resolve({ feedback: [] }),
      ]);
      if (rpcError) throw new Error(rpcError.message);

      setMistakes(buildMistakes(finalAnswers, feedbackResponse?.feedback ?? []));
      setResult({
        xpEarned: data?.xp_earned ?? 0,
        totalXp: data?.total_xp ?? 0,
        currentStreak: data?.current_streak ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (selected !== null || !currentQuestion) return;
    setSelected(index);
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, selectedIndex: index }]);
  };

  const handleNext = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((index) => index + 1);
      setSelected(null);
      return;
    }
    const finalAnswers = [...answers];
    const finalCorrectCount = finalAnswers.filter((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      return question && answer.selectedIndex === question.correct_index;
    }).length;
    const score = Math.round((finalCorrectCount / questions.length) * 5);
    finishLesson(score, finalAnswers);
  };

  if (result) {
    return (
      <ResultatLecon
        score={correctCount}
        total={hasQuestions ? questions.length : 0}
        xpEarned={result.xpEarned}
        currentStreak={result.currentStreak}
        moduleSlug={moduleSlug}
        mistakes={mistakes}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {contentType === 'video' && contentUrl && (
        <video controls className="w-full rounded-xl" src={contentUrl} />
      )}

      {contentType === 'audio' && contentUrl && <AudioPlayer src={contentUrl} />}

      {contentType === 'pdf' && contentUrl && (
        <div className="flex flex-col gap-3">
          <iframe
            src={contentUrl}
            className="h-[70vh] w-full rounded-xl border border-slate-200 dark:border-slate-700"
            title="Document PDF"
          />
          <a
            href={contentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-red-600 hover:underline dark:text-yellow-400"
          >
            Ouvrir le PDF dans un nouvel onglet
          </a>
        </div>
      )}

      {hasQuestions && currentQuestion && (
        <>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Question {questionIndex + 1} / {questions.length}
          </p>
          <QuestionQCM
            questionText={currentQuestion.question_text}
            options={(Array.isArray(currentQuestion.options) ? currentQuestion.options : []).map(String)}
            correctIndex={currentQuestion.correct_index}
            explanation={currentQuestion.explanation}
            selectedIndex={selected}
            onSelect={handleAnswer}
          />
          {selected !== null && (
            <Button onClick={handleNext} disabled={isSubmitting}>
              {questionIndex + 1 < questions.length
                ? 'Question suivante'
                : isSubmitting
                  ? 'Correction en cours…'
                  : 'Terminer la leçon'}
            </Button>
          )}
        </>
      )}

      {!hasQuestions && contentType !== 'qcm' && (
        <Button onClick={() => finishLesson(null, [])} disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : alreadyCompleted ? 'Revalider comme terminée' : 'Marquer comme terminée'}
        </Button>
      )}

      {contentType === 'qcm' && questions.length === 0 && (
        <p className="text-slate-600 dark:text-slate-300">Cette leçon n&apos;a pas encore de questions.</p>
      )}

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
