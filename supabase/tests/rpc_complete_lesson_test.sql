-- Tests ciblés sur complete_lesson() : blocage d'une leçon premium pour un
-- plan starter (faille corrigée en 010), idempotence de l'XP (pas de double
-- gain en recomplétant la même leçon) et déblocage de badge à la première
-- complétion.
BEGIN;
SELECT plan(12);

insert into auth.users (id, email) values
  ('f0000000-0000-0000-0000-000000000001', 'lesson-learner@anta.test');

insert into public.modules (id, slug, title, xp_reward, is_published) values
  ('f1000000-0000-0000-0000-000000000001', 'test-module-completion', 'Module test complétion', 50, true);

insert into public.lessons (id, module_id, title, access_level, is_published) values
  ('f2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Leçon gratuite', 'free', true),
  ('f2000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'Leçon premium', 'premium', true);

select set_config('request.jwt.claim.sub', 'f0000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

-- 1) Une leçon premium est bloquée pour un plan starter.
select throws_ok(
  $$ select public.complete_lesson('f2000000-0000-0000-0000-000000000002', 5) $$,
  'P0001',
  'Cette leçon nécessite un abonnement premium.',
  'Une leçon premium est bloquée pour un plan starter'
);

-- 2) La leçon gratuite se complète normalement.
select lives_ok(
  $$ select public.complete_lesson('f2000000-0000-0000-0000-000000000001', 5) $$,
  'La leçon gratuite se complète sans erreur'
);
reset role;

-- 3) La progression est bien enregistrée.
select is(
  (select completed from public.progress
     where user_id = 'f0000000-0000-0000-0000-000000000001' and lesson_id = 'f2000000-0000-0000-0000-000000000001'),
  true,
  'La progression est marquée complétée'
);

-- 4) L'XP a été journalisé une seule fois.
select is(
  (select count(*) from public.xp_logs where user_id = 'f0000000-0000-0000-0000-000000000001')::int,
  1,
  'Une seule ligne XP journalisée après la première complétion'
);

-- 5) Le total XP du profil reflète l'xp_reward du module.
select is(
  (select total_xp from public.profiles where id = 'f0000000-0000-0000-0000-000000000001'),
  50,
  'Le total XP est incrémenté du xp_reward du module'
);

-- 6) Le badge "Éclair d'Or" (première leçon complétée) est débloqué.
select is(
  (select count(*) from public.user_badges ub join public.badges b on b.id = ub.badge_id
     where ub.user_id = 'f0000000-0000-0000-0000-000000000001' and b.slug = 'eclair-or')::int,
  1,
  'Le badge "Éclair d''Or" est débloqué à la première complétion'
);

-- 7) Recompléter la même leçon ne doit pas planter (idempotent côté RPC).
select set_config('request.jwt.claim.sub', 'f0000000-0000-0000-0000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$ select public.complete_lesson('f2000000-0000-0000-0000-000000000001', 5) $$,
  'Recompléter la même leçon ne lève pas d''erreur'
);
reset role;

-- 8) ... mais ne journalise pas d'XP supplémentaire.
select is(
  (select count(*) from public.xp_logs where user_id = 'f0000000-0000-0000-0000-000000000001')::int,
  1,
  'Aucune ligne XP supplémentaire à la deuxième complétion de la même leçon'
);

-- 9) ... et le total XP reste inchangé.
select is(
  (select total_xp from public.profiles where id = 'f0000000-0000-0000-0000-000000000001'),
  50,
  'Le total XP reste inchangé après une double complétion'
);

-- 10) Après passage au plan premium, la leçon premium devient accessible.
update public.profiles set subscription_plan = 'premium' where id = 'f0000000-0000-0000-0000-000000000001';

select set_config('request.jwt.claim.sub', 'f0000000-0000-0000-0000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$ select public.complete_lesson('f2000000-0000-0000-0000-000000000002', 5) $$,
  'La leçon premium se complète une fois le plan premium actif'
);
reset role;

-- 11) Un deuxième log XP est ajouté pour cette nouvelle leçon.
select is(
  (select count(*) from public.xp_logs where user_id = 'f0000000-0000-0000-0000-000000000001')::int,
  2,
  'Un deuxième log XP est ajouté pour la leçon premium'
);

-- 12) Le total XP cumule les deux leçons complétées.
select is(
  (select total_xp from public.profiles where id = 'f0000000-0000-0000-0000-000000000001'),
  100,
  'Le total XP cumule les deux leçons complétées'
);

SELECT * FROM finish();
ROLLBACK;
