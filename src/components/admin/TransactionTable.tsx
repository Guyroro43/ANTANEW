import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Transaction } from '@/types/abonnement';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive';

const statusVariant: Record<Transaction['status'], BadgeVariant> = {
  success: 'success',
  pending: 'warning',
  failed: 'destructive',
  refunded: 'default',
};

const statusLabel: Record<Transaction['status'], string> = {
  success: 'Réussie',
  pending: 'En attente',
  failed: 'Échouée',
  refunded: 'Remboursée',
};

export interface TransactionRow extends Transaction {
  userName: string;
}

interface TransactionTableProps {
  transactions: TransactionRow[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Aucune transaction pour l'instant.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="py-2 pr-4 font-semibold">Utilisateur</th>
            <th className="py-2 pr-4 font-semibold">Montant</th>
            <th className="py-2 pr-4 font-semibold">Méthode</th>
            <th className="py-2 pr-4 font-semibold">Statut</th>
            <th className="py-2 pr-4 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{transaction.userName}</td>
              <td className="py-3 pr-4 tabular-nums text-slate-600 dark:text-slate-300">
                {formatCurrency(transaction.amount, transaction.currency)}
              </td>
              <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{transaction.payment_method ?? '—'}</td>
              <td className="py-3 pr-4">
                <Badge variant={statusVariant[transaction.status]}>{statusLabel[transaction.status]}</Badge>
              </td>
              <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{formatDate(transaction.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
