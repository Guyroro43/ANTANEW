-- Tests RLS ciblés sur le critique : écriture de contenu réservée à
-- can_edit_content() (un founder seul ne doit plus pouvoir éditer), la
-- faille de privilège corrigée en 009 (un user ne peut pas changer son
-- propre rôle), et la messagerie interne (accès admin-only + expiration 24h).
BEGIN;
SELECT plan(12);

-- Fixtures : un compte par rôle pertinent, la messagerie et l'historique des
-- rôles. Tout est inséré ICI, avant tout changement de rôle Postgres, pour
-- rester dans le contexte superuser (bypass RLS/grants) — un INSERT brut
-- exécuté après un `set local role authenticated` hériterait des
-- restrictions de ce rôle au lieu du contexte de départ.
insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-000000000001', 'rls-learner@anta.test'),
  ('a0000000-0000-0000-0000-000000000002', 'rls-instructor@anta.test'),
  ('a0000000-0000-0000-0000-000000000003', 'rls-founder@anta.test'),
  ('a0000000-0000-0000-0000-000000000004', 'rls-developer@anta.test');

update public.profiles set role = 'instructor' where id = 'a0000000-0000-0000-0000-000000000002';
update public.profiles set role = 'founder' where id = 'a0000000-0000-0000-0000-000000000003';
update public.profiles set role = 'developer' where id = 'a0000000-0000-0000-0000-000000000004';

insert into public.messages (id, author_id, content, created_at) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Message récent', now()),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Message expiré', now() - interval '25 hours');

insert into public.role_changes (user_id, previous_role, new_role, changed_by)
values ('a0000000-0000-0000-0000-000000000001', 'user', 'instructor', 'a0000000-0000-0000-0000-000000000004');

-- 1) Un apprenant ne peut pas créer de module.
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ insert into public.modules (slug, title) values ('test-learner', 'Test learner') $$,
  'Un apprenant ne peut pas créer de module'
);
reset role;

-- 2) Un instructeur peut créer un module.
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000002', true);
set local role authenticated;
select lives_ok(
  $$ insert into public.modules (slug, title) values ('test-instructor', 'Test instructor') $$,
  'Un instructeur peut créer un module'
);
reset role;

-- 3) Un fondateur seul ne peut pas créer de module (resserré en 014 : can_edit_content()).
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000003', true);
set local role authenticated;
select throws_ok(
  $$ insert into public.modules (slug, title) values ('test-founder', 'Test founder') $$,
  'Un fondateur seul ne peut pas créer de module'
);
reset role;

-- 4) Un développeur peut créer un module.
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000004', true);
set local role authenticated;
select lives_ok(
  $$ insert into public.modules (slug, title) values ('test-developer', 'Test developer') $$,
  'Un développeur peut créer un module'
);
reset role;

-- 5) Un apprenant ne peut pas modifier son propre rôle (faille corrigée en 009).
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
set local role authenticated;
select throws_ok(
  $$ update public.profiles set role = 'developer' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  'Un apprenant ne peut pas modifier son propre rôle'
);

-- 6) ... mais peut modifier notifications_enabled (seule colonne autorisée).
select lives_ok(
  $$ update public.profiles set notifications_enabled = false where id = 'a0000000-0000-0000-0000-000000000001' $$,
  'Un apprenant peut modifier notifications_enabled'
);
reset role;

-- 7) Le rôle est resté inchangé après la tentative bloquée.
select is(
  (select role from public.profiles where id = 'a0000000-0000-0000-0000-000000000001'),
  'user',
  'Le rôle de l''apprenant reste "user" après la tentative bloquée'
);

-- 8) Un apprenant ne voit aucun message (pas admin).
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
set local role authenticated;
select is(
  (select count(*) from public.messages)::int, 0,
  'Un apprenant ne voit aucun message de la messagerie interne'
);

-- 9) Un apprenant ne peut pas poster de message.
select throws_ok(
  $$ insert into public.messages (author_id, content) values ('a0000000-0000-0000-0000-000000000001', 'Coucou') $$,
  'Un apprenant ne peut pas poster de message'
);
reset role;

-- 10) Un instructeur ne voit que le message de moins de 24h.
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000002', true);
set local role authenticated;
select is(
  (select count(*) from public.messages)::int, 1,
  'Un instructeur ne voit que les messages de moins de 24h'
);
reset role;

-- 11) Un instructeur ne peut pas lire l'historique des changements de rôle.
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000002', true);
set local role authenticated;
select is(
  (select count(*) from public.role_changes)::int, 0,
  'Un instructeur ne peut pas lire l''historique des changements de rôle'
);
reset role;

-- 12) Un développeur peut lire l'historique des changements de rôle.
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000004', true);
set local role authenticated;
select is(
  (select count(*) from public.role_changes)::int, 1,
  'Un développeur peut lire l''historique des changements de rôle'
);
reset role;

SELECT * FROM finish();
ROLLBACK;
