-- ANTA — Phase vocabulaire avant le QCM (mot + définition + exemple + audio optionnel).

create table if not exists public.lesson_vocabulary (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  word text not null,
  definition text not null,
  example text,
  audio_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.lesson_vocabulary enable row level security;

create policy "Vocabulaire visible par les connectés"
  on public.lesson_vocabulary for select
  to authenticated
  using (true);

create policy "Vocabulaire créable par les admins"
  on public.lesson_vocabulary for insert
  with check (public.is_admin());

create policy "Vocabulaire modifiable par les admins"
  on public.lesson_vocabulary for update
  using (public.is_admin());

create policy "Vocabulaire supprimable par les admins"
  on public.lesson_vocabulary for delete
  using (public.is_admin());
