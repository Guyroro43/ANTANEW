-- ANTA — Leçons en blocs (Milestone 1) : permet d'entrelacer librement des
-- blocs "notion" (contenu explicatif) et "qcm" dans une leçon, au lieu du
-- parcours figé actuel (tout le vocabulaire, puis tout le quiz). Strictement
-- additif : les leçons existantes restent en format='legacy', inchangées.
--
-- content jsonb polymorphe (plutôt que des colonnes larges nullable) pour
-- accueillir plus tard de nouveaux block_type ('writing', 'speaking') sans
-- migration structurelle lourde.

alter table public.lessons add column if not exists format text not null default 'legacy'
  check (format in ('legacy', 'blocks'));

create table if not exists public.lesson_blocks (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  block_type text not null check (block_type in ('notion', 'qcm')),
  order_index integer not null default 0,
  status text not null default 'approved' check (status in ('draft', 'approved')),
  source text not null default 'manual' check (source in ('manual', 'ai')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lesson_blocks_lesson_id_order_idx on public.lesson_blocks (lesson_id, order_index);

alter table public.lesson_blocks enable row level security;

create policy "Blocs approuvés visibles par les apprenants"
  on public.lesson_blocks for select
  using (status = 'approved' or public.is_admin());

create policy "Blocs créables par les admins"
  on public.lesson_blocks for insert
  with check (public.can_edit_content());

create policy "Blocs modifiables par les admins"
  on public.lesson_blocks for update
  using (public.can_edit_content());

create policy "Blocs supprimables par les admins"
  on public.lesson_blocks for delete
  using (public.can_edit_content());
