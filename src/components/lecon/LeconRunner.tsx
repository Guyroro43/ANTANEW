'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon, icons } from '@/components/ui/Icon';
import { AudioPlayer } from './AudioPlayer';
import { QuestionQCM } from './QuestionQCM';
import { ResultatLecon, type Mistake, type NewBadge } from './ResultatLecon';
import type { Question, VocabularyItem } from '@/types/module';

interface LeconRunnerProps {
  lessonId: string;
  moduleSlug: string;
  contentType: 'qcm' | 'pdf' | 'video' | 'audio';
  contentUrl: string | null;
  questions: Question[];
  vocabulary: VocabularyItem[];
  alreadyCompleted: boolean;
}

interface CompletionResult {
  xpEarned: number;
  totalXp: number;
  currentStreak: number;
  newBadges: NewBadge[];
}

interface SubmittedAnswer {
  questionId: string;
  selectedIndex: number;
}

interface WrongAnswerFeedback {
  question_id: string;
  message: string;
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function LeconRunner({
  lessonId,
  moduleSlug,
  contentType,
  contentUrl,
  questions,
  vocabulary,
  alreadyCompleted,
}: LeconRunnerProps) {
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabDone, setVocabDone] = useState(vocabulary.length === 0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const hasQuestions = contentType === 'qcm' && questions.length > 0;
  const currentQuestion = hasQuestions ? questions[questionIndex] : null;
  const currentVocab = vocabulary[vocabIndex];
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
        newBadges: data?.new_badges ?? [],
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

  const handleVocabNext = () => {
    if (vocabIndex + 1 < vocabulary.length) {
      setVocabIndex((index) => index + 1);
    } else {
      setVocabDone(true);
    }
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
        newBadges={result.newBadges}
      />
    );
  }

  const transition = { duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' as const };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          ⏱ {formatElapsed(elapsed)}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!vocabDone && currentVocab ? (
          <motion.div
            key={`vocab-${currentVocab.id}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={transition}
            className="flex flex-col gap-4"
          >
            <ProgressBar
              value={vocabIndex + 1}
              max={vocabulary.length}
              label={`Vocabulaire ${vocabIndex + 1} / ${vocabulary.length}`}
            />
            <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-6 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentVocab.word}</p>
              <p className="mt-2 text-slate-700 dark:text-slate-300">{currentVocab.definition}</p>
              {currentVocab.example && (
                <p className="mt-3 text-sm italic text-slate-500 dark:text-slate-400">« {currentVocab.example} »</p>
              )}
              {currentVocab.audio_url && (
                <div className="mt-4">
                  <AudioPlayer src={currentVocab.audio_url} />
                </div>
              )}
            </div>
            <Button onClick={handleVocabNext}>
              {vocabIndex + 1 < vocabulary.length ? 'Mot suivant' : 'Passer au QCM'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={hasQuestions ? `question-${questionIndex}` : 'content'}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={transition}
            className="flex flex-col gap-6"
          >
            {contentType === 'video' && contentUrl && (
              <video controls className="w-full rounded-xl" src={contentUrl} />
            )}

            {contentType === 'audio' && contentUrl && <AudioPlayer src={contentUrl} />}

            {contentType === 'pdf' && (
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Icon icon={icons.doc} className="h-5 w-5 flex-shrink-0" />
                Ce cours est en cours de préparation.
              </p>
            )}

            {hasQuestions && currentQuestion && (
              <>
                <ProgressBar
                  value={questionIndex + 1}
                  max={questions.length}
                  label={`Question ${questionIndex + 1} / ${questions.length}`}
                />
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
                <Icon icon={icons.check} className="h-4 w-4" />
                {isSubmitting ? 'Enregistrement…' : alreadyCompleted ? 'Revalider comme terminée' : 'Marquer comme terminée'}
              </Button>
            )}

            {contentType === 'qcm' && questions.length === 0 && (
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Icon icon={icons.doc} className="h-5 w-5 flex-shrink-0" />
                Cette leçon n&apos;a pas encore de questions.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
