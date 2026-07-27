-- Tests ciblés sur submit_placement_test() : notation par palier de
-- difficulté (migration 016) avec plafonnement à "intermediaire" (migration
-- 017, jamais "avance", pour garder l'apprenant motivé), et refus de
-- soumission sans sujet de test assigné.
BEGIN;
SELECT plan(6);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'placement-learner@anta.test'),
  ('e0000000-0000-0000-0000-000000000002', 'placement-no-topic@anta.test');

update public.profiles set placement_topic = 'PGTAP_TEST_TOPIC' where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.placement_questions (id, topic, order_index, question_text, options, correct_index, difficulty) values
  ('d0000000-0000-0000-0000-000000000001', 'PGTAP_TEST_TOPIC', 1, 'Q1', '["A","B","C","D"]', 0, 1),
  ('d0000000-0000-0000-0000-000000000002', 'PGTAP_TEST_TOPIC', 2, 'Q2', '["A","B","C","D"]', 0, 1),
  ('d0000000-0000-0000-0000-000000000003', 'PGTAP_TEST_TOPIC', 3, 'Q3', '["A","B","C","D"]', 0, 2),
  ('d0000000-0000-0000-0000-000000000004', 'PGTAP_TEST_TOPIC', 4, 'Q4', '["A","B","C","D"]', 0, 2),
  ('d0000000-0000-0000-0000-000000000005', 'PGTAP_TEST_TOPIC', 5, 'Q5', '["A","B","C","D"]', 0, 3),
  ('d0000000-0000-0000-0000-000000000006', 'PGTAP_TEST_TOPIC', 6, 'Q6', '["A","B","C","D"]', 0, 3);

select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

-- 1) Score parfait : plafonné à "intermediaire" malgré 2 réponses "ultra-complexe" correctes.
select is(
  (select level from public.submit_placement_test(
    '[
      {"question_id":"d0000000-0000-0000-0000-000000000001","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000002","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000003","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000004","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000005","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000006","selected_index":0}
    ]'::jsonb
  )),
  'intermediaire',
  'Score parfait plafonné à "intermediaire" (jamais "avance")'
);

-- 2) Les 6 bonnes réponses sont bien comptées, indépendamment du niveau retenu.
select is(
  (select correct_count from public.submit_placement_test(
    '[
      {"question_id":"d0000000-0000-0000-0000-000000000001","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000002","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000003","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000004","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000005","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000006","selected_index":0}
    ]'::jsonb
  ))::int,
  6,
  'Les 6 bonnes réponses sont bien comptées'
);

-- 3) Seules les questions "simples" (tier 1) correctes -> "debutant".
select is(
  (select level from public.submit_placement_test(
    '[
      {"question_id":"d0000000-0000-0000-0000-000000000001","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000002","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000003","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000004","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000005","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000006","selected_index":1}
    ]'::jsonb
  )),
  'debutant',
  'Seules les questions simples correctes -> "debutant"'
);

-- 4) Les 2 questions "difficile" (tier 2) correctes suffisent pour "intermediaire".
select is(
  (select level from public.submit_placement_test(
    '[
      {"question_id":"d0000000-0000-0000-0000-000000000001","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000002","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000003","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000004","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000005","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000006","selected_index":1}
    ]'::jsonb
  )),
  'intermediaire',
  'Les 2 questions "difficile" correctes suffisent pour "intermediaire"'
);

-- 5) Une seule question "ultra-complexe" (tier 3) correcte ne suffit pas (il en faut 2).
select is(
  (select level from public.submit_placement_test(
    '[
      {"question_id":"d0000000-0000-0000-0000-000000000001","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000002","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000003","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000004","selected_index":1},
      {"question_id":"d0000000-0000-0000-0000-000000000005","selected_index":0},
      {"question_id":"d0000000-0000-0000-0000-000000000006","selected_index":1}
    ]'::jsonb
  )),
  'debutant',
  'Une seule question "ultra-complexe" correcte ne suffit pas -> "debutant"'
);

reset role;

-- 6) Un utilisateur sans sujet de test assigné ne peut pas soumettre.
select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000002', true);
set local role authenticated;
select throws_ok(
  $$ select public.submit_placement_test('[]'::jsonb) $$,
  'P0001',
  'Aucun test de niveau en cours pour cet utilisateur.',
  'Impossible de soumettre sans sujet de test assigné'
);
reset role;

SELECT * FROM finish();
ROLLBACK;
