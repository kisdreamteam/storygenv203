-- Grandma (7th official character) + optional story character hints

insert into character_profiles (
  character_key,
  display_name,
  role,
  appearance_description,
  personality_description,
  factory_appearance,
  factory_personality,
  is_official
) values (
  'grandma',
  'Grandma',
  'Grandmother',
  $grandma_app$grandmother, medium skin tone, gray hair in a neat bun, warm smile, soft lavender áo dài (always), friendly grandmother appearance$grandma_app$,
  $grandma_pers$Warm, nurturing, patient; gentle encouragement; shares family stories with Nina and Nino$grandma_pers$,
  $grandma_app$grandmother, medium skin tone, gray hair in a neat bun, warm smile, soft lavender áo dài (always), friendly grandmother appearance$grandma_app$,
  $grandma_pers$Warm, nurturing, patient; gentle encouragement; shares family stories with Nina and Nino$grandma_pers$,
  true
)
on conflict (character_key) do nothing;

alter table stories
  add column if not exists character_hints jsonb;
