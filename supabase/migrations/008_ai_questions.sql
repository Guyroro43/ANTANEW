-- ANTA — Questions générées par IA + workflow d'approbation admin
-- Exécuter dans Supabase : SQL Editor > New query > Run (après 001 à 007)

alter table public.questions add column if not exists status text not null default 'approved'
  check (status in ('draft', 'approved'));
alter table public.questions add column if not exists source text not null default 'manual'
  check (source in ('manual', 'ai'));

-- La policy 001 ("Questions visibles si leçon visible") laissait n'importe quel
-- utilisateur connecté lire TOUTES les questions, y compris les brouillons IA
-- pas encore relus par un admin (qui peuvent contenir une mauvaise réponse).
-- On la remplace : seules les questions approuvées sont visibles des apprenants.
drop policy if exists "Questions visibles si leçon visible" on public.questions;

create policy "Questions approuvées visibles par les apprenants"
  on public.questions for select
  using (status = 'approved' or public.is_admin());
