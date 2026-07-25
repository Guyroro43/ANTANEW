-- ANTA — Plafonne le niveau déterminé automatiquement à "intermédiaire".
-- Objectif produit : éviter qu'un apprenant se pense déjà "avancé" et
-- perde sa motivation à suivre les leçons. Le niveau réel peut rester
-- calculé en interne (tier3_correct) mais n'est jamais renvoyé au-delà
-- d'intermédiaire.

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

  -- Plafonné à 'intermediaire' : ne jamais annoncer 'avance' pour garder
  -- l'apprenant motivé à suivre les leçons.
  v_level := case
    when v_tier3_correct >= 2 then 'intermediaire'
    when v_tier2_correct >= 2 then 'intermediaire'
    else 'debutant'
  end;

  update public.profiles
  set english_level = v_level, placement_test_completed = true
  where id = auth.uid();

  return query select v_level, v_correct_count, v_total;
end;
$$;
