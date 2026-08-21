'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Clock, PartyPopper, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Icon, icons } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { Json } from '@/types/database';

const QUESTION_SECONDS = 20;
const SUBMIT_TIMEOUT_MS = 15000;

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Answer {
  question_id: string;
  selected_index: number;
}

interface PlacementTestRunnerProps {
  firstName: string;
  topic: string;
  questions: Question[];
}

interface Result {
  level: 'debutant' | 'intermediaire' | 'avance';
  correct_count: number;
  total: number;
}

const levelCopy: Record<Result['level'], { label: string; icon: typeof icons.sprout }> = {
  debutant: { label: 'Débutant', icon: icons.sprout },
  intermediaire: { label: 'Intermédiaire', icon: icons.rocket },
  avance: { label: 'Avancé', icon: icons.trophy },
};

export function PlacementTestRunner({ firstName, topic, questions }: PlacementTestRunnerProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<'intro' | 'quiz' | 'submitting' | 'error' | 'result'>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const answersRef = useRef<Answer[]>([]);

  const currentQuestion = questions[questionIndex];

  const advance = (selectedIndex: number) => {
    answersRef.current = [...answersRef.current, { question_id: currentQuestion.id, selected_index: selectedIndex }];
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
      setSecondsLeft(QUESTION_SECONDS);
    } else {
      submit();
    }
  };

  useEffect(() => {
    if (step !== 'quiz') return;
    if (secondsLeft <= 0) {
      advance(selected ?? -1);
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, secondsLeft]);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setTimeout(() => advance(index), 450);
  };

  const submit = async () => {
    setStep('submitting');
    setError(null);
    try {
      const supabase = createClient();
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('La connexion est trop lente. Réessaie.')), SUBMIT_TIMEOUT_MS);
      });
      const { data, error: rpcError } = await Promise.race([
        supabase.rpc('submit_placement_test', { p_answers: answersRef.current as unknown as Json }),
        timeout,
      ]);
      if (rpcError) throw new Error(rpcError.message);
      const row = Array.isArray(data) ? data[0] : data;
      setResult(row as Result);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setStep('error');
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
    router.refresh();
  };

  const transition = { duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' as const };
  const urgent = secondsLeft <= 10;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-10 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="w-full max-w-xl rounded-[2rem] border border-red-200 bg-white/90 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-slate-950/40">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={transition}
              className="flex flex-col items-center gap-4 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-red-500 to-yellow-500 text-white shadow-lg dark:from-green-700 dark:via-green-600 dark:to-emerald-500">
                <Sparkles className="h-8 w-8" />
              </span>
              <h1 className="text-2xl font-black">Salut {firstName}, à toi de jouer !</h1>
              <p className="max-w-sm text-slate-600 dark:text-slate-300">
                Un petit quiz de 6 questions sur le thème <span className="font-bold text-red-600 dark:text-yellow-400">« {topic} »</span> pour découvrir ton niveau d&apos;anglais. Tu as <span className="font-bold">20 secondes</span> par question — fais confiance à tes réflexes !
              </p>
              <Button onClick={() => setStep('quiz')} className="mt-2 w-full">
                C&apos;est parti
              </Button>
            </motion.div>
          )}

          {step === 'quiz' && currentQuestion && (
            <motion.div
              key={`question-${questionIndex}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={transition}
              className="flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Question {questionIndex + 1} / {questions.length}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums transition-colors',
                    urgent
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {secondsLeft}s
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className={cn('h-full rounded-full', urgent ? 'bg-red-500' : 'bg-gradient-to-r from-red-600 to-yellow-500')}
                  animate={{ width: `${(secondsLeft / QUESTION_SECONDS) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <p className="text-xl font-semibold text-slate-900 dark:text-white">{currentQuestion.text}</p>

              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={selected !== null}
                    onClick={() => handleSelect(index)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99] disabled:cursor-not-allowed',
                      selected === index
                        ? 'border-red-500 bg-red-50 text-red-800 dark:border-yellow-500 dark:bg-yellow-950/40 dark:text-yellow-200'
                        : 'border-slate-300 hover:border-red-400 dark:border-slate-600 dark:hover:border-yellow-500',
                      selected !== null && selected !== index && 'opacity-50',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-10 text-center"
            >
              <p className="font-semibold text-slate-600 dark:text-slate-300">Calcul de ton niveau…</p>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                Impossible de calculer ton niveau pour l&apos;instant.
              </p>
              <Button onClick={submit} className="mt-2 w-full">
                Réessayer
              </Button>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="flex flex-col items-center gap-4 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-red-500 to-yellow-500 text-3xl shadow-lg dark:from-green-700 dark:via-green-600 dark:to-emerald-500">
                <PartyPopper className="h-8 w-8 text-white" />
              </span>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Résultat
              </p>
              <h1 className="flex items-center justify-center gap-2 text-3xl font-black">
                <Icon icon={levelCopy[result.level].icon} className="h-7 w-7" />
                Niveau {levelCopy[result.level].label}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Tes leçons seront adaptées à ce niveau — tu pourras progresser au fil du temps.
              </p>
              <Button onClick={goToDashboard} className="mt-2 w-full">
                Aller à mon dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'error' && error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
