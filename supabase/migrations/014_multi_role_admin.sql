-- ANTA — Refonte du système admin en 4 rôles (instructor / founder /
-- founder_instructor / developer), remplaçant le rôle unique 'admin'.
-- Voir brief/ANTA_ADMIN_BRIEF.md pour le détail des permissions par rôle.

-- 1) Retirer la contrainte AVANT toute écriture : l'ancienne (user/admin) et la
-- nouvelle liste de rôles sont mutuellement exclusives sur la valeur 'admin' vs
-- 'developer', donc aucune des deux ne doit être active pendant la migration.
alter table public.profiles drop constraint if exists profiles_role_check;

-- 2) Migrer les comptes admin existants.
update public.profiles set role = 'developer' where role = 'admin';

-- 3) Réappliquer la contrainte, élargie aux 4 nouveaux rôles.
alter table public.profiles add constraint profiles_role_check
  check (role in ('user', 'instructor', 'founder', 'founder_instructor', 'developer'));

-- 2) Fonctions de rôle, mêmes conventions que is_admin() (migration 002).
create or replace function public.is_developer()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'developer'
  );
$$;

create or replace function public.is_founder()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('founder', 'founder_instructor')
  );
$$;

create or replace function public.is_instructor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('instructor', 'founder_instructor')
  );
$$;

create or replace function public.can_edit_content()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
      and role in ('instructor', 'founder_instructor', 'developer')
  );
$$;

-- 3) is_admin() devient "a accès à un espace admin" (n'importe lequel des 4
-- rôles) — garde intactes les policies de LECTURE existantes (transactions,
-- xp_logs, progress, profiles) pour tous les rôles admin, y compris founder.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
      and role in ('instructor', 'founder', 'founder_instructor', 'developer')
  );
$$;

-- 4) Resserrer les policies d'ÉCRITURE de contenu : un founder seul ne doit
-- plus pouvoir créer/éditer/supprimer modules, leçons, questions ou médias.
drop policy if exists "Modules créables par les admins" on public.modules;
create policy "Modules créables par les admins" on public.modules for insert
  with check (public.can_edit_content());

drop policy if exists "Modules éditables par les admins" on public.modules;
create policy "Modules éditables par les admins" on public.modules for update
  using (public.can_edit_content());

drop policy if exists "Modules supprimables par les admins" on public.modules;
create policy "Modules supprimables par les admins" on public.modules for delete
  using (public.can_edit_content());

drop policy if exists "Leçons créables par les admins" on public.lessons;
create policy "Leçons créables par les admins" on public.lessons for insert
  with check (public.can_edit_content());

drop policy if exists "Leçons éditables par les admins" on public.lessons;
create policy "Leçons éditables par les admins" on public.lessons for update
  using (public.can_edit_content());

drop policy if exists "Leçons supprimables par les admins" on public.lessons;
create policy "Leçons supprimables par les admins" on public.lessons for delete
  using (public.can_edit_content());

drop policy if exists "Questions créables par les admins" on public.questions;
create policy "Questions créables par les admins" on public.questions for insert
  with check (public.can_edit_content());

drop policy if exists "Questions éditables par les admins" on public.questions;
create policy "Questions éditables par les admins" on public.questions for update
  using (public.can_edit_content());

drop policy if exists "Questions supprimables par les admins" on public.questions;
create policy "Questions supprimables par les admins" on public.questions for delete
  using (public.can_edit_content());

drop policy if exists "Vocabulaire créable par les admins" on public.lesson_vocabulary;
create policy "Vocabulaire créable par les admins" on public.lesson_vocabulary for insert
  with check (public.can_edit_content());

drop policy if exists "Vocabulaire modifiable par les admins" on public.lesson_vocabulary;
create policy "Vocabulaire modifiable par les admins" on public.lesson_vocabulary for update
  using (public.can_edit_content());

drop policy if exists "Vocabulaire supprimable par les admins" on public.lesson_vocabulary;
create policy "Vocabulaire supprimable par les admins" on public.lesson_vocabulary for delete
  using (public.can_edit_content());

drop policy if exists "Upload médias par les admins" on storage.objects;
create policy "Upload médias par les admins" on storage.objects for insert
  with check (bucket_id = 'lesson-media' and public.can_edit_content());

drop policy if exists "Modification médias par les admins" on storage.objects;
create policy "Modification médias par les admins" on storage.objects for update
  using (bucket_id = 'lesson-media' and public.can_edit_content());

drop policy if exists "Suppression médias par les admins" on storage.objects;
create policy "Suppression médias par les admins" on storage.objects for delete
  using (bucket_id = 'lesson-media' and public.can_edit_content());

drop policy if exists "Upload PDF source par les admins" on storage.objects;
create policy "Upload PDF source par les admins" on storage.objects for insert
  with check (bucket_id = 'lesson-source' and public.can_edit_content());

drop policy if exists "Lecture PDF source par les admins" on storage.objects;
create policy "Lecture PDF source par les admins" on storage.objects for select
  using (bucket_id = 'lesson-source' and public.can_edit_content());

drop policy if exists "Suppression PDF source par les admins" on storage.objects;
create policy "Suppression PDF source par les admins" on storage.objects for delete
  using (bucket_id = 'lesson-source' and public.can_edit_content());

-- 5) role_changes : audit des changements de rôle.
create table if not exists public.role_changes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  previous_role text not null,
  new_role text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

alter table public.role_changes enable row level security;

create policy "Historique des rôles visible par les développeurs"
  on public.role_changes for select
  using (public.is_developer());

-- 6) admin_update_profile : le changement de RÔLE exige désormais le rôle
-- developer (pas juste is_admin()) ; le changement de plan reste sur
-- is_admin(). On journalise chaque changement de rôle réussi.
create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_role text default null,
  p_subscription_plan text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous_role text;
begin
  if p_role is not null then
    if not public.is_developer() then
      raise exception 'Seul le développeur peut changer un rôle.';
    end if;

    select role into v_previous_role from public.profiles where id = p_user_id;

    if v_previous_role is distinct from p_role then
      insert into public.role_changes (user_id, previous_role, new_role, changed_by)
      values (p_user_id, v_previous_role, p_role, auth.uid());
    end if;
  elsif p_subscription_plan is not null then
    if not public.is_admin() then
      raise exception 'Accès réservé aux admins.';
    end if;
  end if;

  update public.profiles
  set
    role = coalesce(p_role, role),
    subscription_plan = coalesce(p_subscription_plan, subscription_plan)
  where id = p_user_id;
end;
$$;

-- 7) Difficulté d'un module (barres façon signal réseau côté UI).
alter table public.modules add column if not exists difficulty smallint not null default 1
  check (difficulty between 1 and 3);
