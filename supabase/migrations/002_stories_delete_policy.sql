-- Allow teachers to delete own stories (generate rollback on failed page/vocab insert)

create policy "Users delete own stories" on stories
  for delete using (auth.uid() = created_by);
