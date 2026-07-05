interface ActivityDay {
  label: string;
  signups: number;
  completedLessons: number;
}

interface ActivityChartProps {
  days: ActivityDay[];
}

export function ActivityChart({ days }: ActivityChartProps) {
  const max = Math.max(1, ...days.map((day) => Math.max(day.signups, day.completedLessons)));

  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Inscriptions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Leçons complétées
        </span>
      </div>
      <div className="mt-4 flex h-40 items-end gap-4">
        {days.map((day) => (
          <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-32 items-end gap-1">
              <div
                className="w-3 rounded-t bg-red-500"
                style={{ height: `${(day.signups / max) * 100}%` }}
                title={`${day.signups} inscription(s)`}
              />
              <div
                className="w-3 rounded-t bg-green-500"
                style={{ height: `${(day.completedLessons / max) * 100}%` }}
                title={`${day.completedLessons} leçon(s) complétée(s)`}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
