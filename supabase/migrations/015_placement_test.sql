-- ANTA — Test de niveau automatique à l'inscription.
-- Remplace le champ auto-déclaré "niveau d'anglais" du formulaire d'inscription
-- par une petite évaluation à choix multiples, chronométrée, avec un sujet
-- tiré au hasard par utilisateur.

-- 1) Banque de questions. Table protégée par RLS sans policy : seules les
-- fonctions security definer ci-dessous peuvent la lire (empêche un client
-- de récupérer correct_index directement).
create table if not exists public.placement_questions (
  id uuid primary key default uuid_generate_v4(),
  topic text not null,
  order_index int not null default 0,
  question_text text not null,
  options jsonb not null,
  correct_index int not null,
  created_at timestamptz not null default now()
);

alter table public.placement_questions enable row level security;

-- 2) Suivi par profil : sujet assigné (stable tant que le test n'est pas
-- terminé) et indicateur de complétion.
alter table public.profiles add column if not exists placement_topic text;
alter table public.profiles add column if not exists placement_test_completed boolean not null default false;

-- Les comptes déjà existants ont un niveau auto-déclaré : ne pas leur imposer
-- le test rétroactivement.
update public.profiles set placement_test_completed = true where placement_test_completed = false;

-- 3) Récupère (et assigne si besoin) le sujet de l'utilisateur courant, puis
-- renvoie ses questions SANS correct_index.
create or replace function public.get_placement_test()
returns table(question_id uuid, topic text, order_index int, question_text text, options jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topic text;
begin
  select p.placement_topic into v_topic from public.profiles p where p.id = auth.uid();

  if v_topic is null then
    select pq.topic into v_topic from public.placement_questions pq order by random() limit 1;
    update public.profiles set placement_topic = v_topic where id = auth.uid();
  end if;

  return query
    select pq.id, pq.topic, pq.order_index, pq.question_text, pq.options
    from public.placement_questions pq
    where pq.topic = v_topic
    order by pq.order_index;
end;
$$;

grant execute on function public.get_placement_test() to authenticated;

-- 4) Corrige les réponses côté serveur (jamais confiance au score client),
-- détermine le niveau et met à jour le profil.
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
  v_level text;
  v_answer jsonb;
  v_question_id uuid;
  v_selected int;
  v_correct_index int;
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

    select correct_index into v_correct_index
    from public.placement_questions
    where id = v_question_id and topic = v_topic;

    if v_correct_index is not null and v_selected = v_correct_index then
      v_correct_count := v_correct_count + 1;
    end if;
  end loop;

  v_level := case
    when v_correct_count >= 5 then 'avance'
    when v_correct_count >= 3 then 'intermediaire'
    else 'debutant'
  end;

  update public.profiles
  set english_level = v_level, placement_test_completed = true
  where id = auth.uid();

  return query select v_level, v_correct_count, v_total;
end;
$$;

grant execute on function public.submit_placement_test(jsonb) to authenticated;

-- 5) Banque de questions : 6 sujets × 6 questions, difficulté croissante au
-- sein de chaque sujet. Score sur 6 : 0-2 débutant, 3-4 intermédiaire, 5-6 avancé.

insert into public.placement_questions (topic, order_index, question_text, options, correct_index) values
-- Voyage & Aéroport
('Voyage & Aéroport', 1, 'Comment dit-on « bonjour » en anglais ?', '["Hello", "Goodbye", "Please", "Sorry"]', 0),
('Voyage & Aéroport', 2, 'Complete: I ___ to the airport every morning.', '["go", "goes", "going", "went"]', 0),
('Voyage & Aéroport', 3, 'Quel mot signifie « passeport » en anglais ?', '["Password", "Passenger", "Passport", "Passage"]', 2),
('Voyage & Aéroport', 4, 'Complete: Where ___ you go on holiday last year?', '["do", "did", "does", "were"]', 1),
('Voyage & Aéroport', 5, 'Complete: If I ___ more money, I would travel around the world.', '["have", "has", "had", "having"]', 2),
('Voyage & Aéroport', 6, 'Choose the correct question:', '["Where you are flying to?", "Where are you flying to?", "Where flying you are to?", "You are flying where?"]', 1),

