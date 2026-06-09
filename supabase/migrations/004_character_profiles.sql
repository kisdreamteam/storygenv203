-- Editable Characters Phase 1 — database foundation (Step 1)
-- Factory values from docs/before-coding/character-bible.md §3 and §14

create table character_profiles (
  id uuid primary key default gen_random_uuid(),
  character_key text not null unique,
  display_name text not null,
  role text not null,
  appearance_description text not null,
  personality_description text not null,
  factory_appearance text not null,
  factory_personality text not null,
  is_official boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table character_profiles enable row level security;

create policy "Authenticated users read character profiles"
  on character_profiles for select
  to authenticated
  using (true);

create policy "Authenticated users update character profiles"
  on character_profiles for update
  to authenticated
  using (true)
  with check (true);

insert into character_profiles (
  character_key,
  display_name,
  role,
  appearance_description,
  personality_description,
  factory_appearance,
  factory_personality,
  is_official
) values
(
  'nina',
  'Nina',
  'Older sister',
  $nina_app$6-year-old girl, medium skin tone, dark brown hair in two neat pigtails, bright red t-shirt, dark red shorts, white socks, red sneakers, brown eyes, warm friendly smile$nina_app$,
  $nina_pers$Curious, patient, encouraging; short clear sentences; praises Nino's efforts$nina_pers$,
  $nina_app$6-year-old girl, medium skin tone, dark brown hair in two neat pigtails, bright red t-shirt, dark red shorts, white socks, red sneakers, brown eyes, warm friendly smile$nina_app$,
  $nina_pers$Curious, patient, encouraging; short clear sentences; praises Nino's efforts$nina_pers$,
  true
),
(
  'nino',
  'Nino',
  'Younger brother',
  $nino_app$4-year-old boy, medium skin tone, short messy warm-brown hair, light green t-shirt, dark green shorts, white socks, green sneakers, brown eyes, curious cheerful expression$nino_app$,
  $nino_pers$Playful, eager, sometimes impulsive; simple phrases; repeats new words$nino_pers$,
  $nino_app$4-year-old boy, medium skin tone, short messy warm-brown hair, light green t-shirt, dark green shorts, white socks, green sneakers, brown eyes, curious cheerful expression$nino_app$,
  $nino_pers$Playful, eager, sometimes impulsive; simple phrases; repeats new words$nino_pers$,
  true
),
(
  'mom',
  'Mom',
  'Mother',
  $mom_app$woman, medium skin tone, dark hair, warm smile, yellow áo dài (always)$mom_app$,
  $mom_pers$Calm, warm, practical, supportive; reassuring simple explanations$mom_pers$,
  $mom_app$woman, medium skin tone, dark hair, warm smile, yellow áo dài (always)$mom_app$,
  $mom_pers$Calm, warm, practical, supportive; reassuring simple explanations$mom_pers$,
  true
),
(
  'dad',
  'Dad',
  'Father',
  $dad_app$man, medium skin tone, short dark hair, friendly face, light navy polo shirt, khaki pants, brown casual shoes, warm smile$dad_app$,
  $dad_pers$Friendly, playful, dependable; encouraging; models helpful actions$dad_pers$,
  $dad_app$man, medium skin tone, short dark hair, friendly face, light navy polo shirt, khaki pants, brown casual shoes, warm smile$dad_app$,
  $dad_pers$Friendly, playful, dependable; encouraging; models helpful actions$dad_pers$,
  true
),
(
  'grandpa',
  'Grandpa',
  'Grandfather',
  $grandpa_app$grandfather, white beard, brown cap, denim overalls, warm smile, friendly grandfather appearance$grandpa_app$,
  $grandpa_pers$Warm, patient, gentle humor; shares simple wisdom with Nina and Nino$grandpa_pers$,
  $grandpa_app$grandfather, white beard, brown cap, denim overalls, warm smile, friendly grandfather appearance$grandpa_app$,
  $grandpa_pers$Warm, patient, gentle humor; shares simple wisdom with Nina and Nino$grandpa_pers$,
  true
),
(
  'ms_lee',
  'Ms. Lee',
  'Teacher',
  $ms_lee_app$adult female teacher, medium skin tone, dark hair, friendly expression, light blue blouse, dark navy slacks, black flat shoes$ms_lee_app$,
  $ms_lee_pers$Kind, organized, enthusiastic about learning$ms_lee_pers$,
  $ms_lee_app$adult female teacher, medium skin tone, dark hair, friendly expression, light blue blouse, dark navy slacks, black flat shoes$ms_lee_app$,
  $ms_lee_pers$Kind, organized, enthusiastic about learning$ms_lee_pers$,
  true
)
on conflict (character_key) do nothing;
