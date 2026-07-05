-- ANTA — Lecture admin sur les tables utilisateur
-- Exécuter dans Supabase : SQL Editor > New query > Run (après 001, 002, 003, 004)
--
-- Sans ceci, un admin ne peut lire que SA PROPRE ligne dans profiles/xp_logs/progress
-- (policy "auth.uid() = id/user_id"), ce qui fait qu'un compteur "inscrits total" ou
-- "actifs 7 jours" calculé côté admin retombe toujours à 1 (sa propre ligne), quel que
-- soit le nombre réel d'utilisateurs.

create policy "Profils visibles par les admins"
  on public.profiles for select
  using (public.is_admin());

create policy "XP logs visibles par les admins"
  on public.xp_logs for select
  using (public.is_admin());

create policy "Progression visible par les admins"
  on public.progress for select
  using (public.is_admin());
