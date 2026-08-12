-- Legacy Compliance Dashboard — database schema
-- Run this once in your Supabase project's SQL editor (Dashboard -> SQL Editor -> New query).

-- 1. Clients table: one row per client. `services` controls which checklist
--    sections apply — trucking, bookkeeping, payroll, excise (any combination).
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'Carrier - Interstate',
  entity_type text default '',
  usdot text default '',
  mc text default '',
  ein text default '',
  ubi text default '',
  ifta text default '',
  oregon text default '',
  formed date,
  irp date,
  ins date,
  units text default '',
  drivers text default '',
  contact text default '',
  phone text default '',
  email text default '',
  ins_carrier text default '',
  consortium text default '',
  eld text default '',
  notes text default '',
  services text[] not null default '{trucking}',
  excise_frequency text not null default 'quarterly', -- 'monthly' | 'quarterly' | 'annual'
  drivers jsonb not null default '[]', -- [{id, name, cdlExpires, medExpires, notes}]
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- 2. Setup checklist status: one row per (client, setup item).
create table if not exists setup_status (
  client_id uuid references clients(id) on delete cascade,
  item_key text not null,
  done boolean default false,
  na boolean default false,
  completed_at date,
  updated_at timestamptz default now(),
  primary key (client_id, item_key)
);

-- 3. Recurring compliance status: one row per (client, item). done_period tracks
--    which due-date cycle was last completed, so the checkbox auto-resets when
--    the item rolls to its next cycle (same logic as the prototype).
create table if not exists recur_status (
  client_id uuid references clients(id) on delete cascade,
  item_key text not null,
  done_period text,
  completed_at date,
  expires_on date,
  updated_at timestamptz default now(),
  primary key (client_id, item_key)
);

-- 4. Hidden items: per-client overrides for recurring items that don't apply.
create table if not exists hidden_items (
  client_id uuid references clients(id) on delete cascade,
  item_key text not null,
  primary key (client_id, item_key)
);

-- 4b. Other tasks: freeform one-off items per client (not auto-calculated).
create table if not exists custom_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  label text not null,
  due date,
  status text not null default 'Not Started',
  notes text default '',
  created_at timestamptz default now()
);

-- 5. Team members: anyone with a row here (matching their auth.users id) can
--    see and edit everything. Add teammates by inserting their user id here
--    after they sign up — see README "Adding a team member".
create table if not exists team_members (
  user_id uuid primary key references auth.users(id),
  display_name text,
  added_at timestamptz default now()
);

-- ---------- Row Level Security: only signed-in team members can touch data ----------
alter table clients enable row level security;
alter table setup_status enable row level security;
alter table recur_status enable row level security;
alter table hidden_items enable row level security;
alter table team_members enable row level security;

create policy "team can read clients" on clients for select
  using (exists (select 1 from team_members where user_id = auth.uid()));
create policy "team can write clients" on clients for all
  using (exists (select 1 from team_members where user_id = auth.uid()))
  with check (exists (select 1 from team_members where user_id = auth.uid()));

create policy "team can read setup_status" on setup_status for select
  using (exists (select 1 from team_members where user_id = auth.uid()));
create policy "team can write setup_status" on setup_status for all
  using (exists (select 1 from team_members where user_id = auth.uid()))
  with check (exists (select 1 from team_members where user_id = auth.uid()));

create policy "team can read recur_status" on recur_status for select
  using (exists (select 1 from team_members where user_id = auth.uid()));
create policy "team can write recur_status" on recur_status for all
  using (exists (select 1 from team_members where user_id = auth.uid()))
  with check (exists (select 1 from team_members where user_id = auth.uid()));

create policy "team can read hidden_items" on hidden_items for select
  using (exists (select 1 from team_members where user_id = auth.uid()));
create policy "team can write hidden_items" on hidden_items for all
  using (exists (select 1 from team_members where user_id = auth.uid()))
  with check (exists (select 1 from team_members where user_id = auth.uid()));

alter table custom_tasks enable row level security;
create policy "team can read custom_tasks" on custom_tasks for select
  using (exists (select 1 from team_members where user_id = auth.uid()));
create policy "team can write custom_tasks" on custom_tasks for all
  using (exists (select 1 from team_members where user_id = auth.uid()))
  with check (exists (select 1 from team_members where user_id = auth.uid()));

create policy "team can read own membership" on team_members for select
  using (auth.uid() = user_id);

-- ---------- Seed your three real clients ----------
insert into clients (name, type, entity_type, usdot, mc, ein, ubi, ifta, oregon, contact, email, notes, services, excise_frequency)
values
  ('BLUE HORSE TRANSPORT LLC', 'Carrier - Interstate', 'LLC', '3461600', 'MC-1130099', '85-1587961', '604-627-519', '0559077', '266255', 'Amandip', 'bluehorsetransportllc@gmail.com', 'DOT PIN on file; credentials in password manager', array['trucking'], 'quarterly'),
  ('SKYLINE BROKERAGE LLC', 'Broker', 'LLC', '3461600', 'MC-1566653', '93-2441705', '605-299-426', '', '', '', 'Brokerageskyline@gmail.com', 'Verify USDOT — currently listed same as Blue Horse', array['trucking'], 'quarterly'),
  ('WHITE TRANS INC', 'Carrier - Interstate', 'C-Corp', '3779411', 'MC-1352365', '87-3527185', '604-825-076', '0514680', '229953', '', 'whitetransinc@gmail.com', '', array['trucking'], 'quarterly')
on conflict do nothing;

-- ---------- After running this, add yourself as a team member ----------
-- 1. Sign up in the deployed app once (creates your auth.users row).
-- 2. Run:  select id, email from auth.users;   -- find your user id
-- 3. Run:  insert into team_members (user_id, display_name) values ('<your-user-id>', 'Harleen');
-- Repeat step 3 for each staff member you add later.
