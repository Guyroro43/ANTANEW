-- ANTA — Fonctionnalités apprenant (classement, préférences)
-- Exécuter dans Supabase : SQL Editor > New query > Run (après 001, 002, 003, 004, 005)

-- Préférence de notifications (page Paramètres)
alter table public.profiles add column if not exists notifications_enabled boolean not null default true;

-- Classement : la policy actuelle sur profiles ("auth.uid() = id") empêche un
-- utilisateur normal de lire les lignes des autres. On expose donc uniquement
-- les colonnes nécessaires au classement via une fonction security definer,
-- sans ouvrir profiles (email, abonnement...) à tout le monde.
create or replace function public.get_leaderboard(p_limit integer default 20)
returns table (
  rank bigint,
  id uuid,
  first_name text,
  avatar_url text,
  level text,
  total_xp integer
)
language sql
security definer
set search_path = public
stable
as $$
  select rank, id, first_name, avatar_url, level, total_xp
  from (
    select
      row_number() over (order by total_xp desc, created_at asc) as rank,
      id, first_name, avatar_url, level, total_xp
    from public.profiles
  ) ranked
  order by rank
  limit p_limit;
$$;

-- Position de l'utilisateur courant, même s'il n'est pas dans le top affiché
create or replace function public.get_my_rank()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select rank
  from (
    select id, row_number() over (order by total_xp desc, created_at asc) as rank
    from public.profiles
  ) ranked
  where id = auth.uid();
$$;

grant execute on function public.get_leaderboard(integer) to authenticated;
grant execute on function public.get_my_rank() to authenticated;
