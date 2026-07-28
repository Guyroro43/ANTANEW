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
import type { LessonBlock, NotionBlockContent, QcmBlockContent } from '@/types/module';

interface LeconBlocksRunnerProps {
  lessonId: string;
  moduleSlug: string;
  blocks: LessonBlock[];
}

interface CompletionResult {
  xpEarned: number;
  totalXp: number;
  currentStreak: number;
  newBadges: NewBadge[];
}

interface SubmittedAnswer {
  blockId: string;
  selectedIndex: number;
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function LeconBlocksRunner({ lessonId, moduleSlug, blocks }: LeconBlocksRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CompletionResult | null>(null);
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

  const currentBlock = blocks[currentIndex];
  const qcmBlocks = blocks.filter((block) => block.block_type === 'qcm');

  const buildMistakes = (finalAnswers: SubmittedAnswer[]): Mistake[] => {
    const mistakes: Mistake[] = [];
    for (const answer of finalAnswers) {
      const block = blocks.find((b) => b.id === answer.blockId);
      if (!block || block.block_type !== 'qcm') continue;
      const content = block.content as unknown as QcmBlockContent;
      if (answer.selectedIndex === content.correct_index) continue;
      const mistake: Mistake = {
        questionText: content.question_text,
        yourAnswer: content.options[answer.selectedIndex] ?? '—',
        correctAnswer: content.options[content.correct_index] ?? '—',
      };
      if (content.explanation) {
        mistake.feedback = content.explanation;
      }
      mistakes.push(mistake);
    }
    return mistakes;
  };

  const finishLesson = async (score: number | null, maxScore: number | null) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc('complete_lesson', {
        p_lesson_id: lessonId,
        p_score: score,
        p_max_score: maxScore,
      });
      if (rpcError) throw new Error(rpcError.message);

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
    if (selected !== null || !currentBlock) return;
    setSelected(index);
    setAnswers((prev) => [...prev, { blockId: currentBlock.id, selectedIndex: index }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < blocks.length) {
      setCurrentIndex((index) => index + 1);
      setSelected(null);
      return;
    }

    const finalCorrectCount = answers.filter((answer) => {
      const block = blocks.find((b) => b.id === answer.blockId);
      if (!block || block.block_type !== 'qcm') return false;
      const content = block.content as unknown as QcmBlockContent;
      return answer.selectedIndex === content.correct_index;
    }).length;
    finishLesson(qcmBlocks.length > 0 ? finalCorrectCount : null, qcmBlocks.length > 0 ? qcmBlocks.length : null);
  };

  if (result) {
    const finalCorrectCount = answers.filter((answer) => {
      const block = blocks.find((b) => b.id === answer.blockId);
      if (!block || block.block_type !== 'qcm') return false;
      const content = block.content as unknown as QcmBlockContent;
      return answer.selectedIndex === content.correct_index;
    }).length;

    return (
      <ResultatLecon
        score={finalCorrectCount}
        total={qcmBlocks.length}
        xpEarned={result.xpEarned}
        currentStreak={result.currentStreak}
        moduleSlug={moduleSlug}
        mistakes={buildMistakes(answers)}
        newBadges={result.newBadges}
      />
    );
  }

  if (!currentBlock) {
    return <p className="text-slate-600 dark:text-slate-300">Cette leçon n&apos;a pas encore de contenu.</p>;
  }

  const transition = { duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' as const };
  const notionContent = currentBlock.block_type === 'notion' ? (currentBlock.content as unknown as NotionBlockContent) : null;
  const qcmContent = currentBlock.block_type === 'qcm' ? (currentBlock.content as unknown as QcmBlockContent) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          ⏱ {formatElapsed(elapsed)}
        </span>
      </div>

      <ProgressBar value={currentIndex + 1} max={blocks.length} label={`${currentIndex + 1} / ${blocks.length}`} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentBlock.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={transition}
          className="flex flex-col gap-6"
        >
          {notionContent && (
            <>
              <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-6 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{notionContent.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{notionContent.body}</p>
                {notionContent.example && (
                  <p className="mt-3 text-sm italic text-slate-500 dark:text-slate-400">« {notionContent.example} »</p>
                )}
                {notionContent.audio_url && (
                  <div className="mt-4">
                    <AudioPlayer src={notionContent.audio_url} />
                  </div>
                )}
              </div>
              <Button onClick={handleNext}>{currentIndex + 1 < blocks.length ? 'Continuer' : 'Terminer la leçon'}</Button>
            </>
          )}

          {qcmContent && (
            <>
              <QuestionQCM
                questionText={qcmContent.question_text}
                options={qcmContent.options}
                correctIndex={qcmContent.correct_index}
                explanation={qcmContent.explanation}
                selectedIndex={selected}
                onSelect={handleAnswer}
              />
              {selected !== null && (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  <Icon icon={icons.check} className="h-4 w-4" />
                  {currentIndex + 1 < blocks.length
                    ? 'Continuer'
                    : isSubmitting
                      ? 'Correction en cours…'
                      : 'Terminer la leçon'}
                </Button>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
