-- ANTA — Policies admin
-- Exécuter dans Supabase : SQL Editor > New query > Run (après 001_initial_schema.sql)

-- Fonction utilitaire : l'utilisateur courant est-il admin ?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Modules : écriture réservée aux admins (lecture déjà couverte par 001)
create policy "Modules créables par les admins"
  on public.modules for insert
  with check (public.is_admin());

create policy "Modules éditables par les admins"
  on public.modules for update
  using (public.is_admin());

create policy "Modules supprimables par les admins"
  on public.modules for delete
  using (public.is_admin());

-- Leçons
create policy "Leçons créables par les admins"
  on public.lessons for insert
  with check (public.is_admin());

create policy "Leçons éditables par les admins"
  on public.lessons for update
  using (public.is_admin());

create policy "Leçons supprimables par les admins"
  on public.lessons for delete
  using (public.is_admin());

-- Questions
create policy "Questions créables par les admins"
  on public.questions for insert
  with check (public.is_admin());

create policy "Questions éditables par les admins"
  on public.questions for update
  using (public.is_admin());

create policy "Questions supprimables par les admins"
  on public.questions for delete
  using (public.is_admin());
