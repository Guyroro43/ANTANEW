-- ANTA — Correction faille : un utilisateur pouvait modifier son propre rôle,
-- son plan d'abonnement ou son XP via l'update RLS de profiles (qui ne
-- restreignait que la ligne, pas les colonnes).
--
-- 1) On retire le droit UPDATE large sur profiles, et on ne le redonne que sur
--    les colonnes réellement auto-modifiables par l'utilisateur.
-- 2) On ajoute une RPC security definer pour les actions admin (changer le
--    rôle ou le plan d'un autre utilisateur), qui vérifie is_admin() en interne.

revoke update on public.profiles from authenticated;
grant update (notifications_enabled) on public.profiles to authenticated;

create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_role text default null,
  p_subscription_plan text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux admins.';
  end if;

  update public.profiles
  set
    role = coalesce(p_role, role),
    subscription_plan = coalesce(p_subscription_plan, subscription_plan)
  where id = p_user_id;
end;
$$;

grant execute on function public.admin_update_profile(uuid, text, text) to authenticated;
