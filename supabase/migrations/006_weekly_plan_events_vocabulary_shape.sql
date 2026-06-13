-- weekly_plan jsonb shape (no column change):
-- {
--   "week1": { "events": "...", "vocabulary": "..." },
--   "week2": { "events": "...", "vocabulary": "..." },
--   "week3": { "events": "...", "vocabulary": "..." },
--   "week4": { "events": "...", "vocabulary": "..." }
-- }
--
-- Legacy flat strings { week1: "..." } are normalized at read time in application code.
-- vocabulary_focus text column remains as a derived aggregate for legacy reads and series memory.

comment on column stories.weekly_plan is 'Teacher plan: week1–week4 each with events + vocabulary (jsonb). Weeks are internal planning only.';
