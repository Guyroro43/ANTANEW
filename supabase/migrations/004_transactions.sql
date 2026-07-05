-- ANTA — Transactions (paiements d'abonnement)
-- Exécuter dans Supabase : SQL Editor > New query > Run (après 001, 002, 003)

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'XOF',
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded')),
  payment_method text,
  provider text check (provider in ('stripe', 'cinetpay')),
  provider_reference text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Transactions personnelles visibles"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Transactions visibles par les admins"
  on public.transactions for select
  using (public.is_admin());
