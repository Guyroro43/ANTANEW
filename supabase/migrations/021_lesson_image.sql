-- ANTA — Image de couverture pour les leçons (les modules l'ont déjà,
-- migration 001). Même usage : affichée en fond de carte, admin comme
-- apprenant.

alter table public.lessons add column if not exists image_url text;
