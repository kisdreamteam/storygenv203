-- Weekly story planning: Topic + Week 1–4 milestones (replaces Main Events input model)

alter table stories
  add column if not exists weekly_plan jsonb;

comment on column stories.weekly_plan is
  'Teacher weekly plan: { week1, week2, week3, week4 }. main_events kept for legacy sync.';
