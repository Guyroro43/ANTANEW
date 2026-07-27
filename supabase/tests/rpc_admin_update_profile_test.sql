-- Tests ciblés sur admin_update_profile() : le changement de RÔLE exige le
-- rôle developer (pas juste un accès admin quelconque), le changement de
-- PLAN d'abonnement exige au moins un accès admin, et chaque changement de
-- rôle réel (pas un no-op) est journalisé une seule fois dans role_changes.
BEGIN;
SELECT plan(9);

insert into auth.users (id, email) values
  ('c0000000-0000-0000-0000-000000000001', 'rpc-learner@anta.test'),
  ('c0000000-0000-0000-0000-000000000002', 'rpc-founder@anta.test'),
  ('c0000000-0000-0000-0000-000000000003', 'rpc-developer@anta.test'),
  ('c0000000-0000-0000-0000-000000000004', 'rpc-learner-2@anta.test');

update public.profiles set role = 'founder' where id = 'c0000000-0000-0000-0000-000000000002';
update public.profiles set role = 'developer' where id = 'c0000000-0000-0000-0000-000000000003';

-- 1) Un fondateur (non développeur) ne peut pas changer le rôle d'un autre utilisateur.
select set_config('request.jwt.claim.sub', 'c0000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.admin_update_profile('c0000000-0000-0000-0000-000000000001', 'instructor', null) $$,
  'P0001',
  'Seul le développeur peut changer un rôle.',
  'Un fondateur ne peut pas changer le rôle d''un autre utilisateur'
);
reset role;

-- 2) Un développeur peut changer le rôle d'un utilisateur.
select set_config('request.jwt.claim.sub', 'c0000000-0000-0000-0000-000000000003', true);
set local role authenticated;
select lives_ok(
  $$ select public.admin_update_profile('c0000000-0000-0000-0000-000000000001', 'instructor', null) $$,
  'Un développeur peut changer le rôle d''un utilisateur'
);
reset role;

-- 3) Le rôle a bien été mis à jour en base.
select is(
  (select role from public.profiles where id = 'c0000000-0000-0000-0000-000000000001'),
  'instructor',
  'Le rôle a été mis à jour en base'
);

-- 4) Le changement a été journalisé dans role_changes.
select is(
  (select count(*) from public.role_changes
     where user_id = 'c0000000-0000-0000-0000-000000000001'
       and previous_role = 'user' and new_role = 'instructor')::int,
  1,
  'Le changement de rôle a été journalisé'
);

-- 5) Rejouer le même changement de rôle (no-op) ne doit pas lever d'erreur...
select set_config('request.jwt.claim.sub', 'c0000000-0000-0000-0000-000000000003', true);
set local role authenticated;
select lives_ok(
  $$ select public.admin_update_profile('c0000000-0000-0000-0000-000000000001', 'instructor', null) $$,
  'Rejouer le même rôle ne lève pas d''erreur'
);
reset role;

-- 6) ... et ne doit pas dupliquer l'entrée d'audit.
select is(
  (select count(*) from public.role_changes where user_id = 'c0000000-0000-0000-0000-000000000001')::int,
  1,
  'Un changement de rôle identique au précédent n''ajoute pas de doublon d''audit'
);

-- 7) Un apprenant ne peut pas changer son propre plan d'abonnement.
-- (Nouvel apprenant dédié : c...001 a été promu "instructor" au test 2, donc
-- réutiliser son id ici testerait un instructeur, pas un apprenant.)
select set_config('request.jwt.claim.sub', 'c0000000-0000-0000-0000-000000000004', true);
set local role authenticated;
select throws_ok(
  $$ select public.admin_update_profile('c0000000-0000-0000-0000-000000000004', null, 'premium') $$,
  'P0001',
  'Accès réservé aux admins.',
  'Un apprenant ne peut pas changer un plan d''abonnement'
);
reset role;

-- 8) Un fondateur (is_admin() = true depuis la migration 014) peut changer un plan.
select set_config('request.jwt.claim.sub', 'c0000000-0000-0000-0000-000000000002', true);
set local role authenticated;
select lives_ok(
  $$ select public.admin_update_profile('c0000000-0000-0000-0000-000000000001', null, 'premium') $$,
  'Un fondateur peut changer un plan d''abonnement'
);
reset role;

-- 9) Le plan a bien été mis à jour.
select is(
  (select subscription_plan from public.profiles where id = 'c0000000-0000-0000-0000-000000000001'),
  'premium',
  'Le plan d''abonnement a été mis à jour'
);

SELECT * FROM finish();
ROLLBACK;
