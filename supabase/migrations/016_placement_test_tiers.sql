-- ANTA — Durcit le test de niveau : 3 paliers de difficulté explicites
-- (1=simple, 2=difficile, 3=ultra-complexe) au lieu d'un simple compte de
-- bonnes réponses, et remplace les questions "ultra-complexe" par du
-- vrai niveau avancé (grammaire C1) pour éviter d'obtenir "avancé"
-- trop facilement.

-- 1) Colonne de difficulté, déduite de l'ordre existant (1-2 simple,
-- 3-4 difficile, 5-6 ultra-complexe — même structure pour les 6 sujets).
alter table public.placement_questions add column if not exists difficulty smallint not null default 2
  check (difficulty between 1 and 3);

update public.placement_questions set difficulty = case
  when order_index in (1, 2) then 1
  when order_index in (3, 4) then 2
  else 3
end;

-- 2) Remplace les questions "ultra-complexe" (order_index 5 et 6) de
-- chaque sujet par des points de grammaire réellement avancés :
-- inversion, conditionnel mixte/3, subjonctif, causatif passif, cleft
-- sentence, souhait au passé.

update public.placement_questions set
  question_text = 'Complete: Not until we had boarded the plane ___ that we had left our passports at the hotel.',
  options = '["we realized", "did we realize", "we did realize", "did we realized"]',
  correct_index = 1
where topic = 'Voyage & Aéroport' and order_index = 5;

update public.placement_questions set
  question_text = 'Complete (causatif passif): Before the trip, I ___ my passport renewed at the embassy.',
  options = '["had", "made", "did", "let"]',
  correct_index = 0
where topic = 'Voyage & Aéroport' and order_index = 6;

update public.placement_questions set
  question_text = 'Complete: If I ___ about the privacy risks earlier, I would never have shared my location online.',
  options = '["knew", "had known", "have known", "would know"]',
  correct_index = 1
where topic = 'Réseaux sociaux & Technologie' and order_index = 5;

update public.placement_questions set
  question_text = 'Choose the correct sentence:',
  options = '["Hardly had I posted the photo when it went viral.", "Hardly I had posted the photo when it went viral.", "Hardly did I posted the photo when it went viral.", "Hardly I posted the photo when it went viral."]',
  correct_index = 0
where topic = 'Réseaux sociaux & Technologie' and order_index = 6;

update public.placement_questions set
  question_text = 'Complete (cleft sentence): It was the smell of fresh bread ___ reminded her of her grandmother''s kitchen.',
  options = '["who", "which", "that", "what"]',
  correct_index = 2
where topic = 'Cuisine & Marché' and order_index = 5;

update public.placement_questions set
  question_text = 'Complete: By the time the guests arrive, the chef ___ dinner for three hours.',
  options = '["cooks", "will cook", "will have been cooking", "was cooking"]',
  correct_index = 2
where topic = 'Cuisine & Marché' and order_index = 6;

update public.placement_questions set
  question_text = 'Complete: ___ he trained harder, he would have made the national team.',
  options = '["If", "Had", "When", "Unless"]',
  correct_index = 1
where topic = 'Sport & Football' and order_index = 5;

update public.placement_questions set
  question_text = 'Choose the correct sentence:',
  options = '["It is high time the referee made a decision.", "It is high time the referee makes a decision.", "It is high time the referee will make a decision.", "It is high time the referee is making a decision."]',
  correct_index = 0
where topic = 'Sport & Football' and order_index = 6;

update public.placement_questions set
  question_text = 'Complete: Rarely ___ such heavy traffic on this road before 6 a.m.',
  options = '["we have seen", "have we seen", "we saw", "did we saw"]',
  correct_index = 1
where topic = 'Vie quotidienne & Transport' and order_index = 5;

update public.placement_questions set
  question_text = 'Complete: The road works, ___ caused massive delays, are expected to finish next month.',
  options = '["that", "which", "who", "whom"]',
  correct_index = 1
where topic = 'Vie quotidienne & Transport' and order_index = 6;

update public.placement_questions set
  question_text = 'Complete: I wish I ___ harder for my exams instead of going out every weekend.',
  options = '["studied", "had studied", "have studied", "would study"]',
  correct_index = 1
where topic = 'Amis & Famille' and order_index = 5;

update public.placement_questions set
  question_text = 'Choose the correct sentence:',
  options = '["She suggested that he should apologize to his brother.", "She suggested that he apologizes to his brother.", "She suggested him to apologize to his brother.", "She suggested that he will apologize to his brother."]',
  correct_index = 0
where topic = 'Amis & Famille' and order_index = 6;

-- 3) Notation par palier au lieu d'un simple total : il faut réussir
-- les 2 questions "ultra-complexe" pour être noté "avancé", les 2
-- "difficile" pour être noté "intermédiaire" (sans quoi, "débutant").
-- Beaucoup plus sévère qu'un seuil global sur 6.
create or replace function public.submit_placement_test(p_answers jsonb)
returns table(level text, correct_count int, total int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topic text;
  v_correct_count int := 0;
  v_total int;
  v_tier2_correct int := 0;
  v_tier3_correct int := 0;
  v_level text;
  v_answer jsonb;
  v_question_id uuid;
  v_selected int;
  v_correct_index int;
  v_difficulty int;
begin
  select placement_topic into v_topic from public.profiles where id = auth.uid();
  if v_topic is null then
    raise exception 'Aucun test de niveau en cours pour cet utilisateur.';
  end if;

  select count(*) into v_total from public.placement_questions where topic = v_topic;

  for v_answer in select * from jsonb_array_elements(p_answers)
  loop
    v_question_id := (v_answer->>'question_id')::uuid;
    v_selected := nullif(v_answer->>'selected_index', '')::int;

    select correct_index, difficulty into v_correct_index, v_difficulty
    from public.placement_questions
    where id = v_question_id and topic = v_topic;

    if v_correct_index is not null and v_selected = v_correct_index then
      v_correct_count := v_correct_count + 1;
      if v_difficulty = 2 then
        v_tier2_correct := v_tier2_correct + 1;
      elsif v_difficulty = 3 then
        v_tier3_correct := v_tier3_correct + 1;
      end if;
    end if;
  end loop;

  v_level := case
    when v_tier3_correct >= 2 then 'avance'
    when v_tier2_correct >= 2 then 'intermediaire'
    else 'debutant'
  end;

  update public.profiles
  set english_level = v_level, placement_test_completed = true
  where id = auth.uid();

  return query select v_level, v_correct_count, v_total;
end;
$$;
