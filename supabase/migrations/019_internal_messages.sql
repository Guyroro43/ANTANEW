-- ANTA — Messagerie interne entre rôles admin (instructor/founder/
-- founder_instructor/developer). Canal d'équipe unique (pas de messages
-- privés en Phase 2), messages auto-expirés après 24h : filtrés côté
-- policy de lecture, purge effective via la fonction de nettoyage ci-dessous.

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

create policy "Messages de l'équipe admin visibles aux admins (24h)"
  on public.messages for select
  using (public.is_admin() and created_at > now() - interval '24 hours');

create policy "Un admin peut poster un message"
  on public.messages for insert
  with check (public.is_admin() and author_id = auth.uid());

create policy "Un admin peut supprimer son propre message"
  on public.messages for delete
  using (public.is_admin() and author_id = auth.uid());

-- Purge effective des messages de plus de 24h (au-delà du simple filtrage de
-- lecture) — à appeler périodiquement (ex. pg_cron si disponible, sinon
-- déclenché opportunistement par l'app).
create or replace function public.purge_expired_messages()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.messages where created_at <= now() - interval '24 hours';
$$;

grant execute on function public.purge_expired_messages() to authenticated;

-- Nécessaire pour que l'UI reçoive les nouveaux messages/suppressions en
-- direct via Supabase Realtime (postgres_changes).
alter publication supabase_realtime add table public.messages;
