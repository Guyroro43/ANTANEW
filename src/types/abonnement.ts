import type { Database } from '@/types/database';
import type { SubscriptionPlan } from '@/types/user';

export type Transaction = Database['public']['Tables']['transactions']['Row'];

export type PaymentProvider = 'stripe' | 'cinetpay';

export interface Abonnement {
  plan: SubscriptionPlan;
  expiresAt: string | null;
  isActive: boolean;
}

export interface CheckoutPayload {
  plan: Exclude<SubscriptionPlan, 'starter'>;
  provider: PaymentProvider;
}

export interface WebhookEvent<T = unknown> {
  provider: PaymentProvider;
  eventType: string;
  data: T;
}
