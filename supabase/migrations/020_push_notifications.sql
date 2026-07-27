-- ANTA — Notifications push (web + mobile via Firebase Cloud Messaging).
-- device_tokens : un token FCM par appareil/navigateur, rattaché à son
-- utilisateur. notification_broadcasts : historique des envois groupés
-- déclenchés par un admin (tous les utilisateurs ou une sélection).

create table if not exists public.device_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('web', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists device_tokens_user_id_idx on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

create policy "Un utilisateur gère ses propres tokens d'appareil"
  on public.device_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.notification_broadcasts (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  target text not null check (target in ('all', 'selected')),
  recipient_count integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.notification_broadcasts enable row level security;

create policy "Historique des envois visible par les admins"
  on public.notification_broadcasts for select
  using (public.is_admin());

-- Pas de policy insert/update : la route serveur d'envoi utilise la clé
-- service_role (bypass RLS), l'historique n'est jamais écrit côté client.