-- Réseaux sociaux & Technologie
('Réseaux sociaux & Technologie', 1, 'Comment dit-on « un ami » en anglais ?', '["A friend", "A neighbor", "A stranger", "A teacher"]', 0),
('Réseaux sociaux & Technologie', 2, 'Complete: She ___ photos on Instagram every day.', '["post", "posts", "posting", "have post"]', 1),
('Réseaux sociaux & Technologie', 3, 'Quel mot signifie « un mot de passe » ?', '["Password", "Passport", "Passage", "Passing"]', 0),
('Réseaux sociaux & Technologie', 4, 'Complete: My phone battery is dead because I ___ it too much yesterday.', '["use", "used", "using", "uses"]', 1),
('Réseaux sociaux & Technologie', 5, 'Complete: By the time she arrives, I ___ the video.', '["finish", "will finish", "will have finished", "finished"]', 2),
('Réseaux sociaux & Technologie', 6, 'Choose the most polite way to ask someone to lower their phone volume in a library:', '["Shut up!", "Could you please lower your volume?", "Stop it now!", "Silence!"]', 1),

-- Cuisine & Marché
('Cuisine & Marché', 1, 'Comment dit-on « un marché » (lieu) en anglais ?', '["A market", "A merchant", "A marching", "A March"]', 0),
('Cuisine & Marché', 2, 'Complete: There ___ some apples in the basket.', '["is", "are", "was", "be"]', 1),
('Cuisine & Marché', 3, 'Quel mot signifie « j''ai faim » ?', '["I am hungry", "I am thirsty", "I am tired", "I am full"]', 0),
('Cuisine & Marché', 4, 'Complete: How ___ rice do you want?', '["many", "much", "few", "some"]', 1),
('Cuisine & Marché', 5, 'Complete: This soup would taste better if it ___ less salty.', '["is", "was", "were", "be"]', 2),
('Cuisine & Marché', 6, 'Choose the correct sentence:', '["I have never ate mango before.", "I have never eaten mango before.", "I never have eating mango before.", "I never eat mango before."]', 1),

-- Sport & Football
('Sport & Football', 1, 'Comment dit-on « un ballon » en anglais ?', '["A ball", "A bell", "A bowl", "A ballot"]', 0),
('Sport & Football', 2, 'Complete: He ___ football every weekend.', '["play", "plays", "playing", "played"]', 1),
('Sport & Football', 3, 'Quel mot signifie « une équipe » ?', '["A team", "A ticket", "A trainer", "A trophy"]', 0),
('Sport & Football', 4, 'Complete: They ___ the match when it started to rain.', '["watch", "watched", "were watching", "have watched"]', 2),
('Sport & Football', 5, 'Complete: ___ she trains every day, she has not improved much.', '["Because", "Although", "So", "If"]', 1),
('Sport & Football', 6, 'Choose the correct sentence:', '["The team who won is from Senegal.", "The team which won is from Senegal.", "The team whom won is from Senegal.", "The team whose won is from Senegal."]', 1),

-- Vie quotidienne & Transport
('Vie quotidienne & Transport', 1, 'Comment dit-on « un bus » en anglais ?', '["A bus", "A boss", "A bush", "A base"]', 0),
('Vie quotidienne & Transport', 2, 'Complete: What time ___ the bus leave?', '["do", "does", "did", "is"]', 1),
('Vie quotidienne & Transport', 3, 'Quel mot signifie « en retard » ?', '["Late", "Early", "Fast", "Slow"]', 0),
('Vie quotidienne & Transport', 4, 'Complete: I usually ___ up at six, but yesterday I ___ up at eight.', '["get / get", "get / got", "got / get", "getting / got"]', 1),
('Vie quotidienne & Transport', 5, 'Complete: The bus ___ by the time we arrived at the station.', '["already left", "has already left", "had already left", "already leaves"]', 2),
('Vie quotidienne & Transport', 6, 'Choose the correct sentence:', '["I wish I had a car.", "I wish I have a car.", "I wish I will have a car.", "I wish I having a car."]', 0),

-- Amis & Famille
('Amis & Famille', 1, 'Comment dit-on « ma mère » en anglais ?', '["My mother", "My brother", "My sister", "My father"]', 0),
('Amis & Famille', 2, 'Complete: My sister ___ in Abidjan.', '["live", "lives", "living", "lived"]', 1),
('Amis & Famille', 3, 'Quel mot signifie « je t''aime » ?', '["I love you", "I like you", "I miss you", "I need you"]', 0),
('Amis & Famille', 4, 'Complete: We ___ friends since we were children.', '["are", "were", "have been", "had been"]', 2),
('Amis & Famille', 5, 'Complete: My brother is the person ___ helped me the most.', '["who", "which", "whose", "whom"]', 0),
('Amis & Famille', 6, 'Choose the correct sentence:', '["Had I known, I would have called you.", "If I had known, I would call you.", "If I know, I would have called you.", "Had I know, I would call you."]', 0);
