import type { Database } from '@/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type EnglishLevel = Profile['english_level'];
export type UserRole = Profile['role'];
export type SubscriptionPlan = Profile['subscription_plan'];
