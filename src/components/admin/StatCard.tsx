import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 text-white">
        <Icon icon={icon} className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
}
