-- ANTA — Résumé de progression personnalisé (IA), mis en cache sur le
-- profil pour éviter un appel IA à chaque chargement du dashboard.
-- Régénéré uniquement quand il devient obsolète (voir src/lib/progressSummary.ts).

alter table public.profiles add column if not exists progress_summary text;
alter table public.profiles add column if not exists progress_summary_generated_at timestamptz;

-- L'utilisateur peut mettre à jour ce cache sur sa propre ligne (la policy
-- UPDATE existante restreint déjà aux lignes où auth.uid() = id) ; aucun
-- risque d'escalade de privilège, ce ne sont que des colonnes de cache texte.
grant update (progress_summary, progress_summary_generated_at) on public.profiles to authenticated;
