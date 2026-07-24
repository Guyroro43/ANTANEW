-- ANTA — Protection des ressources média + PDF -> cours interactif généré par IA.
--
-- 1) Le bucket lesson-media (vidéo/audio) passe de public à privé : les URLs
--    publiques permanentes permettaient de télécharger/partager librement nos
--    ressources. L'app (web + mobile) génère désormais une URL signée à durée
--    limitée juste avant la lecture, en lecture in-app uniquement.
-- 2) Un nouveau bucket lesson-source, privé et réservé aux admins, stocke les
--    PDF sources : ils ne servent qu'à générer un cours QCM interactif par IA
--    et ne sont jamais exposés aux apprenants.

alter table public.lessons add column if not exists source_pdf_path text;

update storage.buckets set public = false where id = 'lesson-media';

drop policy if exists "Lecture publique des médias de leçon" on storage.objects;
create policy "Lecture médias de leçon par les connectés"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'lesson-media');

insert into storage.buckets (id, name, public)
values ('lesson-source', 'lesson-source', false)
on conflict (id) do nothing;

create policy "Upload PDF source par les admins"
  on storage.objects for insert
  with check (bucket_id = 'lesson-source' and public.is_admin());

create policy "Lecture PDF source par les admins"
  on storage.objects for select
  using (bucket_id = 'lesson-source' and public.is_admin());

create policy "Suppression PDF source par les admins"
  on storage.objects for delete
  using (bucket_id = 'lesson-source' and public.is_admin());

-- Les leçons déjà uploadées stockaient l'URL publique complète : on la
-- convertit en chemin de stockage nu, seul format que l'app sait désormais
-- résoudre en URL signée (le domaine Supabase peut varier, d'où le motif générique).
update public.lessons
set content_url = regexp_replace(content_url, '^https?://[^/]+/storage/v1/object/public/lesson-media/', '')
where content_type in ('video', 'audio')
  and content_url ~ '^https?://[^/]+/storage/v1/object/public/lesson-media/';
