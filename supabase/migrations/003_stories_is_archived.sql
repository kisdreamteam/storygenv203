-- Soft delete: hide archived stories from home list

alter table stories
  add column if not exists is_archived boolean not null default false;
