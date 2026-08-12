-- Run this ONLY if you already ran the original schema.sql and have a live
-- project with data in it. It adds the new Bookkeeping / Payroll / Excise /
-- Other Tasks features without touching anything you've already entered.
-- (If you're setting up a brand-new project, just run schema.sql — it
-- already includes everything below, so skip this file.)

alter table clients add column if not exists services text[] not null default '{trucking}';
alter table clients add column if not exists excise_frequency text not null default 'quarterly';

create table if not exists custom_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  label text not null,
  due date,
  status text not null default 'Not Started',
  notes text default '',
  created_at timestamptz default now()
);

alter table custom_tasks enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'custom_tasks' and policyname = 'team can read custom_tasks') then
    create policy "team can read custom_tasks" on custom_tasks for select
      using (exists (select 1 from team_members where user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'custom_tasks' and policyname = 'team can write custom_tasks') then
    create policy "team can write custom_tasks" on custom_tasks for all
      using (exists (select 1 from team_members where user_id = auth.uid()))
      with check (exists (select 1 from team_members where user_id = auth.uid()));
  end if;
end $$;

-- Your existing clients were all trucking clients, so this keeps their
-- checklists exactly as they were before this update.
update clients set services = '{trucking}' where services is null or services = '{}';
