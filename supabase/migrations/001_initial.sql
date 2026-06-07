-- StoryGen V2 initial schema (Phase D2)

create table stories (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('draft', 'saved')),
  title text not null,
  theme text not null,
  learning_goal text not null,
  vocabulary_focus text not null,
  main_events text not null,
  setting text,
  tone text,
  words_to_avoid text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  saved_at timestamptz
);

create table story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  page_number int not null check (page_number between 1 and 12),
  text text not null,
  illustration_prompt text not null,
  unique (story_id, page_number)
);

create table story_vocabulary (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  word text not null,
  definition_or_example text not null,
  sort_order int not null
);

create table series_memory (
  id text primary key,
  summary jsonb not null default '{"characters":[],"settings":[],"recent_stories":[],"vocabulary_history":[],"themes_covered":[],"repetition_notes":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table stories enable row level security;
alter table story_pages enable row level security;
alter table story_vocabulary enable row level security;
alter table series_memory enable row level security;

create policy "Users read own stories" on stories for select using (auth.uid() = created_by);
create policy "Users insert own stories" on stories for insert with check (auth.uid() = created_by);
create policy "Users update own stories" on stories for update using (auth.uid() = created_by);

create policy "Users read own pages" on story_pages for select
  using (exists (select 1 from stories where stories.id = story_pages.story_id and stories.created_by = auth.uid()));
create policy "Users insert own pages" on story_pages for insert
  with check (exists (select 1 from stories where stories.id = story_pages.story_id and stories.created_by = auth.uid()));
create policy "Users update own pages" on story_pages for update
  using (exists (select 1 from stories where stories.id = story_pages.story_id and stories.created_by = auth.uid()));
create policy "Users delete own pages" on story_pages for delete
  using (exists (select 1 from stories where stories.id = story_pages.story_id and stories.created_by = auth.uid()));

create policy "Users read own vocabulary" on story_vocabulary for select
  using (exists (select 1 from stories where stories.id = story_vocabulary.story_id and stories.created_by = auth.uid()));
create policy "Users insert own vocabulary" on story_vocabulary for insert
  with check (exists (select 1 from stories where stories.id = story_vocabulary.story_id and stories.created_by = auth.uid()));
create policy "Users update own vocabulary" on story_vocabulary for update
  using (exists (select 1 from stories where stories.id = story_vocabulary.story_id and stories.created_by = auth.uid()));
create policy "Users delete own vocabulary" on story_vocabulary for delete
  using (exists (select 1 from stories where stories.id = story_vocabulary.story_id and stories.created_by = auth.uid()));

create policy "Authenticated users read series memory" on series_memory for select to authenticated using (true);

insert into series_memory (id, summary) values ('nina-nino', '{"characters":[],"settings":[],"recent_stories":[],"vocabulary_history":[],"themes_covered":[],"repetition_notes":[]}'::jsonb)
on conflict (id) do nothing;
