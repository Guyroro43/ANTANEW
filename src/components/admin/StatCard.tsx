import { Card } from '@/components/ui/Card';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 text-xl">
        {icon}
      </span>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
}
