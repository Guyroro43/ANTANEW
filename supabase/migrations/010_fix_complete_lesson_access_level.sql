-- ANTA — Correction faille : complete_lesson() attribuait XP/streak/badges
-- pour n'importe quelle leçon, y compris les leçons premium, sans vérifier le
-- plan d'abonnement de l'appelant. On aligne la RPC sur la même règle que
-- src/app/lecon/[id]/page.tsx (lesson.access_level = 'premium' && plan != 'premium').

create or replace function public.complete_lesson(p_lesson_id uuid, p_score integer default null)
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
  v_xp_reward integer;
  v_already_completed boolean;
  v_today date := current_date;
  v_last_activity date;
  v_current_streak integer;
  v_longest_streak integer;
  v_new_total_xp integer;
  v_completed_count integer;
  v_score5_count integer;
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

  select xp_reward into v_xp_reward from public.modules where id = v_module_id;

  select exists(
    select 1 from public.progress where user_id = v_user_id and lesson_id = p_lesson_id and completed = true
  ) into v_already_completed;

  insert into public.progress (user_id, lesson_id, completed, score, completed_at)
  values (v_user_id, p_lesson_id, true, coalesce(p_score, 5), now())
  on conflict (user_id, lesson_id)
  do update set
    completed = true,
    score = coalesce(p_score, public.progress.score),
    completed_at = now();

  if not v_already_completed then
    insert into public.xp_logs (user_id, xp_earned, reason)
    values (v_user_id, coalesce(v_xp_reward, 0), 'Leçon complétée');

    update public.profiles
    set total_xp = total_xp + coalesce(v_xp_reward, 0)
    where id = v_user_id
    returning total_xp into v_new_total_xp;
  else
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

  -- Badges liés à l'XP total
  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'etoile-noire' and v_new_total_xp >= 100
  on conflict (user_id, badge_id) do nothing;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'leopard-or' and v_new_total_xp >= 300
  on conflict (user_id, badge_id) do nothing;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'roi-savane' and v_new_total_xp >= 1000
  on conflict (user_id, badge_id) do nothing;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'citoyen-monde' and v_new_total_xp >= 1500
  on conflict (user_id, badge_id) do nothing;

  -- Badges liés au streak
  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'flamme-vivace' and v_current_streak >= 3
  on conflict (user_id, badge_id) do nothing;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'diamant' and v_current_streak >= 10
  on conflict (user_id, badge_id) do nothing;

  -- Badge première leçon complétée
  select count(*) into v_completed_count from public.progress where user_id = v_user_id and completed = true;
  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'eclair-or' and v_completed_count >= 1
  on conflict (user_id, badge_id) do nothing;

  -- Badge champion : 5 leçons à score parfait (5/5)
  select count(*) into v_score5_count from public.progress where user_id = v_user_id and completed = true and score = 5;
  insert into public.user_badges (user_id, badge_id)
  select v_user_id, id from public.badges where slug = 'champion' and v_score5_count >= 5
  on conflict (user_id, badge_id) do nothing;

  return jsonb_build_object(
    'xp_earned', case when v_already_completed then 0 else coalesce(v_xp_reward, 0) end,
    'total_xp', v_new_total_xp,
    'current_streak', v_current_streak
  );
end;
$$;
