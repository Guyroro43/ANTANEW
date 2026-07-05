-- ANTA — Schéma initial
-- Exécuter dans Supabase : SQL Editor > New query > Run

-- Extensions
create extension if not exists "uuid-ossp";

-- Profils utilisateurs (lié à auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  full_name text generated always as (first_name) stored,
  avatar_url text,
  english_level text not null default 'debutant' check (english_level in ('debutant', 'intermediaire', 'avance')),
  country text default 'CI',
  role text not null default 'user' check (role in ('user', 'admin')),
  level text not null default 'Lionceau',
  total_xp integer not null default 0 check (total_xp >= 0),
  subscription_plan text not null default 'starter' check (subscription_plan in ('starter', 'premium')),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Modules pédagogiques
create table if not exists public.modules (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text,
  is_premium boolean not null default false,
  xp_reward integer not null default 50 check (xp_reward >= 0),
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Leçons
create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  category text,
  difficulty text default 'debutant',
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Questions QCM
create table if not exists public.questions (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index integer not null default 0,
  explanation text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Progression par leçon
create table if not exists public.progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  score integer not null default 0 check (score >= 0 and score <= 5),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- Streaks
create table if not exists public.streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Journal XP
create table if not exists public.xp_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  xp_earned integer not null check (xp_earned > 0),
  reason text not null,
  created_at timestamptz not null default now()
);

-- Badges Adinkra
create table if not exists public.badges (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null default '🏅',
  xp_required integer,
  created_at timestamptz not null default now()
);

-- Badges obtenus
create table if not exists public.user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- Trigger : créer profil + streak à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, english_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'english_level', 'debutant')
  );

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger : updated_at sur profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.progress enable row level security;
alter table public.streaks enable row level security;
alter table public.xp_logs enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Policies profiles
create policy "Profils visibles par le propriétaire"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profils modifiables par le propriétaire"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies contenu public (lecture pour tous les connectés)
create policy "Modules publiés visibles"
  on public.modules for select
  using (is_published = true or auth.role() = 'authenticated');

create policy "Leçons publiées visibles"
  on public.lessons for select
  using (is_published = true or auth.role() = 'authenticated');

create policy "Questions visibles si leçon visible"
  on public.questions for select
  using (auth.role() = 'authenticated');

-- Policies progression personnelle
create policy "Progression personnelle"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Streak personnelle"
  on public.streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "XP logs personnels"
  on public.xp_logs for select
  using (auth.uid() = user_id);

create policy "XP logs insertion personnelle"
  on public.xp_logs for insert
  with check (auth.uid() = user_id);

-- Policies badges
create policy "Badges visibles par tous"
  on public.badges for select
  using (true);

create policy "User badges personnels"
  on public.user_badges for select
  using (auth.uid() = user_id);

-- Badges de départ
insert into public.badges (slug, name, description, icon, xp_required) values
  ('eclair-or', 'Éclair d''Or', 'Première leçon complétée', '⚡', null),
  ('flamme-vivace', 'Flamme Vivace', '3 jours de streak consécutifs', '🔥', null),
  ('etoile-noire', 'Étoile Noire', '100 XP atteints', '⭐', 100),
  ('champion', 'Champion', 'Score parfait sur 5 leçons', '🏆', null),
  ('leopard-or', 'Léopard d''Or', '300 XP atteints', '🐆', 300),
  ('diamant', 'Diamant', '10 jours de streak consécutifs', '💎', null),
  ('roi-savane', 'Roi de la Savane', '1 000 XP atteints', '👑', 1000),
  ('citoyen-monde', 'Citoyen du Monde', '1 500 XP atteints', '🌍', 1500)
on conflict (slug) do nothing;

-- Modules MVP (gratuits)
insert into public.modules (slug, title, description, is_premium, xp_reward, order_index, is_published) values
  ('salutations-premiers-contacts', 'Salutations & Premiers contacts', 'Apprends à te présenter et saluer en anglais dans des situations du quotidien africain.', false, 50, 1, true),
  ('anglais-professionnel-base', 'Anglais professionnel de base', 'Emails, réunions et expressions utiles pour le monde du travail.', false, 70, 2, true)
on conflict (slug) do nothing;
