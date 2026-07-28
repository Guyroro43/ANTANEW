-- ANTA — XP proportionnel au résultat de la leçon (0 faute = XP maximum
-- alloué au module, moins de bonnes réponses = moins de XP), plutôt que le
-- XP plein quel que soit le score. On garde le nombre de questions de la
-- tentative pour calculer le pourcentage côté serveur (pas de confiance
-- dans un pourcentage calculé côté client).

alter table public.progress add column if not exists max_score integer;

create or replace function public.complete_lesson(p_lesson_id uuid, p_score integer default null, p_max_score integer default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_module_id uuid;
  v_access_level text;
  v_subscription_plan text;
  v_module_xp_reward integer;
  v_xp_earned integer;
  v_already_completed boolean;
  v_today date := current_date;
  v_last_activity date;
  v_current_streak integer;
  v_longest_streak integer;
  v_new_total_xp integer;
  v_completed_count integer;
  v_perfect_count integer;
  v_badge_slug text;
  v_badge_unlocked boolean;
  v_new_badges jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Non authentifié';
  end if;

  select module_id, access_level into v_module_id, v_access_level from public.lessons where id = p_lesson_id;
  if v_module_id is null then
    raise exception 'Leçon introuvable';
  end if;

  select subscription_plan into v_subscription_plan from public.profiles where id = v_user_id;
  if v_access_level = 'premium' and coalesce(v_subscription_plan, 'starter') <> 'premium' then
    raise exception 'Cette leçon nécessite un abonnement premium.';
  end if;

  select xp_reward into v_module_xp_reward from public.modules where id = v_module_id;

  -- Leçon sans quiz noté (vidéo/audio sans questions, etc.) : XP plein.
  -- Leçon avec quiz : XP proportionnel au score, arrondi, 0 faute = XP plein.
  if p_max_score is null or p_max_score <= 0 then
    v_xp_earned := coalesce(v_module_xp_reward, 0);
  else
    v_xp_earned := round(coalesce(v_module_xp_reward, 0) * (greatest(coalesce(p_score, 0), 0)::numeric / p_max_score));
  end if;

  select exists(
    select 1 from public.progress where user_id = v_user_id and lesson_id = p_lesson_id and completed = true
  ) into v_already_completed;

  insert into public.progress (user_id, lesson_id, completed, score, max_score, completed_at)
  values (v_user_id, p_lesson_id, true, coalesce(p_score, 5), p_max_score, now())
  on conflict (user_id, lesson_id)
  do update set
    completed = true,
    score = coalesce(p_score, public.progress.score),
    max_score = coalesce(p_max_score, public.progress.max_score),
    completed_at = now();

  if not v_already_completed then
    insert into public.xp_logs (user_id, xp_earned, reason)
    values (v_user_id, v_xp_earned, 'Leçon complétée');

    update public.profiles
    set total_xp = total_xp + v_xp_earned
    where id = v_user_id
    returning total_xp into v_new_total_xp;
  else
    v_xp_earned := 0;
    select total_xp into v_new_total_xp from public.profiles where id = v_user_id;
  end if;

  insert into public.streaks (user_id) values (v_user_id) on conflict (user_id) do nothing;

  select last_activity_date, current_streak, longest_streak
    into v_last_activity, v_current_streak, v_longest_streak
    from public.streaks where user_id = v_user_id;

  if v_last_activity is null or v_last_activity < v_today then
    if v_last_activity = v_today - 1 then
      v_current_streak := coalesce(v_current_streak, 0) + 1;
    else
      v_current_streak := 1;
    end if;
    v_longest_streak := greatest(coalesce(v_longest_streak, 0), v_current_streak);

    update public.streaks
    set current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = now()
    where user_id = v_user_id;
  end if;

  select count(*) into v_completed_count from public.progress where user_id = v_user_id and completed = true;
  select count(*) into v_perfect_count
    from public.progress
    where user_id = v_user_id and completed = true and max_score > 0 and score = max_score;

  -- Pour chaque badge potentiellement débloqué par cette complétion, on vérifie s'il
  -- était déjà acquis ; si non et que la condition est remplie, on l'attribue et on
  -- l'ajoute à v_new_badges pour que le frontend puisse l'afficher en fin de leçon.
  for v_badge_slug, v_badge_unlocked in
    select * from (values
      ('etoile-noire', v_new_total_xp >= 100),
      ('leopard-or', v_new_total_xp >= 300),
      ('roi-savane', v_new_total_xp >= 1000),
      ('citoyen-monde', v_new_total_xp >= 1500),
      ('flamme-vivace', v_current_streak >= 3),
      ('diamant', v_current_streak >= 10),
      ('eclair-or', v_completed_count >= 1),
      ('champion', v_perfect_count >= 5)
    ) as t(slug, unlocked)
  loop
    if v_badge_unlocked and not exists (
      select 1 from public.user_badges ub
      join public.badges b on b.id = ub.badge_id
      where ub.user_id = v_user_id and b.slug = v_badge_slug
    ) then
      insert into public.user_badges (user_id, badge_id)
      select v_user_id, id from public.badges where slug = v_badge_slug
      on conflict (user_id, badge_id) do nothing;

      select v_new_badges || jsonb_build_object('slug', b.slug, 'name', b.name, 'icon', b.icon)
        into v_new_badges
        from public.badges b where b.slug = v_badge_slug;
    end if;
  end loop;

  return jsonb_build_object(
    'xp_earned', v_xp_earned,
    'total_xp', v_new_total_xp,
    'current_streak', v_current_streak,
    'new_badges', v_new_badges
  );
end;
$$;
