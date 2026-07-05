-- ANTA — Email sur profiles + mise à jour du trigger d'inscription
-- Exécuter dans Supabase : SQL Editor > New query > Run (après 001 et 002)

alter table public.profiles add column if not exists email text;

-- Met à jour le trigger de création de profil pour aussi stocker l'email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, english_level, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'english_level', 'debutant'),
    new.email
  );

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$;

-- Backfill des comptes déjà créés avant cette migration
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;
