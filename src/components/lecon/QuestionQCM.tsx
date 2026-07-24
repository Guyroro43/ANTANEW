'use client';

import { cn } from '@/utils/cn';
import { Icon, icons } from '@/components/ui/Icon';

interface QuestionQCMProps {
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function QuestionQCM({
  questionText,
  options,
  correctIndex,
  explanation,
  selectedIndex,
  onSelect,
}: QuestionQCMProps) {
  const answered = selectedIndex !== null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold text-slate-900 dark:text-white">{questionText}</p>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const isCorrect = index === correctIndex;
          const isSelected = index === selectedIndex;
          return (
            <button
              key={index}
              type="button"
              disabled={answered}
              onClick={() => onSelect(index)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99] disabled:cursor-not-allowed',
                !answered && 'border-slate-300 hover:border-red-400 dark:border-slate-600',
                answered &&
                  isCorrect &&
                  'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
                answered &&
                  isSelected &&
                  !isCorrect &&
                  'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
                answered && !isSelected && !isCorrect && 'border-slate-200 opacity-60 dark:border-slate-700',
              )}
            >
              <span>{option}</span>
              {answered && isCorrect && <Icon icon={icons.check} className="h-4 w-4 flex-shrink-0" />}
              {answered && isSelected && !isCorrect && <Icon icon={icons.x} className="h-4 w-4 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      {answered && explanation ? (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          💡 {explanation}
        </p>
      ) : null}
    </div>
  );
}
